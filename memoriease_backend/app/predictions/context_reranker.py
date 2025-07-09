from transformers import AutoModelForSequenceClassification
import torch.nn as nn
from app.config import HOST, RAG_INDICES
import requests
import json
import torch
import logging
import os


logging.basicConfig(filename='memoriease_backend_lsc25.log', level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s')


device = torch.device("cuda") if torch.cuda.is_available() else "cpu"
class Reranker_Finetuning(nn.Module):
    def __init__(self, model_name, num_labels=1, dropout_prob=0.3):
        super(Reranker_Finetuning, self).__init__()
        
        # BERT model for text processing
        self.model = AutoModelForSequenceClassification.from_pretrained(
            model_name, num_labels=num_labels
        )

    def forward(self, input_ids, attention_mask, labels=None):
        # BERT Forward
        outputs = self.model(input_ids=input_ids, attention_mask=attention_mask)
        logits = outputs.logits
        loss = None

        if labels is not None:
            loss_fn = nn.BCEWithLogitsLoss()
            loss = loss_fn(logits.squeeze(), labels.float())

        return (loss, logits) if loss is not None else logits
    

def hybrid_search(query_vector, query, filter, size=100):
    url = f"{HOST}/{RAG_INDICES}/_search"
    query = {
        "size": size,
        "_source": ["ImageID", "context", "local_time", "new_name", "city", "day_of_week"],
        "query": {
            "bool": {
                "must": [
                    {
                        "match": {
                            "context": {
                                "query": query,
                                "boost": 0
                            }
                        }
                    }
                ],
                "filter": filter  # Ensure 'filter' is a list of conditions like [{"term": {"city": "Dublin"}}]
            }
        },
        "knn": {
            "field": "clip_embed",
            "query_vector": query_vector.tolist(),
            "k": size,
            "filter": filter,
            "num_candidates": 1000,
            "boost": 1
        }
    }



    response = requests.get(url, data=json.dumps(query), headers={"Content-Type": "application/json"})
    results = response.json()
    return results


def rerank_retrieved_data(query, retrieved_data, model, tokenizer, top_k, max_length=128):
    """
    Rerank retrieved data based on query relevance using a cross-encoder model.
    
    Args:
        query (str): The input query.
        retrieved_data (list): List of documents (strings) to be reranked.
        model_path (str): Path to the fine-tuned model.
        max_length (int): Maximum token length for the model input.
        top_k (int, optional): Number of top results to return. If None, returns all reranked results.
    
    Returns:
        list: A list of tuples (document, score), sorted by descending relevance score.
    """
    # Load the fine-tuned model and tokenizer
    # Prepare inputs and compute scores
    logging.info(f"Reranking {len(retrieved_data['hits']['hits'])} documents for query: {query}")
    scores = []
    for doc in retrieved_data['hits']['hits']:
        context = doc['_source']['context']
        ImageID = doc['_source']['ImageID']
        local_time = doc['_source']['local_time']
        new_name = doc['_source']['new_name']
        city = doc['_source']['city']
        day_of_week = doc['_source']['day_of_week']
        inputs = tokenizer(
            query, context,
            max_length=max_length,
            padding="max_length",
            truncation=True,
            return_tensors="pt"
        )
        inputs.pop("token_type_ids", None)
        inputs = {k: v.to(device) for k, v in inputs.items()}
        with torch.no_grad():
            output = model(**inputs)
            score = output.item()
            scores.append((ImageID, context, score, local_time, new_name, city, day_of_week))

    reranked_results = sorted(scores, key=lambda x: x[2], reverse=True)
    # form a dictionary with ImageID, context and score as key
    reranked_results = [{"_source": {'ImageID': result[0], 'context': result[1], 'score': result[2], 
                         'local_time': result[3], 'new_name': result[4], 'city': result[5],
                         'day_of_week': result[6]}} for result in reranked_results]
    
    if top_k:
        reranked_results = reranked_results[:top_k]
    return reranked_results

import torch
from fastapi import APIRouter, Depends, status
from fastapi.openapi.models import APIKey
from sentence_transformers import SentenceTransformer
import open_clip
from lavis.models import load_model_and_preprocess
from app.api_key import get_api_key
from app.apis.api_utils import RequestTimestampMiddleware, add_image_link
from app.predictions.chat_conversation import chat
from app.predictions.temporal_predict import temporal_search
from .schemas import (
    FeatureModelSingleSearch,
    FeatureModelTemporalSearch,
    FeatureModelConversationalSearch,
    FeatureModelVisualSimilarity
)
import json
import logging
from app.predictions.context_reranker import Reranker_Finetuning
from transformers import AutoTokenizer
from app.config import HOST, INDICES, settings
from app.predictions.visual_similarity import relevance_image_similar, calculate_mean_emb
from app.predictions.utils import send_request_to_elasticsearch
from app.predictions.predict import retrieve_image
from app.predictions.rag_question_answering import rag_question_answering
from app.predictions.log_ntcir import log_lsc25_result
logging.basicConfig(filename='memoriease_backend_lsc25.log', level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s')
router = APIRouter()


# Function to initialize resources
def initialize_resources():
    # Load resource in the start
    global es, model, vis_processors, txt_processor, logger
    global embedding_model, tokenizer, device
    global clip_model, clip_tokenizer, reranking_model, reranking_tokenizer

    device = torch.device("cuda") if torch.cuda.is_available() else "cpu"
    model, vis_processors, txt_processor = load_model_and_preprocess(
        name="blip2_feature_extractor", model_type="coco", is_eval=True, device=device
    )

    clip_model, _, clip_preprocess = open_clip.create_model_and_transforms('ViT-H-14', pretrained='laion2b_s32b_b79k')
    model.eval()  # model in train mode by default, impacts some models with BatchNorm or stochastic depth active
    clip_tokenizer = open_clip.get_tokenizer('ViT-H-14')

    model_name = "cross-encoder/ms-marco-MiniLM-L-6-v2"  # Replace with desired pretrained model
    reranking_tokenizer = AutoTokenizer.from_pretrained(model_name)
    reranking_model = Reranker_Finetuning(model_name)
    # reranking_model.load_state_dict(torch.load(settings.model_reranker_path, map_location=device))
    reranking_model.to(device)
    logging.info(f'Loading models successfully at {device}')


@router.post(
    "/predict_temporal",
    status_code=status.HTTP_200_OK,
)
async def predict_image_temporal(feature: FeatureModelTemporalSearch, api_key: APIKey = Depends(get_api_key)):
    # Predict temporal
    # Input: before, main, after event, filters
    # Output: list of dicts with three keys: current_event, previous_event, after_event
    query = feature.query
    semantic_name = feature.semantic_name
    logging.info(f"TEMPORAL SEARCH: Received query: {query} with semantic name: {semantic_name}")
    # Perform search
    results = temporal_search(concept_query=query, embed_model=model, txt_processor=txt_processor,
                              clip_model=clip_model, clip_tokenizer=clip_tokenizer,
                              previous_event=feature.previous_event,
                              next_event=feature.next_event, time_gap=feature.time_gap,
                              semantic_name=semantic_name)
    results = add_image_link(results)
    logging.info(f"TEMPORAL SEARCH: Results: {results}")
    log_lsc25_result(query=query, results=results)
    return results


@router.post(
    "/predict",
    status_code=status.HTTP_200_OK,
)
async def predict_image(feature: FeatureModelSingleSearch, api_key: APIKey = Depends(get_api_key)):
    # Predict single moment
    # Input: query, filters
    # Output: list of dicts with 1 keys: current_event
    query = feature.query
    semantic_name = feature.semantic_name

    
    # semantic_name = feature.semantic_name
    # start_hour = feature.start_hour
    # end_hour = feature.end_hour
    # is_weekend = feature.is_weekend
    logging.info(f"SINGLE SEARCH: Received query: {query} with semantic name: {semantic_name}")
    # Perform search
    raw_result = retrieve_image(concept_query=query, embed_model=model, txt_processor=txt_processor,
                                clip_model=clip_model, clip_tokenizer=clip_tokenizer,
                                semantic_name=semantic_name, size=200)
    results = [{'current_event': result} for result in raw_result['hits']['hits']]
    results = add_image_link(results)
    log_lsc25_result(query=query, results=results)
    logging.info(f"SINGLE SEARCH: Results: {results}")

    return results


@router.post(
    "/conversational_search",
    status_code=status.HTTP_200_OK,
)
async def conversation_search(feature: FeatureModelConversationalSearch, api_key: APIKey = Depends(get_api_key)):
    # Chat to retrieve images
    # Input: query, previous chat of users
    # Output: the list of results and textual answer
    query = feature.query
    previous_chat = feature.previous_chat
    logging.info(f"CONVERSATIONAL SEARCH: Received query: {query} with previous chat: {previous_chat}")
    if '?' in query:
        # perform RAG
        result, return_answer = rag_question_answering(query=query, previous_chat=previous_chat,
                                                       blip_model=model,
                                                       txt_processor=txt_processor, clip_model=clip_model,
                                                       clip_tokenizer=clip_tokenizer, reranking_model=reranking_model,
                                                       reranking_tokenizer=reranking_tokenizer)
    else:
        result, return_answer = chat(query=query, previous_chat=previous_chat, model=model,
                                     txt_processors=txt_processor, clip_model=clip_model,
                                     clip_tokenizer=clip_tokenizer)
    output_dict = {'results': result, 'textual_answer': return_answer}
    log_lsc25_result(query=query, results=result)
    logging.info(f"CONVERSATIONAL SEARCH: Results: {result} with answer: {return_answer}")
    return output_dict


@router.post(
    "/visual_similarity",
    status_code=status.HTTP_200_OK,
)
async def visual_similarity(feature: FeatureModelVisualSimilarity, api_key: APIKey = Depends(get_api_key)):
    # Relevance feedback with embedding similarity search
    # Input: query and filters for search and filters, image_id for embedding similarity.
    # Output: list of dict with key current_event.
    query = feature.query
    image_id = feature.image_id
    logging.info(f"VISUAL SIMILARITY: Received query: {query} with image_id: {image_id}")
    
    if query == '' and len(image_id) == 0:
        # return ramdom 100 images id
        col = ["ImageID", "new_name", 'event_id', 'local_time', 'day_of_week', 'similar_image']
        query_template = {
            "query": {
                "function_score": {
                    "query": {"match_all": {}},
                    "functions": [{"random_score": {}}]
                }
            },
            "_source": col, "size": 200}
        query_template = json.dumps(query_template)
        raw_result = send_request_to_elasticsearch(HOST, INDICES, query_template)
    elif query != '' and len(image_id) == 0:
        # retrieve by query
        raw_result = retrieve_image(concept_query=query, embed_model=model, txt_processor=txt_processor,
                                    clip_model=clip_model, clip_tokenizer=clip_tokenizer, size=200)
        # raw_result = pseudo_relevance_feedback(concept_query=query, embed_model=model, txt_processor=txt_processor, 
        #                                        clip_model=clip_model, clip_tokenizer=clip_tokenizer)
    else:
        # Calculate the mean embedding of all image input
        mean_embedding = calculate_mean_emb(image_id=image_id)
        # Perform search by image embedding
        raw_result = relevance_image_similar(image_embedding=mean_embedding, query=query, image_id=image_id, size=200)
    results = [{'current_event': result} for result in raw_result['hits']['hits']]
    # log_ntcir_result(run_id=run_id, topic_id=topic_id, results=results)
    results = add_image_link(results)
    logging.info(f"VISUAL SIMILARITY: Results: {results}")
    log_lsc25_result(query=str(query) + " " + str(image_id), results=results)
    return results


def include_router(app):
    app.include_router(router)
    app.add_middleware(RequestTimestampMiddleware, router_path='/predict')


initialize_resources()

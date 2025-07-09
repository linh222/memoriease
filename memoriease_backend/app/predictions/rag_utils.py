from app.predictions.blip_extractor import extract_query_clip_embedding
from app.predictions.utils import process_query, construct_filter, extract_question_component, extract_advanced_filter, add_advanced_filters
from app.predictions.context_reranker import rerank_retrieved_data, hybrid_search

def rag_retriever(question, size, clip_model, clip_tokenizer, reranking_model, reranking_tokenizer):
    # retrieved_context = text_search(question, size)
    context_query_return, _, _ = \
        extract_question_component(question)
    returned_query, advanced_filters = extract_advanced_filter(context_query_return)
    processed_query, list_keyword, time_period, weekday, time_filter, location = process_query(returned_query)
    query_dict = {
        "time_period": time_period,
        "location": location,
        "list_keyword": list_keyword,
        "weekday": weekday,
        "time_filter": time_filter
    }
    if len(advanced_filters) > 0:
        query_dict = add_advanced_filters(advanced_filters, query_dict)
    clip_text_embedding = extract_query_clip_embedding(question, clip_model, clip_tokenizer)
    filters = construct_filter(query_dict)

    retrieved_context = hybrid_search(clip_text_embedding, processed_query, filters, size)

    # Rerank the retrieved data
    reranked_result = rerank_retrieved_data(question, retrieved_context, reranking_model, reranking_tokenizer, size)
    return reranked_result


def question_classification(question: str):
    # Classify the question to visual or metadata related question
    # Input: question
    # Output: type = 0 -> visual question, type = 1 -> metadata question, type = -1: unknown
    question_lower = question.lower()

    visual_keywords = ["what", "who", "why"]
    metadata_keywords = ["where", "when", "how many", "how much", "what date", "what did", 'which']

    for keyword in metadata_keywords:
        if keyword in question_lower:
            return 1
    for keyword in visual_keywords:
        if keyword in question_lower:
            return 0
    return -1


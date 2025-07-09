import json
import logging
import os
from functools import lru_cache
from typing import List, Dict, Tuple, Any

import openai
import torch
from dotenv import load_dotenv
from openai import OpenAI

from app.config import HOST, INDICES, root_path, settings
from app.apis.api_utils import add_image_link
from app.predictions.chat_conversation import aggregate_multiround_chat
from app.predictions.blip_extractor import extract_query_blip_embedding, extract_query_clip_embedding
from app.predictions.utils import (
    process_query, 
    construct_filter, 
    build_query_template, 
    send_request_to_elasticsearch,
    extract_advanced_filter, 
    add_advanced_filters, 
    extract_question_component, 
    add_image_path, 
    encode_image
)
from app.predictions.rag_utils import rag_retriever, question_classification

# Configure logging
logging.basicConfig(
    filename='memoriease_backend_lsc25.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# Load environment variables
load_dotenv(str(root_path) + '/.env')
openai.api_key = os.getenv("OPENAI_API_KEY")

# Initialize OpenAI client once
client = OpenAI()

# Cache for encoded images
IMAGE_CACHE = {}

@lru_cache(maxsize=1000)
def get_encoded_image(image_path: str) -> str:
    """Cache encoded images to avoid repeated encoding."""
    if image_path not in IMAGE_CACHE:
        IMAGE_CACHE[image_path] = encode_image(image_path)
    return IMAGE_CACHE[image_path]

def ask_llm(prompt: str, model: str = "gpt-4.1-mini") -> str:
    """Make OpenAI API calls with error handling."""
    logging.info(f"ask_llm for Rag QA: Sending prompt to model {model}: {prompt}")
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant that can answer the question based on the provided context. Reasoning over the provided data to find correct information for question. Provide a short answer with short explanation. Suppose the word I see is you are experience that."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=1,
            max_tokens=1024,
            top_p=1,
            frequency_penalty=0,
            presence_penalty=0
        )
        logging.info(f"ask_llm for Rag QA: Received response: {response.choices[0].message.content}")
        return response.choices[0].message.content
    except Exception as e:
        logging.error(f"Error in ask_llm: {str(e)}")
        raise

def ask_llm_image(question: str, image_urls: List[str]) -> str:
    """Process visual questions with error handling and optimized image handling."""
    try:
        logging.info(f"ask_llm_image: Sending question: {question} with {len(image_urls)} images")
        content = [{"type": "text", "text": f"Questions: {question}"}]
        image_paths = [
            link for link in image_urls
        ]
        
        # Batch process images
        for path in image_paths:
            encoded_image = get_encoded_image(path)
            content.append({
                "type": "image_url",
                'image_url': {
                    'url': f"data:image/webp;base64,{encoded_image}",
                    "detail": "low"
                }
            })

        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful visual question-answering assistant. You are provided with several images and a question. Reasoning yourself to choose the correct image that provides an answer to the question and gives me a textual answer. Provide a short answer with short explanation."
                },
                {
                    "role": "user",
                    "content": content
                }
            ],
            max_tokens=300,
        )
        logging.info(f"ask_llm_image: Received response: {response.choices[0].message.content}")
        return response.choices[0].message.content
    except Exception as e:
        logging.error(f"Error in ask_llm_image: {str(e)}")
        raise

def create_prompt(question: str, relevant_document: List[Dict], results: List[Dict]) -> List[Dict]:
    """Create prompt with optimized image handling."""
    content = [{"type": "text", "text": f"Question: {question}"}]
    encoded_image = {}
    
    # Process relevant documents
    for hit in relevant_document:
        source = hit['_source']
        image_id = source['ImageID']
        if image_id not in encoded_image:
            encoded_image[image_id] = get_encoded_image(source['image_path'])
            
        content.extend([
            {"type": "text", "text": f"ImageID {image_id}:  {source['context']} \n"},
            {"type": "image_url", 'image_url': {'url': f"data:image/webp;base64,{encoded_image[image_id]}", "detail": "low"}}
        ])

    # Process results
    for result in results:
        source = result['_source']
        image_id = source['ImageID']
        if image_id not in encoded_image:
            encoded_image[image_id] = get_encoded_image(source['image_path'])
            
        content.extend([
            {"type": "text", "text": f"ImageID {image_id}: {source['local_time']} in {source['new_name']} in {source['city']} \n"},
            {"type": "image_url", 'image_url': {'url': f"data:image/webp;base64,{encoded_image[image_id]}", "detail": "low"}}
        ])
    
    return content

def RAG(
    question: str,
    blip_model: Any,
    txt_processor: Any,
    clip_model: Any,
    clip_tokenizer: Any,
    reranking_model: Any,
    reranking_tokenizer: Any
) -> Tuple[List[Dict], str]:
    """
    Retrieve and generate answer using RAG (Retrieval Augmented Generation).
    
    Args:
        question: The input question
        blip_model: BLIP model for image understanding
        txt_processor: Text processor for BLIP
        clip_model: CLIP model for image-text matching
        clip_tokenizer: CLIP tokenizer
        reranking_model: Model for reranking results
        reranking_tokenizer: Tokenizer for reranking model
        
    Returns:
        Tuple of retrieved results and textual answer
    """
    try:
        # Retrieve episode event
        relevant_document = rag_retriever(
            question, 
            30, 
            clip_model, 
            clip_tokenizer, 
            reranking_model, 
            reranking_tokenizer
        )
        logging.info(f"RAG: Relevant documents for question: {question} \n {relevant_document}")
        # Process query components
        context_query_return, question_to_ask_return, _ = extract_question_component(question)
        returned_query, advanced_filters = extract_advanced_filter(context_query_return)
        logging.info(f"RAG: Processing query: {returned_query}, filters: {advanced_filters}")

        # Generate embeddings
        processed_query, list_keyword, time_period, weekday, time_filter, location = process_query(returned_query)
        blip_text_embedding = extract_query_blip_embedding(processed_query, blip_model, txt_processor)
        clip_text_embedding = extract_query_clip_embedding(processed_query, clip_model, clip_tokenizer)

        # Build query
        query_dict = {
            "time_period": time_period,
            "location": location,
            "list_keyword": list_keyword,
            "weekday": weekday,
            "time_filter": time_filter
        }
        
        if advanced_filters:
            query_dict = add_advanced_filters(advanced_filters, query_dict)
            
        filters = construct_filter(query_dict)
        
        # Execute elasticsearch query
        col = ["day_of_week", "ImageID", "local_time", "new_name", 'description', 'event_id', 'city']
        query_template = build_query_template(
            filters, 
            blip_text_embedding, 
            clip_text_embedding, 
            size=10, 
            col=col
        )
        # logging.info(f"RAG: Query template: {query_template}")
        results = send_request_to_elasticsearch(HOST, INDICES, json.dumps(query_template))
        logging.info(f"RAG: Retrieved for images {results['hits']['hits']} results from elasticsearch.")
        # Process results
        logging.info(f"RAG: Combine both visual and image relevant documents.")
        retrieved_result = []
        for hit in results['hits']['hits']:
            source = hit['_source']
            extracted_source = {
                'ImageID': source['ImageID'],
                'new_name': source['new_name'],
                'city': source['city'],
                'event_id': source['event_id'],
                'local_time': source['local_time'],
                'day_of_week': source['day_of_week'],
                'description': source['description']
            }
            retrieved_result.append({
                "_index": hit["_index"],
                "_id": hit["_id"],
                "_score": hit["_score"],
                "_source": extracted_source
            })

        for hit in relevant_document:
            hit = hit['_source']
            extracted_source = {
                'ImageID': hit['ImageID'],
                'new_name': hit['new_name'],
                'city': hit['city'],
                'local_time': hit['local_time'],
                'day_of_week': hit['day_of_week'],
                'description': hit['context']
            }
            retrieved_result.append({
                "_score": hit["score"],
                "_source": extracted_source
            })
        logging.info(f"RAG: Retrieved {len(retrieved_result)} results from both visual and image queries.")
        # Format results
        retrieved_result = [{'current_event': each_result} for each_result in retrieved_result]
        retrieved_result = add_image_link(retrieved_result)
        
        # Add image paths
        relevant_document = add_image_path(relevant_document)
        results = add_image_path(results['hits']['hits'])
        
        # Generate answer
        prompt = create_prompt(question_to_ask_return, relevant_document, results)
        answer = ask_llm(prompt)
        
        return retrieved_result, answer
        
    except Exception as e:
        logging.error(f"Error in RAG: {str(e)}")
        raise

def visual_QA(
    question: str,
    blip_model: Any,
    txt_processor: Any,
    clip_model: Any,
    clip_tokenizer: Any
) -> Tuple[List[Dict], str]:
    """
    Perform visual question answering.
    
    Args:
        question: The input question
        blip_model: BLIP model for image understanding
        txt_processor: Text processor for BLIP
        clip_model: CLIP model for image-text matching
        clip_tokenizer: CLIP tokenizer
        
    Returns:
        Tuple of retrieved results and answer
    """
    try:
        # Extract question components
        context_query_return, question_to_ask_return, _ = extract_question_component(question)
        processed_query, list_keyword, time_period, weekday, time_filter, location = process_query(context_query_return)
        logging.info(f"Visual QA: Processed query: {processed_query}, keywords: {list_keyword}, time period: {time_period}, weekday: {weekday}, time filter: {time_filter}, location: {location}")
        # Generate embeddings
        blip_text_embedding = extract_query_blip_embedding(processed_query, blip_model, txt_processor)
        clip_text_embedding = extract_query_clip_embedding(processed_query, clip_model, clip_tokenizer)

        # Build query
        query_dict = {
            "time_period": time_period,
            "location": location,
            "list_keyword": list_keyword,
            "weekday": weekday,
            "time_filter": time_filter
        }
        
        filters = construct_filter(query_dict)
        col = ["day_of_week", "ImageID", "local_time", "new_name", 'description', 'event_id', 'city']
        
        # Execute elasticsearch query
        query_template = build_query_template(
            filters, 
            blip_text_embedding, 
            clip_text_embedding, 
            size=10, 
            col=col
        )
        results = send_request_to_elasticsearch(HOST, INDICES, json.dumps(query_template))
        
        # Format results
        results = [{'current_event': result} for result in results['hits']['hits']]
        results_with_links = add_image_link(results)
        image_urls = [result['current_event']['_source']['image_link'] for result in results_with_links]
        logging.info(f"Visual QA: Retrieved {results_with_links}.")
        # Generate answer
        answer = ask_llm_image(question_to_ask_return, image_urls)
        
        return results, answer
        
    except Exception as e:
        logging.error(f"Error in visual_QA: {str(e)}")
        raise

def rag_question_answering(
    query: str,
    previous_chat: str,
    blip_model: Any,
    txt_processor: Any,
    clip_model: Any,
    clip_tokenizer: Any,
    reranking_model: Any,
    reranking_tokenizer: Any
) -> Tuple[List[Dict], str]:
    """
    Main entry point for question answering system.
    
    Args:
        query: User's question
        previous_chat: Previous conversation context
        blip_model: BLIP model for image understanding
        txt_processor: Text processor for BLIP
        clip_model: CLIP model for image-text matching
        clip_tokenizer: CLIP tokenizer
        reranking_model: Model for reranking results
        reranking_tokenizer: Tokenizer for reranking model
        
    Returns:
        Tuple of retrieved results and answer
    """
    try:
        # Aggregate chat context
        retrieving_query = aggregate_multiround_chat(previous_chat=previous_chat, current_chat=query)
        logging.info(f"QA: Aggregated query {retrieving_query}")
        
        # Classify question type
        question_type = question_classification(retrieving_query)
        logging.info(f"QA: Question type: {question_type}")
        
        if question_type == 0:
            logging.info("QA: Starting visual QA")
            retrieved_result, answer = visual_QA(
                retrieving_query,
                blip_model,
                txt_processor,
                clip_model,
                clip_tokenizer
            )
        else:
            retrieved_result, answer = RAG(
                retrieving_query,
                blip_model,
                txt_processor,
                clip_model,
                clip_tokenizer,
                reranking_model,
                reranking_tokenizer
            )
            
        return retrieved_result, answer
        
    except Exception as e:
        logging.error(f"Error in rag_question_answering: {str(e)}")
        raise


import logging
import os

import openai
from dotenv import load_dotenv
from openai import OpenAI

from app.apis.api_utils import add_image_link
from app.config import root_path
from app.predictions.predict import retrieve_image
from app.predictions.temporal_predict import temporal_search
from app.predictions.utils import temporal_extraction

logging.basicConfig(filename='memoriease_backend_lsc25.log', level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s')
load_dotenv(str(root_path) + '/.env')
openai.api_key = os.getenv("OPENAI_API_KEY")


def textual_answer(query):
    client = OpenAI()
    logging.info(f'Textual answer for chat conversation: Received query: {query}')
    response = client.chat.completions.create(
        model="gpt-4.1-nano",
        messages=[
            {
                "role": "system",
                "content": "Acting as you are a multi-modal lifelog retrieval assistant that can display or search "
                           "content and you have already found the results from the user query and displayed lifelog "
                           "images and information in the interface. You have full access to the system and you "
                           "already displayed all of the images from the users query on the right side of the "
                           "interface already. Give an answer that you already found the results from the user query "
                           "and showed on the interface.\nHere are some examples and you should follow "
                           "strictly:\nUsers: Find the moment when I reached the edge of a lake. It was a cold day "
                           "spring in Wicklow in 2019. Before that, I have a short relaxing walk.\nAssistant: I have "
                           "found all the moments when you reached the edge of a lake on a cold spring day in Wicklow "
                           "in 2019. Before that, you had a short relaxing walk. Please take a look at the images on "
                           "the right side of the display to revisit those memories. If you need more details or "
                           "specific information about any particular moment, feel free to ask!\nUsers: I was in a "
                           "cinema\nAssistant: I apologize for the confusion. It seems that I may have misunderstood "
                           "your query. Unfortunately, I do not have access to the specific details of your past "
                           "activities such as going to the cinema. I can only display and search the content that is "
                           "available in the lifelog database. If you have any other queries or if there's anything "
                           "else I can assist you with, please let me know."
            },
            {
                "role": "user",
                "content": query
            }
        ],
        temperature=1,
        max_tokens=256,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0
    )
    logging.info(f'Textual answer for chat conversation: Response: {response.choices[0].message.content}')
    return response.choices[0].message.content


def aggregate_multiround_chat(current_chat, previous_chat=None):
    if previous_chat is None:
        previous_chat = []
    logging.info(f'Aggregate multi-round chat: Current chat: {current_chat}, Previous chat: {previous_chat}')
    previous_chat.append(current_chat)
    client = OpenAI()
    response = client.chat.completions.create(
        model="gpt-4.1-nano",
        messages=[
            {
                "role": "system",
                "content": "You are a helpful dialogue-processing assistant who can aggregate information from "
                           "multiple chats in a dialogue to produce a single query. For example:\nUsers: ['Find for "
                           "me all times I was on the beach in Thailand', 'in 2020', 'I remember I walked from my "
                           "hotel to the beach']\nOutput: Find for me all the times I was on the beach in Thailand in "
                           "2020. I walk from my hotel to the beach"
            },
            {
                "role": "user",
                "content": str(previous_chat)
            }
        ],
        temperature=1,
        max_tokens=512,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0
    )
    logging.info(f'Aggregate multi-round chat: Response: {response.choices[0].message.content}')
    return response.choices[0].message.content


def chat(query: str, previous_chat: list, model, txt_processors, clip_model, clip_tokenizer):
    # Function to perform a chat with the model
    # Input:
    #   Query: The current query from users
    #   Previous chat: the previous queries from users
    logging.info(f'Chat: Received query {query}, with previous chat: {previous_chat}')
    if query == '':
        raise ValueError('Empty string')
    else:
        pass

    retrieving_query = query

    if len(previous_chat) > 0:
        logging.info('Chat: Multi round search')
        # Aggregate all previous chat to check if the previous chat and current query are in the same topic
        # formatted_previous_chat = formulate_previous_chat(previous_chat)
        retrieving_query = aggregate_multiround_chat(previous_chat=previous_chat, current_chat=query)
        # response_verify_query = eval(response_verify_query.choices[0].message.content)
        # if response_verify_query['same_topic']:
        #     retrieving_query = response_verify_query['query']

    # Extract the temporal query by rule-based
    main_event, previous_event, next_event = temporal_extraction(retrieving_query)
    logging.info(f"Chat: Extracted event. Main event: {main_event}, previous_event: {previous_event}, "
                 f"next event: {next_event}")
    # Single event retrieval
    if previous_event == '' and next_event == '':
        result = retrieve_image(concept_query=main_event, embed_model=model, txt_processor=txt_processors, 
                                clip_model=clip_model, clip_tokenizer=clip_tokenizer, size=100)
        result = [{'current_event': each_result} for each_result in result['hits']['hits']]

    else:
        # Multi round retrieval
        result = temporal_search(concept_query=main_event, embed_model=model, txt_processor=txt_processors,
                                 clip_model=clip_model, clip_tokenizer=clip_tokenizer,
                                 previous_event=previous_event, next_event=next_event)
    # add image link
    result = add_image_link(result)
    # Step 3: Ask for response
    return_answer = 'I am so sorry but I cannot find any relevant information about your query. Please refine ' \
                    'your query to make it more specifically.'
    if result is not None:
        if len(result) > 0:
            return_answer = textual_answer(retrieving_query)
    logging.info(f'Chat: Textual answer: {return_answer}')

    return result, return_answer

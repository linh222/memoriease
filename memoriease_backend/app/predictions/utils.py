import pickle
import re

import requests
import base64
from app.config import root_path, IMAGE_PATH, IMAGE_EXT
from app.predictions.mysceal_nlp_utils.common import locations
from app.predictions.mysceal_nlp_utils.pos_tag import Tagger
from nltk import pos_tag
from nltk.tokenize import WordPunctTokenizer

def time_contructor(date):
    # Datetime processing for the datetime in the query, from text (2019 January) to 2019-01-01
    # Input: any text of datetime
    # Output: ISO Format of time: 2019-01-01
    start_time1, end_time1 = '', ''
    # Filter years
    years = ['2015', '2016', '2018', '2019', '2020']
    year = ''
    for y in years:
        if y in date:
            date = date.replace(y, '')
            year = y
            break

    list_month = {'january': '01', 'february': '02', 'march': '03', 'april': '04', 'may': '05',
                  'june': '06', 'july': '07', 'august': '08', 'september': '09', 'october': '10',
                  'november': '11', 'december': '12'}
    # Filter months
    month = ''
    for month_query in list_month.keys():
        if month_query in date:
            date = date.replace(month_query, '')
            month = month_query

    day = ''
    numbers_only = re.findall('\d+', date)
    if len(numbers_only) > 0:
        day = numbers_only[0]
    month_31 = ['january', 'march', 'may', 'july', 'august', 'october', 'december']
    month_30 = ['april', 'june', 'september', 'november']
    if year == "" and month == '' and day == '':
        start_time = '2015-01-01'
        end_time = '2020-06-30'
    elif month == '' and year != '':
        start_time = year + '-01-01'
        end_time = year + '-12-31'
    elif month == '' and year != '':
        start_time = year + '-01-01'
        end_time = year + '-12-31'
    elif year == '' and month != '':
        if month not in ['january', 'february', 'march', 'april', 'may', 'june']:
            if month in month_30:
                start_time = '2019-' + list_month[month] + '-01'
                end_time = '2019-' + list_month[month] + '-30'
            elif month in month_31:
                start_time = '2019-' + list_month[month] + '-01'
                end_time = '2019-' + list_month[month] + '-31'
            else:
                start_time = '2019-' + list_month[month] + '-01'
                end_time = '2019-' + list_month[month] + '-28'
        else:
            if month in month_30:
                start_time = '2019-' + list_month[month] + '-01'
                end_time = '2019-' + list_month[month] + '-30'
                start_time1 = '2020-' + list_month[month] + '-01'
                end_time1 = '2020-' + list_month[month] + '-30'
            elif month in month_31:
                start_time = '2019-' + list_month[month] + '-01'
                end_time = '2019-' + list_month[month] + '-31'
                start_time1 = '2020-' + list_month[month] + '-01'
                end_time1 = '2020-' + list_month[month] + '-31'
            else:
                start_time = '2019-' + list_month[month] + '-01'
                end_time = '2019-' + list_month[month] + '-28'
                start_time1 = '2020-' + list_month[month] + '-01'
                end_time1 = '2020-' + list_month[month] + '-28'
    else:
        if month in month_30:
            start_time = year + '-' + list_month[month] + '-01'
            end_time = year + '-' + list_month[month] + '-30'
        elif month in month_31:
            start_time = year + '-' + list_month[month] + '-01'
            end_time = year + '-' + list_month[month] + '-31'
        else:
            start_time = year + '-' + list_month[month] + '-01'
            end_time = year + '-' + list_month[month] + '-28'

    if day != '':
        if len(day) == 1:
            day = '0' + day
        start_time = start_time[:-2] + day
        end_time = end_time[:-2] + day
    if start_time1 != '' and end_time1 != '':
        return [start_time, end_time, start_time1, end_time1]
    else:
        return [start_time, end_time]


valid_time_period = {'early morning': 'early morning', 'dawn': 'early morning', 'sunrise': 'early morning',
                     'daybreak': 'early morning', 'morning': 'morning',
                     'nightfall': 'night', 'dusk': 'night', 'dinnertime': 'night', 'sunset': 'night',
                     'twilight': 'night', 'afternoon': 'afternoon', 'supper': 'afternoon', 'suppertime': 'afternoon',
                     'teatime': 'afternoon', 'late night': 'late night', 'midnight': 'late night', 'evening': 'night'}

valid_location = pickle.load(open('{}/app/predictions/mysceal_nlp_utils/common/city.pkl'.format(root_path), 'rb'))
valid_location = ' '.join(valid_location).split(' ')
valid_location = list(set(valid_location))


def extract_advanced_filter(input_query):
    filters = re.findall(r'\S*@\S+', input_query)
    returned_query = re.sub(r'\S*@\S+', '', input_query).strip()
    return returned_query, filters


def add_advanced_filters(advanced_filters, query_dict):
    map_dict = {'weekend': "is_weekend", 'start': "start_hour", 'end': 'end_hour',
                'location': 'city', 'ocr': 'ocr', 'semantic': 'semantic_name'}
    for advanced_filter in advanced_filters:
        advanced_filter = advanced_filter.replace('@', '').split(':')
        advanced_filter[1] = advanced_filter[1].replace('_', ' ')
        try:
            query_dict[map_dict[advanced_filter[0]]] = advanced_filter[1]
        except:
            print(advanced_filter[0])
    return query_dict


def process_query(sent):
    # extract relevant information in the query: keyword, time perios, weekday, time filter, location
    init_tagger = Tagger(locations)
    tags = init_tagger.tag(sent)
    processed_text = ''
    list_keyword = ''
    time_period = ''
    weekday = ''
    location = []
    time_filter = ['', '']
    valid_weekday = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

    for index in range(len(tags)):
        if (tags[index][1] == 'NN' or tags[index][1] == 'REGION') and tags[index][0] in valid_location:
            location.append(tags[index][0])
        if tags[index][1] not in ['DATE', 'TIME', 'KEYWORD', 'TIMEPREP', 'TIMEOFDAY', 'WEEKDAY']:
            processed_text = processed_text + ' ' + tags[index][0]
        elif tags[index][1] == 'KEYWORD':
            list_keyword = list_keyword + ', ' + tags[index][0]
        elif tags[index][1] == 'TIMEOFDAY':
            try:
                time_period = valid_time_period[tags[index][0]]
            except:
                time_period = ''
        elif tags[index][1] == 'WEEKDAY':
            if tags[index][0].lower() in valid_weekday:
                weekday = tags[index][0]
        elif tags[index][1] == 'DATE' or (tags[index][1] and tags[index][0] in ['2019', '2020']):
            time_filter = time_contructor(tags[index][0])
        else:
            continue
    list_keyword = list_keyword[2:]
    processed_text = processed_text[1:]
    if len(location) > 0:
        return processed_text, list_keyword, time_period, weekday, time_filter, location[-1]
    else:
        return processed_text, list_keyword, time_period, weekday, time_filter, ''


def construct_filter(query_dict):
    # Construct filter format for elastic search
    filter = []
    if 'time_period' in query_dict:
        if query_dict['time_period'] != '':
            filter.append({
                "term": {
                    'time_period': query_dict['time_period']
                }
            })
    if query_dict['weekday'] != '':
        filter.append({
            "term": {
                'day_of_week': query_dict['weekday']
            }
        })
    if len(query_dict['time_filter']) == 2:
        if query_dict['time_filter'][0] != '' and query_dict['time_filter'][1] != '':
            filter.append({
                "range": {
                    "local_time": {
                        "gte": query_dict['time_filter'][0],
                        "lte": query_dict['time_filter'][1]
                    }
                }
            })
        elif query_dict['time_filter'][0] != '' and query_dict['time_filter'][1] == '':
            filter.append({
                "range": {
                    "local_time": {
                        "gte": query_dict['time_filter'][0]
                    }
                }
            })
        elif query_dict['time_filter'][0] == '' and query_dict['time_filter'][1] != '':
            filter.append({
                "range": {
                    "local_time": {
                        "lte": query_dict['time_filter'][1]
                    }
                }
            })
        else:
            pass
    else:
        filter.append({
            "bool": {
                "should": [
                    {
                        "range": {
                            "local_time": {
                                "gte": query_dict['time_filter'][0],
                                "lte": query_dict['time_filter'][1]
                            }
                        }
                    },
                    {
                        "range": {
                            "local_time": {
                                "gte": query_dict['time_filter'][2],
                                "lte": query_dict['time_filter'][3]
                            }
                        }
                    }
                ],
                "minimum_should_match": 1,
            }
        })
    if query_dict['location'] != '':
        filter.append({
            "term": {
                'city': query_dict['location']
            }
        })
    if 'image_excluded' in query_dict:
        filter.append({
            "bool": {
                "must_not": {
                    "terms": {
                        "_id": query_dict['image_excluded']
                    }
                }
            }
        })

    if 'semantic_name' in query_dict:
        if query_dict['semantic_name'] != '':
            if query_dict['semantic_name'][0] == '~':
                filter.append({
                    "bool": {
                        "must_not": {
                            "match": {
                                "new_name": query_dict['semantic_name'][1:]
                            }
            }
        }
                })
            else:
                filter.append({
                    "match": {
                        'new_name': query_dict['semantic_name']
                    }
                })
    if 'start_hour' in query_dict:
        try:
            int_start_hour = int(query_dict['start_hour'])
            if 0 <= int_start_hour <= 23:
                filter.append({
                    "range": {
                        'hour': {
                            "gte": query_dict['start_hour']
                        }
                    }
                })
        except:
            pass
    if 'end_hour' in query_dict:
        try:
            int_end_hour = int(query_dict['end_hour'])
            if 0 <= int_end_hour <= 23:
                filter.append({
                    "range": {
                        'hour': {
                            "lte": query_dict['end_hour']
                        }
                    }
                })
        except:
            pass
    if 'is_weekend' in query_dict:
        if query_dict['is_weekend'] not in '01':
            pass
        else:
            filter.append({
                "term": {
                    'is_weekend': query_dict['is_weekend']
                }
            })
    if 'ocr' in query_dict:
        filter.append({
            "term": {
                'OCR': query_dict['ocr']
            }
        })
    # if 'groups' in query_dict:
    #     if query_dict['groups'] != '':
    #         filter.append({
    #             "terms": {
    #                 'group': query_dict['groups']
    #             }
    #         })
    return filter


def build_query_template(filter, blip_text_embedding, clip_text_embedding, size=100, col=["day_of_week", "ImageID", "local_time", "new_name",
                                                                'event_id', 'similar_image', 'city']):
    # Build the query template to send to elastic search
    # print(len(blip_text_embedding), len(clip_text_embedding))
    query_template = {
        
        "knn": [{
            "field": "blip_embed",
            "query_vector": blip_text_embedding.tolist(),
            "k": size,
            "num_candidates": 10000,
            "boost": 1,
            "filter": filter
        },
                {
            "field": "clip_embed",
            "query_vector": clip_text_embedding.tolist(),
            "k": size,
            "num_candidates": 1000,
            "boost": 0,
            "filter": filter
        },
            ],
        

        "_source": col,
        "size": size,
    }
    return query_template

def build_query_template_temporal(filter, blip_text_embedding, size=100, col=["day_of_week", "ImageID", "local_time", "new_name",
                                                                'event_id', 'similar_image', 'city']):
    # Build the query template to send to elastic search
    # print(len(blip_text_embedding), len(clip_text_embedding))
    query_template = {
        
        "knn": [{
            "field": "blip_embed",
            "query_vector": blip_text_embedding.tolist(),
            "k": size,
            "num_candidates": 1000,
            "boost": 1,
            "filter": filter
        }
            ],
        

        "_source": col,
        "size": size,
    }
    return query_template


def automatic_logging(results: list, output_file_name: str):
    # Automatic logging the results for ntcir
    logging_data = []
    with open(f'{root_path}/app/evaluation_model/{output_file_name}.csv',
              'r') as file:
        headline = file.readline()
        exist_data = len(file.readlines())
    logging_count = exist_data // 100
    for result in results:
        # score = result['current_event']['_score']
        image_id = result['current_event']['_id']
        text = f'DCU,MEMORIEASE_SAT01,{logging_count},{image_id},0,1'
        logging_data.append(text)

    with open(f'{root_path}/app/evaluation_model/{output_file_name}.csv',
              'a') as file:
        if 'GROUP-ID,RUN-ID,TOPIC-ID,IMAGE-ID,SECONDS-ELAPSED,SCORE' not in headline:
            file.write('GROUP-ID,RUN-ID,TOPIC-ID,IMAGE-ID,SECONDS-ELAPSED,SCORE\n')
        for data in logging_data:
            file.write(data + '\n')


def send_request_to_elasticsearch(HOST, INDICE, query):
    # Send request to elastic search and return the results in form of list of dict
    url = f"{HOST}/{INDICE}/_search"

    # send request to elastic search
    # with requests.Session() as session:
    #     try:
    response = requests.post(url, data=query, headers={"Content-Type": "application/json"})
    response.raise_for_status()
    results = response.json()
    # print(response)
    return results
    # except requests.exceptions.RequestException as e:
    #     ValueError(e)
    #     print(e)
    #     return None


def calculate_overall_score(results, main_score=0.6, temporal_score=0.2):
    # aggregate the results and resort with the overall score of main_score*main event + temporal_score*previous/next
    for index in range(len(results)):
        overall_score = results[index]['current_event']['_score'] * main_score
        if "previous_event" in results[index].keys() and results[index]['previous_event']['_id'] is not None:
            overall_score = overall_score + (results[index]['previous_event']['_score'] * temporal_score)
        if "next_event" in results[index].keys() and results[index]['next_event']['_id'] is not None:
            overall_score = overall_score + (results[index]['next_event']['_score'] * temporal_score)
        results[index]['overall_score'] = overall_score
    results = sorted(results, key=lambda d: d['overall_score'], reverse=True)
    return results


stop_word = [
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
    "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
    "below", "between", "both", "but", "by", "can't", "cannot", "could", "couldn't",
    "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during",
    "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", "have",
    "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers",
    "herself", "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've",
    "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself", "let's", "me", "more",
    "most", "mustn't", "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only",
    "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "shan't",
    "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such", "than",
    "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there", "there's",
    "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", "through", "to",
    "too", "under", "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've",
    "were", "weren't", "what", "what's", "when", "when's", "where", "where's", "which", "while", "who",
    "who's", "whom", "why", "why's", "with", "won't", "would", "wouldn't", "you", "you'd", "you'll",
    "you're", "you've", "your", "yours", "yourself", "yourselves", "!", "\"", "#", "$", "%", "&", "'",
    "(", ")", "*", "+", ",", "-", ".", "/", ":", ";", "<", "=", ">", "?", "@", "[", "\\", "]", "^", "_",
    "`", "{", "|", "}", "~", "–", "—", "‘", "’", "“", "”"

]


def temporal_extraction(query):
    main_event, previous_event, next_event = '', '', ''
    if ' before that' in query and ' after that' in query:
        split_query = query.split('before that')
        if ' after that' in split_query[0]:

            previous_event = split_query[1]
            main_event, next_event = split_query[0].split(' after that')
        else:
            main_event = split_query[0]
            previous_event, next_event = split_query[1].split(' after that')
    elif ' before that' in query:
        split_query = query.split(' before that')
        main_event = split_query[0]
        previous_event = split_query[1]
    elif ' after that' in query:
        split_query = query.split(' after that')
        main_event = split_query[0]
        next_event = split_query[1]

    elif ' before ' in query and ' after ' in query:
        split_query = query.split(' before ')
        if ' after ' in split_query[0]:

            next_event = split_query[1]
            main_event, previous_event = split_query[0].split(' after ')
        else:
            main_event = split_query[0]
            next_event, previous_event = split_query[1].split(' after ')
    elif ' before ' in query:
        split_query = query.split(' before ')
        main_event = split_query[0]
        next_event = split_query[1]
    elif ' after ' in query:
        split_query = query.split(' after ')
        main_event = split_query[0]
        previous_event = split_query[1]

    else:
        main_event = query

    main_event, previous_event, next_event = main_event.strip(' '), previous_event.strip(' '), next_event.strip(' ')

    if previous_event in stop_word:
        previous_event = ''
    if next_event in stop_word:
        next_event = ''
    return main_event, previous_event, next_event


def extract_question_component(question_query):
    # Process the question to the question, the context in the question and the question to confirm the content of image
    # Input: Question, free text
    # Output: context_query, question_to_ask, question_to_confirm

    # Define values for lexical properties
    question = ['WDT', 'WP', 'WP$', 'WRB']
    verb = ['VBZ', 'VBP', 'VBN', 'VBG', "VBD", 'VB']
    noun = ['NNS', 'NNPS', 'NNP', 'NN']
    dot_comma = [',', '.']
    context = []
    question_word = []
    question_verb = []
    question_context = []
    unknown = []
    flag = 'context'

    # Tokenize the sentences to word by word
    tokenizer = WordPunctTokenizer()
    question_query = tokenizer.tokenize(question_query)
    # Add tags to word
    tags = pos_tag(question_query)
    question_index = 0

    for index in range(len(tags)):
        # Add words to the question follow these rules, else context
        if tags[index][1] in question:
            question_word.append(tags[index])
            flag = 'question'
            question_index = index
        elif flag == 'question' and tags[index][1] in noun and (question_index + 2) >= index:
            question_word.append(tags[index])
        elif flag == 'question' and tags[index][1] in verb and len(question_verb) == 0:
            question_verb.append(tags[index])
        elif tags[index][1] in dot_comma:
            try:
                if tags[index + 1][1] in question:
                    flag = 'question'
            except:
                flag = 'context'
        elif flag == 'question':
            question_context.append(tags[index])
        elif flag == 'context':
            context.append(tags[index])
        else:
            unknown.append(tags[index])

    # Create different question and context to ask and confirm
    context_query = question_context + context
    context_query_return = ''
    for cxt in context_query:
        context_query_return += (' ' + cxt[0])
    question_to_ask = question_word + question_verb + question_context + context
    question_to_ask_return = ''
    for cxt in question_to_ask:
            question_to_ask_return += (' ' + cxt[0])
    question_to_ask_return += '?'
    question_to_confirm = question_context + context
    if len(question_verb) == 0:  # Question start with a verb
        question_to_confirm_return = ''
    else:
        if question_verb[0][0] in ['is', 'be', 'are', 'am', 'was', 'were']:
            question_to_confirm_return = 'Was'
        else:
            question_to_confirm_return = 'Did'
    for cxt in question_to_confirm:
        if cxt[1] != 'CD':
            question_to_confirm_return += (' ' + cxt[0])
    question_to_confirm_return += ' in the images?'
    return context_query_return, question_to_ask_return, question_to_confirm_return


def extract_date_imagename(image_id):
    if image_id.find('/') == -1:
        year_month = image_id[:6]
        day = image_id[6:8]
        image_name = image_id
    else:
        date, image_name = image_id.split('/')
        year_month = "".join(date.split("-")[:2])
        day = date.split("-")[-1]
    return image_name.replace('.jpg', ''), year_month, day


def add_image_path(results):
    # add image link for the final output
    if len(results) >= 1:
        for result in results:
            image_id = result['_source']['ImageID']
            image_name, year_month, day = extract_date_imagename(image_id)
            result['_source']['image_path'] = IMAGE_PATH + '/{}/{}/{}.{}'.format(year_month, day,
                                                                     image_name, IMAGE_EXT)
            
    return results


def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")
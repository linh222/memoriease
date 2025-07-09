def log_ntcir_result(topic_id, results, run_id='EASE_BLIP_CQ_NORF'):
    with open(('/home/tqlinh/lsc/memoriease_backend_2.0/app/ntcir_result.txt'), mode='a') as file:
        for result in results:
            data = result['current_event']
            file.write(f'MEASEDCU,{run_id},{topic_id},{data["_source"]["ImageID"]},{data["_score"]}\n')
            

def log_qa_result(topic_id, answer, run_id='EASE_QA_4O'):
    with open(('/home/tqlinh/lsc/memoriease_backend_2.0/app/qa_result.txt'), mode='a') as file:
        file.write(f'MEASEDCU,{run_id},{topic_id},{answer}\n')
        

def log_lsc25_result(query, results):
    file_path = '/home/tqlinh/lsc/memoriease_backend_2.0/app/lsc25_result.txt'

    # Step 1: Get last ID
    try:
        with open(file_path, 'r') as file:
            lines = file.readlines()
            if lines:
                last_line = lines[-1].strip()
                last_id = int(last_line.split(',')[0])
            else:
                last_id = 0
    except FileNotFoundError:
        last_id = 0

    # Step 2: Write new results with incremented ID
    with open(file_path, 'a') as file:
        for i, result in enumerate(results):
            data = result['current_event']
            new_id = last_id + 1
            clean_query = query.replace("\n", "")
            file.write(f'{new_id},{clean_query},{data["_source"]["ImageID"]},{data["_score"]}\n')


        
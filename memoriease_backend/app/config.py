import os
from os.path import join, dirname
from pathlib import Path

from dotenv import load_dotenv
from pydantic import BaseSettings

dotenv_path = join(dirname(__file__), '../.env')
load_dotenv(dotenv_path)

API_KEY = os.environ.get("API_KEY")
API_KEY_NAME = os.environ.get("API_KEY_NAME")
AWS_ACCESS_KEY = os.environ.get("AWS_ACCESS_KEY")
AWS_SECRET_KEY = os.environ.get("AWS_SECRET_KEY")
ENVIRONMENT = os.environ.get('ENVIRONMENT', 'dev')
SENTRY_DSN = os.environ.get("SENTRY_DSN", '')
SENTRY_TRACE_SAMPLE_RATE = float(os.environ.get('SENTRY_TRACE_SAMPLE_RATE', 0))
ELASTIC_USER = os.environ.get('elastic_user')
ELASTIC_PASS = os.environ.get('elastic_pass')
CE_PATH = os.environ.get('ce_path')
HOST = os.environ.get('host')
INDICES = os.environ.get('indices')
RAG_INDICES = os.environ.get('rag_indices')
IMAGE_SERVER = os.environ.get('image_server')
GROUP_INDICES = os.environ.get('group_indices')
BUCKET = os.environ.get('bucket')
IMAGE_EXT = os.environ.get('image_ext')
embed_directory = os.environ.get('embed_directory')
IMAGE_PATH = os.environ.get('image_path')
def get_project_root() -> Path:
    return Path(__file__).parent.parent


root_path = get_project_root()


class Settings(BaseSettings):
    APP_NAME: str = "MemoriEase Backend"
    API_MODEL_VERSION = '2.0'
    MODEL_PATH = '{}/app/models/model_base_retrieval_coco.pth'.format(root_path)
    model_reranker_path = '{}/app/evaluation_model/best_minilm_reranking_model.pth'.format(root_path)


settings = Settings()

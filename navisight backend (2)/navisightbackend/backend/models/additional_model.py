import os

# Set transformers cache directory to local path to persist models and avoid repeated downloads
os.makedirs("backend/model_cache", exist_ok=True)
os.environ['TRANSFORMERS_CACHE'] = os.path.abspath("backend/model_cache")

from ultralytics import YOLO

# Initialize models
yolo_model = YOLO("backend/trained_models/best.pt")

from fastapi import FastAPI, UploadFile, File
import tempfile
import os
import google.generativeai as genai
from PIL import Image
from ultralytics import YOLO
import logging
from dotenv import load_dotenv

load_dotenv()

# Setup logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)
API_KEY = os.getenv("API_KEY")
# Configure Google Gemini
genai.configure(api_key=API_KEY)
gemini_model = genai.GenerativeModel("gemini-1.5-flash")

app = FastAPI()

# Load YOLO model
yolo_model = YOLO("backend/trained_models/best.pt")

# Room classification based on detected objects
def classify_room(detected_objects):
    room_mapping = {
        "bedroom": ["bed", "pillow", "lamp", "wardrobe"],
        "living room": ["sofa", "television", "table", "carpet"],
        "kitchen": ["refrigerator", "stove", "microwave", "sink"],
        "bathroom": ["toilet", "Indian Toilet", "sink", "shower", "bathtub"],
        "dining room": ["dining table", "chair", "plate"]
    }
    room_scores = {
        room: sum(obj in detected_objects for obj in objects)
        for room, objects in room_mapping.items()
    }
    best_match = max(room_scores, key=room_scores.get)
    return best_match if room_scores[best_match] > 0 else "Unknown Room"

# Describe scene using Gemini 1.5 Flash
def describe_with_gemini(image_path):
    try:
        image = Image.open(image_path).convert("RGB")
        response = gemini_model.generate_content([
            {"text": "Describe this indoor scene in detail for a visually impaired person. Focus on objects and their positions."},
            image
        ])
        return response.text
    except Exception as e:
        logger.error(f"Gemini error: {e}")
        return "Failed to describe scene."

# Analyze scene function combining YOLO and Gemini
def analyze_scene(image_path):
    results = yolo_model(image_path)
    detected_objs = list({yolo_model.names[int(box.cls)] for box in results[0].boxes})

    if not detected_objs:
        logger.debug("No objects detected.")
        return {"error": "No objects detected."}

    room_type = classify_room(detected_objs)
    description = describe_with_gemini(image_path)

    logger.debug(f"Room type: {room_type}")
    logger.debug(f"Detected objects: {detected_objs}")
    logger.debug(f"Gemini description: {description}")

    return {
        "room_type": room_type,
        "description": description,
        "detected_objects": detected_objs
    }
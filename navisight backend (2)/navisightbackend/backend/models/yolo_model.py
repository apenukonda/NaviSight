# from ultralytics import YOLO
# import os

# def load_yolo_model():
#     model_path = os.path.join(os.path.dirname(__file__), '..', 'trained_models', 'best.pt')
#     model = YOLO(model_path)  # Make sure best.pt exists
#     return model

# def run_yolo(model, image_path):
#     results = model(image_path)[0]
#     detections = []
#     for box in results.boxes.data:
#         x1, y1, x2, y2, conf, cls = box.tolist()
#         detections.append([x1, y1, x2, y2, conf, cls])
#     return detections

from ultralytics import YOLO
import os

def load_yolo_model():
    model_path = os.path.join(os.path.dirname(__file__), '..', 'trained_models', 'best.pt')
    model = YOLO(model_path)  # Make sure best.pt exists
    return model

def load_both_models():
    base_model_path = os.path.join(os.path.dirname(__file__), '..', 'trained_models', 'yolo11n.pt')
    fine_tuned_model_path = os.path.join(os.path.dirname(__file__), '..', 'trained_models', 'best.pt')
    base_model = YOLO(base_model_path)
    fine_tuned_model = YOLO(fine_tuned_model_path)
    return base_model, fine_tuned_model

def run_yolo(model, image_path):
    results = model(image_path)[0]
    detections = []
    for box in results.boxes.data:
        x1, y1, x2, y2, conf, cls = box.tolist()
        detections.append([x1, y1, x2, y2, conf, cls])
    return detections

def run_best_model(image_path):
    base_model, fine_tuned_model = load_both_models()
    base_detections = run_yolo(base_model, image_path)
    fine_tuned_detections = run_yolo(fine_tuned_model, image_path)

    if len(fine_tuned_detections) >= len(base_detections):
        return fine_tuned_detections
    else:
        return base_detections


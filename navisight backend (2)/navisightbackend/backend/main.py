# from fastapi import FastAPI, UploadFile, File
# from .models.yolo_model import load_yolo_model, run_yolo
# from .models.depth_model import load_depth_model, estimate_depth
# from .models.description_model import analyze_scene
# # from .utils.image_utils import save_image
# import cv2
# import numpy as np
# import os
# import tempfile

# app = FastAPI()
# yolo = load_yolo_model()
# depth_model = load_depth_model()

# @app.get("/")
# def root():
#     return {"message": "Blind Assistance System API"}

# @app.post("/predict/")
# async def predict(file: UploadFile = File(...)):
#     try:
#         contents = await file.read()
#         npimg = np.frombuffer(contents, np.uint8)
#         image = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

#         # Save image temporarily to pass path to run_yolo and analyze_scene
#         with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
#             temp_path = tmp.name
#             cv2.imwrite(temp_path, image)

#         results = run_yolo(yolo, temp_path)
#         depth_map = estimate_depth(depth_model, image)

#         # Generate scene description using analyze_scene
#         scene_description = analyze_scene(temp_path)

#         # Remove the temporary file
#         os.remove(temp_path)

#         # Return objects, distances, and scene description
#         predictions = []
#         for det in results:
#             x1, y1, x2, y2, conf, cls = det
#             label = yolo.names[int(cls)]
#             bbox_depth = depth_map[int(y1):int(y2), int(x1):int(x2)]
#             distance = np.mean(bbox_depth)
#             predictions.append({"label": label, "distance": float(distance)})

#         return {
#             "results": predictions,
#             "scene_description": scene_description
#         }
#     except Exception as e:
#         return {"error": str(e)}

from fastapi import FastAPI, UploadFile, File
from .models.yolo_model import load_yolo_model, run_yolo
from .models.depth_model import load_depth_model, estimate_depth
from .models.description_model import analyze_scene
import cv2
import numpy as np
import os
import tempfile
import math

app = FastAPI()
yolo = load_yolo_model()
depth_model = load_depth_model()

KNOWN_OBJECT_HEIGHTS = {
    "Air Conditioner": 30, "Bathtub": 50, "Bed": 60, "Blanket": 10, "Book": 22,
    "Chair": 90, "Door": 200, "Door mat": 2, "Fork": 20, "Glass": 12,
    "God Photo Frames": 35, "Indian Toilet": 35, "Laptop": 25, "Light Lamp": 40,
    "Mirror": 100, "Mirror Light": 10, "Mobile Phone": 15, 
    "Plate": 25, "Portrait": 45, "Refrigerator": 170, "Screen": 100, "Shower": 20,
    "Soap": 7, "Spoon": 18, "Statue": 60, "Table": 75, "Toilet Paper": 12,
    "Tooth Brush": 18, "Towel": 60, "Vanity Cabinet": 85, "Washbasin": 90,
    "Water Bottle": 25, "Window": 120, "armchair": 90, "bookshelf": 180,
    "cabinet": 150, "ceiling_light": 20, "charger": 5, "clock": 30, "commode": 45,
    "curtains": 200, "cushion": 40, "dvd_player": 6,
    "fan": 60, "fireplace": 80, "floor_lamp": 140, 
    "power outlet": 10, "remote_control": 15, "side_table": 50,
    "sofa": 90, "speaker": 25, "television": 70, "vase": 30, "wall_shelf": 20,
    "xWater heaters": 60, "Tap": 15, "Bucket": 30, "bowls": 10, "dining table": 75
}

HORIZONTAL_FOV_DEGREES = 85  # Samsung S23 approx.

@app.get("/")
def root():
    return {"message": "Blind Assistance System API"}

@app.post("/predict/")
async def predict(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        npimg = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
            temp_path = tmp.name
            cv2.imwrite(temp_path, image)

        results = run_yolo(yolo, temp_path)
        depth_map = estimate_depth(depth_model, image)
        scene_description = analyze_scene(temp_path)
        os.remove(temp_path)

        image_height, image_width = image.shape[:2]
        focal_length_px = image_width / (2 * math.tan(math.radians(HORIZONTAL_FOV_DEGREES / 2)))

        predictions = []
        for det in results:
            x1, y1, x2, y2, conf, cls = det
            label = yolo.names[int(cls)].lower()
            bbox_depth = depth_map[int(y1):int(y2), int(x1):int(x2)]
            avg_depth_distance = float(np.mean(bbox_depth))

            bbox_height_px = max(1, y2 - y1)
            known_height = KNOWN_OBJECT_HEIGHTS.get(label)

            if known_height:
                known_height_distance = (focal_length_px * known_height) / bbox_height_px
                hybrid_distance = (avg_depth_distance * 100 + known_height_distance) / 2
            else:
                known_height_distance = None
                hybrid_distance = avg_depth_distance * 100

            predictions.append({
           "Object": label,
           "Estimated Distances (cm)": {
           "From Depth Map": f"{round(avg_depth_distance, 2)} cm",
           "From Known Height": f"{round(known_height_distance/100, 2)} cm" if known_height_distance else "N/A",
           "Final Estimated": f"{round(hybrid_distance/100, 2)} cm"
    }
})
            
    


        return {
            "results": predictions,
            "scene_description": scene_description
        }
 
    except Exception as e:
        return {"error": str(e)}

import cv2
import numpy as np
import os
from models.yolo_model import load_yolo_model, run_yolo
from models.depth_model import load_depth_model, estimate_depth

def main():
    # Load models
    yolo = load_yolo_model()
    depth_model = load_depth_model()

    # Load test image
    test_image_path = os.path.join(os.path.dirname(__file__), "testimages", "Decorating With Black_ 13 Ways To Use Dark Colors In Your Home.jpg")
    if not os.path.exists(test_image_path):
        print(f"Test image not found at {test_image_path}")
        return

    image = cv2.imread(test_image_path)
    if image is None:
        print(f"Failed to load image from {test_image_path}")
        return

    # Run YOLO prediction
    results = run_yolo(yolo, image)

    # Estimate depth
    depth_map = estimate_depth(depth_model, image)

    # Process and print predictions
    print("Predictions:")
    for det in results:
        x1, y1, x2, y2, conf, cls = det
        label = yolo.names[int(cls)]
        bbox_depth = depth_map[int(y1):int(y2), int(x1):int(x2)]
        distance = np.mean(bbox_depth)
        print(f"Label: {label}, Confidence: {conf:.2f}, Distance: {distance:.2f}")

if __name__ == "__main__":
    main()

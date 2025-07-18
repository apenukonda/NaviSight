import requests

def test_predict_api():
    url = "http://localhost:8000/predict/"
    image_path = r"E:\navisight backend (2)\navisightbackend\backend\testimages\Decorating With Black_ 13 Ways To Use Dark Colors In Your Home.jpg"
    with open(image_path, "rb") as f:
        files = {"file": (image_path, f, "image/jpeg")}
        response = requests.post(url, files=files)
    print("Status code:", response.status_code)
    print("Response JSON:", response.json())

if __name__ == "__main__":
    test_predict_api()

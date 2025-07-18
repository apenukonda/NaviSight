import torch
import os

def download_midas_dpt_large(save_dir=r"E:\navisight backend (2)\navisightbackend\backend\trained_models"):
    os.makedirs(save_dir, exist_ok=True)
    model_type = "DPT_Large"

    print(f"Downloading {model_type} model from torch.hub...")
    model = torch.hub.load("intel-isl/MiDaS", model_type)

    save_path = os.path.join(save_dir, f"{model_type}.pt")
    torch.save(model.state_dict(), save_path)
    print(f"{model_type} weights saved to: {save_path}")

download_midas_dpt_large()

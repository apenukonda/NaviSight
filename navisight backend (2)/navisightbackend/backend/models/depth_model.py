

import torch
import torch.nn as nn
import timm
import cv2
import numpy as np
from torchvision.transforms import Compose, Resize, ToTensor, Normalize
from PIL import Image
import os

class CustomDepthModel(nn.Module):
    def __init__(self):
        super(CustomDepthModel, self).__init__()
        self.backbone = timm.create_model('vit_base_patch16_384', pretrained=True, features_only=True)
        self.decoder = nn.Sequential(
            nn.Conv2d(self.backbone.feature_info.channels()[-1], 256, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.Conv2d(256, 1, kernel_size=1)
        )

    def forward(self, x):
        if x.ndim == 3:
            x = x.unsqueeze(0)
        features = self.backbone(x)
        out = self.decoder(features[-1])
        out = torch.nn.functional.interpolate(out, size=x.shape[-2:], mode='bilinear', align_corners=False)
        return out.squeeze(1)

def load_depth_model():
    model = CustomDepthModel()
    model_path = os.path.join(os.path.dirname(__file__), '..', 'trained_models', 'depth_model.pth')
    if os.path.exists(model_path):
        state_dict = torch.load(model_path, map_location=torch.device('cpu'))
        model.load_state_dict(state_dict)
    else:
        print(f"Warning: Depth model weights not found at {model_path}. Loading model without weights.")
    model.eval()
    return model

def estimate_depth(model, image):
    transform = Compose([
        Resize((384, 384)),
        ToTensor(),
        Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])  # normalize to [-1, 1] range
    ])
    pil_image = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
    input_tensor = transform(pil_image).unsqueeze(0)
    with torch.no_grad():
        prediction = model(input_tensor)
        depth = prediction.squeeze().cpu().numpy()

    # Normalize depth to [0, 1] to avoid negative/huge values
    depth = np.clip(depth, a_min=0, a_max=None)
    if np.max(depth) > 0:
        depth = depth / np.max(depth)

    # Resize to original image size
    depth_resized = cv2.resize(depth, (image.shape[1], image.shape[0]))
    return depth_resized



# import torch
# import torch.nn as nn
# import timm
# import cv2
# import numpy as np
# from torchvision.transforms import Compose, Resize, ToTensor
# from PIL import Image
# import os

# def load_depth_model():
#     # Custom model
#     class CustomDepthModel(nn.Module):
#         def __init__(self):
#             super(CustomDepthModel, self).__init__()
#             self.backbone = timm.create_model('vit_base_patch16_384', pretrained=True, features_only=True)
#             self.decoder = nn.Sequential(
#                 nn.Conv2d(self.backbone.feature_info.channels()[-1], 256, kernel_size=3, padding=1),
#                 nn.ReLU(inplace=True),
#                 nn.Conv2d(256, 1, kernel_size=1)
#             )

#         def forward(self, x):
#             if x.ndim == 3:
#                 x = x.unsqueeze(0)
#             features = self.backbone(x)
#             out = self.decoder(features[-1])
#             out = torch.nn.functional.interpolate(out, size=x.shape[-2:], mode='bilinear', align_corners=False)
#             return out.squeeze(1)

#     custom_model = CustomDepthModel()
#     model_path = os.path.join(os.path.dirname(__file__), '..', 'trained_models', 'depth_model.pth')
#     if os.path.exists(model_path):
#         state_dict = torch.load(model_path, map_location=torch.device('cpu'))
#         custom_model.load_state_dict(state_dict)
#     else:
#         print(f"Warning: Custom model weights not found at {model_path}.")
#     custom_model.eval()

#     # Load MiDaS model and transform from torch.hub
#     midas_model = torch.hub.load("intel-isl/MiDaS", "DPT_Large")
#     midas_model.eval()
#     midas_transforms = torch.hub.load("intel-isl/MiDaS", "transforms")
#     midas_transform = midas_transforms.dpt_transform

#     return custom_model, midas_model, midas_transform


# def estimate_depth(models, image):
#     custom_model, midas_model, midas_transform = models

#     # Prepare custom model input
#     custom_transform = Compose([Resize((384, 384)), ToTensor()])
#     if isinstance(image, Image.Image):
#         image_np = np.array(image)
#     else:
#         image_np = image

#     if not isinstance(image_np, np.ndarray):
#         raise TypeError(f"Expected np.ndarray but got {type(image_np)}")

#     pil_image = Image.fromarray(cv2.cvtColor(image_np, cv2.COLOR_BGR2RGB))
#     input_tensor_custom = custom_transform(pil_image).unsqueeze(0)

#     # Prepare MiDaS input
#     image_midas = cv2.cvtColor(image_np, cv2.COLOR_BGR2RGB) / 255.0
#     input_tensor_midas = midas_transform({'image': image_midas})['image']
#     input_tensor_midas = torch.from_numpy(input_tensor_midas).unsqueeze(0).float()

#     with torch.no_grad():
#         pred_custom = custom_model(input_tensor_custom).squeeze().cpu().numpy()
#         pred_midas = midas_model(input_tensor_midas).squeeze().cpu().numpy()

#     pred_custom_resized = cv2.resize(pred_custom, (image_np.shape[1], image_np.shape[0]))
#     pred_midas_resized = cv2.resize(pred_midas, (image_np.shape[1], image_np.shape[0]))

#     blended_depth = (pred_custom_resized + pred_midas_resized) / 2
#     return blended_depth









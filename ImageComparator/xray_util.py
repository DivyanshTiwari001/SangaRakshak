import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image

class EnhancedFeatureExtractor(nn.Module):
    def __init__(self):
        super().__init__()
        # Use medical pretrained weights if available
        self.base_model = models.resnet50(pretrained=True)
        # Multi-scale feature extraction
        self.feature_layers = nn.Sequential(
            self.base_model.conv1,
            self.base_model.bn1,
            self.base_model.relu,
            self.base_model.maxpool,
            self.base_model.layer1,
            self.base_model.layer2,
            self.base_model.layer3,
            self.base_model.layer4
        )
        # Feature refinement
        self.attention = nn.Sequential(
            nn.AdaptiveAvgPool2d(1),
            nn.Conv2d(2048, 512, 1),
            nn.ReLU(),
            nn.Conv2d(512, 2048, 1),
            nn.Sigmoid()
        )
        self.batchnorm = nn.BatchNorm1d(2048)

    def forward(self, x):
        x = self.feature_layers(x)
        # Attention-guided features
        attention_weights = self.attention(x)
        x = x * attention_weights
        x = torch.flatten(nn.AdaptiveAvgPool2d(1)(x), 1)
        x = self.batchnorm(x)
        return x

# Enhanced preprocessing for X-ray images
preprocess = transforms.Compose([
    transforms.Resize(320),  # Better preservation of details
    transforms.CenterCrop(256),
    transforms.Grayscale(num_output_channels=3),  # Handle grayscale X-rays
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.456], std=[0.224])  # X-ray specific stats
])

def calculate_xray_similarity(img_path1, img_path2):
    extractor = EnhancedFeatureExtractor().eval()

    # Load images with error handling
    try:
        img1 = preprocess(Image.open(img_path1)).unsqueeze(0)
        img2 = preprocess(Image.open(img_path2)).unsqueeze(0)
    except Exception as e:
        print(f"Image loading error: {e}")
        return None

    # Feature extraction with mixed precision
    with torch.no_grad(), torch.cuda.amp.autocast():
        features1 = extractor(img1)
        features2 = extractor(img2)

    # Hybrid similarity metric
    cos_sim = nn.CosineSimilarity(dim=1)(features1, features2)
    l2_sim = 1 / (1 + torch.norm(features1 - features2, p=2))
    combined_sim = 0.7*cos_sim + 0.3*l2_sim

    return combined_sim.item()*100  # Convert to percentage
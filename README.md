# NaviSight 🧭

**An AI-Powered Indoor Navigation System for the Visually Impaired**

NaviSight is a deep learning-based mobile assistant designed to help visually impaired users understand and navigate indoor environments. It uses real-time object detection, depth estimation, and image-to-speech scene descriptions to provide hands-free indoor guidance.

> 🚀 This was a team project involving 4 contributors.  


---

## 🧠 Key Features

- 🔍 Real-time **Object Detection** using YOLOv11
- 📏 **Depth Estimation** to measure distances to objects
- 🧠 **Scene Description** using Gemini API (LLaVA)
- 🗣️ **Voice Narration** to speak the description to the user
- 🖼️ Custom-labeled dataset of 5,000+ indoor images
- 🎙️ Voice or motion-based image capture

---

## 🔨 Technologies Used

| Component            | Technology                |
|----------------------|---------------------------|
| Object Detection     | YOLOv11 (Ultralytics)     |
| Dataset Labeling     | Label Studio              |
| Depth Estimation     | Depth Anything V2         |
| Scene Description    | Gemini API (LLaVA)        |
| Voice Feedback       | Google TTS / Whisper      |
| Platform             | Android (flutter)     |

---

## ⚙️ How It Works

```mermaid
graph TD;
    A[Capture Image] --> B[YOLOv11 Object Detection];
    B --> C[Depth Estimation];
    B --> D[Generate Description with Gemini API];
    C --> E[Calculate Object Distance];
    D --> F[Text-to-Speech Narration];
    E --> F;

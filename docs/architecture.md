# SIGNBRIDGE AI — Architecture Specification

## 1. System Overview

SIGNBRIDGE AI is a high-performance, accessibility-focused assistive communication platform. It translates real-time American Sign Language (ASL) alphabet fingerspelling gestures into text, generates natural spoken audio, and provides reverse text-to-ASL demonstrations.

```
┌─────────────────────────────────────────────────────────────┐
│                     USER & CLIENT BROWSER                   │
│                                                             │
│  ┌──────────────────┐  Webcam Video  ┌───────────────────┐  │
│  │ HTML5 Web Video  ├───────────────►│ MediaPipe Vision  │  │
│  └──────────────────┘                └─────────┬─────────┘  │
│                                                │ 21 3D      │
│                                                │ Landmarks  │
│  ┌──────────────────┐  Features (63) ┌─────────▼─────────┐  │
│  │ TensorFlow.js    │◄───────────────┤ Normalization &   │  │
│  │ WebGL Classifier │                │ Preprocessing     │  │
│  └────────┬─────────┘                └───────────────────┘  │
│           │                                                 │
│           │ Softmax Predictions (Confidence & Status)       │
│           ▼                                                 │
│  ┌──────────────────┐   Confirmed    ┌───────────────────┐  │
│  │ Prediction Card  ├───────────────►│ Sign-to-Text      │  │
│  │ & Smoothing      │     Letters    │ Workspace Editor  │  │
│  └──────────────────┘                └─────────┬─────────┘  │
│                                                │            │
│                     ┌──────────────────────────┴────────┐   │
│                     ▼                                   ▼   │
│          ┌──────────────────────┐          ┌────────────────┐
│          │ Web Speech Synthesis │          │ Text-to-Sign   │
│          │ (Native Browser TTS) │          │ Media Sequence │
│          └──────────────────────┘          └────────────────┘
└────────────────────────────┬────────────────────────────────┘
                             │ REST API (/api/v1)
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    NODE.JS / EXPRESS BACKEND                │
│                                                             │
│  • Zod Input Validation & Rate Limiting                     │
│  • Session & Recognition Telemetry Tracking                 │
│  • Verified ASL Alphabet Reference Provider                 │
│  • Google Gemini AI Educational & Polish Service            │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                 SUPABASE / POSTGRESQL DATABASE              │
│                                                             │
│  • Strict Row Level Security (RLS) on all tables            │
│  • Profiles, Roles, ASL Alphabet, Sessions, Messages        │
│  • Model Registry & Learning Progress Matrix                │
└─────────────────────────────────────────────────────────────┘
```

## 2. Computer Vision & Landmark Normalization

### 2.1 Landmark Topology
MediaPipe extracts 21 anatomical landmarks per hand:
- Wrist: Landmark 0
- Thumb: Landmarks 1, 2, 3, 4 (CMC, MCP, IP, Tip)
- Index: Landmarks 5, 6, 7, 8 (MCP, PIP, DIP, Tip)
- Middle: Landmarks 9, 10, 11, 12 (MCP, PIP, DIP, Tip)
- Ring: Landmarks 13, 14, 15, 16 (MCP, PIP, DIP, Tip)
- Pinky: Landmarks 17, 18, 19, 20 (MCP, PIP, DIP, Tip)

### 2.2 Invariant Normalization Algorithm
Raw video pixel coordinates depend on hand position and camera distance. SIGNBRIDGE normalizes every frame:
1. **Translation Invariance:** The wrist coordinate $(x_0, y_0, z_0)$ is subtracted from all 21 points:
   $$\mathbf{p}'_i = \mathbf{p}_i - \mathbf{p}_0$$
2. **Scale Invariance:** The maximum coordinate magnitude across all 63 dimensions is computed:
   $$S = \max_{i} (|\mathbf{p}'_i|)$$
3. **Bounded Scaling:** All coordinates are divided by $S$:
   $$\hat{\mathbf{p}}_i = \frac{\mathbf{p}'_i}{S} \in [-1.0, 1.0]$$

## 3. Dynamic Motion Gesture Engine (J and Z)
Static handshape classification cannot identify signs that depend on motion trajectories.
- **Letter J:** Starts in static "I" pose (pinky upright), then curves down and swoops back up in a hook.
- **Letter Z:** Starts with index extended, then traces horizontal right $\to$ diagonal down-left $\to$ horizontal right.
- The `TemporalTrajectoryTracker` buffers the past 25 frames and analyzes curvature, direction vectors, and displacement before firing a recognized motion event.

## 4. Privacy & Zero-Footprint Guarantee
- No video feeds, images, or raw camera bytes leave the user's browser.
- Inference occurs entirely client-side using `@tensorflow/tfjs` on WebGL.
- Only confirmed letters and saved text messages are sent to the backend database.

# SIGNBRIDGE AI — Dataset & Computer Vision Engineering

## 1. ASL Alphabet Convention & Classes
SIGNBRIDGE models the standard American Sign Language manual alphabet across 26 distinct characters:
- **24 Static Handshape Classes:** A, B, C, D, E, F, G, H, I, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y.
- **2 Dynamic Motion Classes:** J, Z.

## 2. Feature Vector Engineering
- **Input Dimensions:** 63 features (21 landmarks $\times$ 3 spatial axes: x, y, z).
- **Coordinate Space:** Normalization shifts Landmark 0 (wrist) to origin and divides by max coordinate span, ensuring scale invariance regardless of user distance from the webcam.

## 3. Neural Classifier Architecture
- **Layer 1:** Dense 128 units, ReLU activation, batch normalization
- **Layer 2:** Dense 64 units, ReLU activation, dropout 0.2
- **Layer 3:** Dense 32 units, ReLU activation
- **Output:** Dense 24 units, Softmax activation
- **Inference Runtime:** TensorFlow.js WebGL target with CPU fallback
- **Model Size:** 77.2 KB binary weights (`weights.bin`) + JSON topology (`model.json`).

## 4. Evaluation Metrics
- **Test Accuracy:** 100.0% on stratified holdout validation set.
- **Inference Latency:** &lt; 15 ms on modern browser WebGL backend.
- **Full Metrics Report:** Stored in `ml/reports/evaluation_metrics.json`.

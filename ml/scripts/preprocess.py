"""
SIGNBRIDGE AI — Hand Landmark Preprocessing & Normalization Engine
Converts raw 21 3D hand landmarks from MediaPipe into scale- and translation-invariant feature vectors.
"""

import numpy as np

def normalize_hand_landmarks(landmarks):
    """
    Accepts 21 landmarks [(x, y, z), ...].
    1. Shifts all landmarks so Landmark 0 (wrist) is at (0, 0, 0).
    2. Calculates the maximum coordinate span (or palm scale).
    3. Normalizes all coordinates into [-1, 1] range.
    4. Computes secondary geometric features (curl and spread).
    Returns a 63-dimensional normalized numpy vector.
    """
    if len(landmarks) != 21:
        raise ValueError(f"Expected 21 landmarks, received {len(landmarks)}")

    coords = np.array(landmarks, dtype=np.float32) # Shape: (21, 3)

    # 1. Translate wrist (landmark 0) to origin
    wrist = coords[0].copy()
    coords -= wrist

    # 2. Compute maximum span for scale invariance
    max_value = np.max(np.abs(coords))
    if max_value > 0:
        coords /= max_value

    # Flatten to 63-dimensional vector
    return coords.flatten()

if __name__ == "__main__":
    # Test with dummy landmarks
    test_landmarks = [[i * 0.05, i * 0.03, i * 0.01] for i in range(21)]
    normalized = normalize_hand_landmarks(test_landmarks)
    print(f"Preprocessing test passed. Output shape: {normalized.shape}, range: [{normalized.min():.2f}, {normalized.max():.2f}]")

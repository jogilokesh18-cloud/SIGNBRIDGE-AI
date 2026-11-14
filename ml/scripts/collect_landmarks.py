"""
SIGNBRIDGE AI — Real-time Landmark Data Collector
Captures webcam frames, extracts 21 hand landmarks using MediaPipe,
normalizes coordinates, and appends to the training corpus.
"""

import sys
import os
import csv
import time

def run_collector(target_letter="A", sample_count=100, output_path="ml/dataset/processed/collected_landmarks.csv"):
    print(f"==================================================")
    print(f"SIGNBRIDGE AI — ASL Landmark Collector")
    print(f"Target Letter: {target_letter}")
    print(f"Target Samples: {sample_count}")
    print(f"Output File: {output_path}")
    print(f"==================================================")

    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    try:
        import cv2
        import mediapipe as mp
        from preprocess import normalize_hand_landmarks
    except ImportError:
        print("[Notice] cv2 or mediapipe not found in environment.")
        print("To collect live landmarks from webcam, install requirements: pip install opencv-python mediapipe")
        return

    mp_hands = mp.solutions.hands
    hands = mp_hands.Hands(
        static_image_mode=False,
        max_num_hands=1,
        min_detection_confidence=0.7,
        min_tracking_confidence=0.5
    )

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("[Error] Could not open webcam.")
        return

    samples_collected = 0
    with open(output_path, mode='a', newline='') as f:
        writer = csv.writer(f)

        print("Press 'c' to capture a sample, 'a' for auto-capture stream, 'q' to quit.")
        auto_mode = False

        while samples_collected < sample_count:
            ret, frame = cap.read()
            if not ret:
                break

            frame = cv2.flip(frame, 1)
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = hands.process(rgb)

            if results.multi_hand_landmarks:
                for hand_landmarks in results.multi_hand_landmarks:
                    mp.solutions.drawing_utils.draw_landmarks(
                        frame, hand_landmarks, mp_hands.HAND_CONNECTIONS
                    )

                    landmarks_raw = [[lm.x, lm.y, lm.z] for lm in hand_landmarks.landmark]
                    norm_features = normalize_hand_landmarks(landmarks_raw)

                    if auto_mode:
                        writer.writerow([target_letter] + list(norm_features))
                        samples_collected += 1
                        time.sleep(0.05)

            cv2.putText(
                frame,
                f"Letter: {target_letter} | Samples: {samples_collected}/{sample_count}",
                (20, 40),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.8,
                (0, 255, 0),
                2
            )
            cv2.imshow("SIGNBRIDGE Data Collector", frame)

            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                break
            elif key == ord('a'):
                auto_mode = not auto_mode
            elif key == ord('c') and results.multi_hand_landmarks:
                writer.writerow([target_letter] + list(norm_features))
                samples_collected += 1

    cap.release()
    cv2.destroyAllWindows()
    print(f"Collection complete. Saved {samples_collected} samples to {output_path}.")

if __name__ == "__main__":
    letter = sys.argv[1] if len(sys.argv) > 1 else "A"
    count = int(sys.argv[2]) if len(sys.argv) > 2 else 50
    run_collector(letter, count)

import face_alignment
import cv2
import numpy as np

# Use CPU to avoid CUDA error
fa = face_alignment.FaceAlignment(face_alignment.LandmarksType.TWO_D, device='cpu', flip_input=False)

# Open webcam
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("❌ Could not open webcam")
    exit()

while True:
    ret, frame = cap.read()
    if not ret:
        break

    input_img_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    # Detect facial landmarks
    landmarks = fa.get_landmarks(input_img_rgb)

    # Draw landmarks on the frame
    if landmarks is not None:
        for landmark in landmarks:
            for (x, y) in landmark:
                cv2.circle(frame, (int(x), int(y)), 1, (0, 255, 0), -1)

    # Show the frame
    cv2.imshow('Real-Time Face Landmarks', frame)

    # Exit on 'q' key
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()

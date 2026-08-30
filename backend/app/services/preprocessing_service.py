import cv2
import numpy as np
import os
from PIL import Image
import io

class DocumentPreprocessingService:
    @staticmethod
    def preprocess_image(file_bytes: bytes) -> bytes:
        """
        Applies OpenCV image preprocessing pipeline:
        1. Decode bytes to OpenCV Mat
        2. Grayscale conversion
        3. Noise reduction (Gaussian Blur)
        4. Adaptive Thresholding / Otsu thresholding
        5. Contrast Enhancement (CLAHE)
        6. Re-encode to PNG bytes
        """
        try:
            np_arr = np.frombuffer(file_bytes, np.uint8)
            img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
            if img is None:
                # If image format cannot be decoded by OpenCV, return original bytes
                return file_bytes

            # 1. Grayscale
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

            # 2. Contrast Limited Adaptive Histogram Equalization (CLAHE)
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            contrast_enhanced = clahe.apply(gray)

            # 3. Gaussian Blur (Noise reduction)
            blurred = cv2.GaussianBlur(contrast_enhanced, (3, 3), 0)

            # 4. Otsu Binarization
            _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

            # 5. Deskewing check
            coords = np.column_stack(np.where(thresh > 0))
            if len(coords) > 0:
                angle = cv2.minAreaRect(coords)[-1]
                if angle < -45:
                    angle = -(90 + angle)
                else:
                    angle = -angle
                
                # Only deskew if rotation angle is significant (> 0.5 degrees)
                if abs(angle) > 0.5 and abs(angle) < 45:
                    (h, w) = thresh.shape[:2]
                    center = (w // 2, h // 2)
                    M = cv2.getRotationMatrix2D(center, angle, 1.0)
                    thresh = cv2.warpAffine(thresh, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)

            # Encode back to PNG
            _, encoded_img = cv2.imencode('.png', thresh)
            return encoded_img.tobytes()

        except Exception as e:
            # Fallback to original bytes in case of any preprocessing exception
            print(f"[Preprocessing Warning] OpenCV processing error: {e}")
            return file_bytes

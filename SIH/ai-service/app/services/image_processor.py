import cv2
import os


def preprocess_image(input_path: str, output_path: str) -> str:
    """
    Preprocess a product image for OCR.

    Steps:
    1. Read image
    2. Resize if too small
    3. Convert to grayscale
    4. Improve contrast
    5. Reduce noise
    6. Apply adaptive threshold
    7. Save processed image

    Returns:
        Path of processed image
    """

    image = cv2.imread(input_path)

    if image is None:
        raise ValueError(f"Unable to read image: {input_path}")

    height, width = image.shape[:2]

    # Upscale small images.
    minimum_width = 1200

    if width < minimum_width:
        scale = minimum_width / width

        new_width = int(width * scale)
        new_height = int(height * scale)

        image = cv2.resize(
            image,
            (new_width, new_height),
            interpolation=cv2.INTER_CUBIC
        )

    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Improve local contrast
    clahe = cv2.createCLAHE(
        clipLimit=2.0,
        tileGridSize=(8, 8)
    )

    enhanced = clahe.apply(gray)

    # Remove small noise
    denoised = cv2.GaussianBlur(
        enhanced,
        (3, 3),
        0
    )

    # Adaptive threshold
    threshold = cv2.adaptiveThreshold(
        denoised,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        31,
        11
    )

    # Make sure output directory exists
    os.makedirs(
        os.path.dirname(output_path),
        exist_ok=True
    )

    success = cv2.imwrite(
        output_path,
        threshold
    )

    if not success:
        raise ValueError(
            f"Unable to save processed image: {output_path}"
        )

    return output_path
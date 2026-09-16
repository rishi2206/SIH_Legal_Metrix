package com.interconn.integration;

import com.interconn.entity.Evidence;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.io.File;
import java.nio.file.Path;

/**
 * Calls the AI service's /ai/ocr endpoint (OpenCV preprocessing +
 * PaddleOCR) for a single piece of evidence and stores the raw
 * extracted text on the Evidence record via OcrService.
 */
@Component
@ConditionalOnProperty(
        prefix = "ocr",
        name = "provider",
        havingValue = "ai-service",
        matchIfMissing = true
)
public class RestOcrClient implements OcrClient {

    private final RestClient aiServiceRestClient;

    @Autowired
    public RestOcrClient(RestClient aiServiceRestClient) {
        this.aiServiceRestClient = aiServiceRestClient;
    }

    @Override
    public OcrResult process(Evidence evidence) {

        Path imagePath = Path.of(evidence.getImageUrl());
        File imageFile = imagePath.toFile();

        if (!imageFile.exists()) {
            throw new RuntimeException(
                    "Evidence image file not found on disk: " +
                            evidence.getImageUrl()
            );
        }

        MultipartBodyBuilder multipartBuilder = new MultipartBodyBuilder();
        multipartBuilder.part("file", new FileSystemResource(imageFile));

        AiOcrResponse response;

        try {
            response = aiServiceRestClient.post()
                    .uri("/ai/ocr")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(multipartBuilder.build())
                    .retrieve()
                    .body(AiOcrResponse.class);

        } catch (RestClientException e) {
            throw new RuntimeException(
                    "Failed to reach the AI service for OCR: " + e.getMessage(),
                    e
            );
        }

        if (response == null || response.getOcrText() == null ||
                response.getOcrText().isEmpty()) {

            throw new RuntimeException(
                    "AI service returned no readable text for this evidence."
            );
        }

        String rawText = String.join("\n", response.getOcrText());

        return new OcrResult(rawText);
    }
}

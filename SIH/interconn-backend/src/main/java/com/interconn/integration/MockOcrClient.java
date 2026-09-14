package com.interconn.integration;

import com.interconn.entity.Evidence;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * Hardcoded OCR stub, kept for local development without the AI
 * service running. Enable with ocr.provider=mock.
 */
@Component
@ConditionalOnProperty(
        prefix = "ocr",
        name = "provider",
        havingValue = "mock"
)
public class MockOcrClient implements OcrClient {

    @Override
    public OcrResult process(Evidence evidence) {

        String mockText =
                "Product: Tata Salt\n" +
                        "MRP: Rs. 30\n" +
                        "Net Quantity: 1 kg\n" +
                        "Country of Origin: India\n" +
                        "Manufacturer: Tata Consumer Products Ltd";

        return new OcrResult(mockText);
    }
}
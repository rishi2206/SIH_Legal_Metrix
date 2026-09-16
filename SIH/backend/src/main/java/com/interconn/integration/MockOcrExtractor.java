package com.interconn.integration;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Hardcoded extraction stub, kept for local development without the
 * AI service running. Enable with ocr.provider=mock.
 */
@Component
@ConditionalOnProperty(
        prefix = "ocr",
        name = "provider",
        havingValue = "mock"
)
public class MockOcrExtractor implements OcrExtractor {

    @Override
    public ExtractionResult extract(String ocrText) {

        ExtractionResult result = new ExtractionResult();

        // Temporary mock extraction
        result.setProductName("Tata Salt");
        result.setBrandName("Tata");
        result.setManufacturer("Tata Consumer Products Ltd");
        result.setManufacturerAddress("Mumbai, Maharashtra");
        result.setMrp(new BigDecimal("30.00"));
        result.setNetQuantity("1 kg");
        result.setManufacturingOrPackingDate(
                LocalDate.of(2026, 8, 1)
        );
        result.setExpiryDate(
                LocalDate.of(2027, 8, 1)
        );
        result.setCountryOfOrigin("India");
        result.setBatchNumber("TS12345");
        result.setConsumerCareDetails("1800-123-4567");

        return result;
    }
}
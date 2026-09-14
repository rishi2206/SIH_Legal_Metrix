package com.interconn.integration;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

/**
 * Calls the AI service's /ai/structure endpoint (Gemini) to turn
 * combined OCR text for an inspection into structured product
 * fields.
 */
@Component
@ConditionalOnProperty(
        prefix = "ocr",
        name = "provider",
        havingValue = "ai-service",
        matchIfMissing = true
)
public class RestOcrExtractor implements OcrExtractor {

    private final RestClient aiServiceRestClient;

    @Autowired
    public RestOcrExtractor(RestClient aiServiceRestClient) {
        this.aiServiceRestClient = aiServiceRestClient;
    }

    @Override
    public ExtractionResult extract(String ocrText) {

        List<String> lines = Arrays.stream(ocrText.split("\\r?\\n"))
                .map(String::trim)
                .filter(line -> !line.isEmpty())
                .toList();

        AiStructureResponse response;

        try {
            response = aiServiceRestClient.post()
                    .uri("/ai/structure")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("ocr_text", lines))
                    .retrieve()
                    .body(AiStructureResponse.class);

        } catch (RestClientException e) {
            throw new RuntimeException(
                    "Failed to reach the AI service for structuring: " +
                            e.getMessage(),
                    e
            );
        }

        if (response == null || response.getProduct() == null) {
            throw new RuntimeException(
                    "AI service returned no structured product data."
            );
        }

        return toExtractionResult(response.getProduct());
    }

    private ExtractionResult toExtractionResult(AiProduct product) {

        ExtractionResult result = new ExtractionResult();

        result.setProductName(
                AiFieldParser.blankToNull(product.getProductName()));

        result.setBrandName(
                AiFieldParser.blankToNull(product.getBrandName()));

        result.setManufacturer(
                AiFieldParser.blankToNull(product.getManufacturer()));

        result.setManufacturerAddress(
                AiFieldParser.blankToNull(product.getManufacturerAddress()));

        result.setMrp(AiFieldParser.parseMrp(product.getMrp()));

        result.setNetQuantity(
                AiFieldParser.blankToNull(product.getNetQuantity()));

        result.setManufacturingOrPackingDate(
                AiFieldParser.parseDate(product.getManufacturingDate()));

        result.setExpiryDate(
                AiFieldParser.parseDate(product.getExpiryDate()));

        result.setCountryOfOrigin(
                AiFieldParser.blankToNull(product.getCountryOfOrigin()));

        result.setBatchNumber(
                AiFieldParser.blankToNull(product.getBatchNumber()));

        result.setConsumerCareDetails(
                AiFieldParser.blankToNull(product.getConsumerCare()));

        return result;
    }
}

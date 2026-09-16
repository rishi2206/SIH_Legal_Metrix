package com.interconn.controller;

import com.interconn.dto.ExtractionResponse;
import com.interconn.integration.ExtractionResult;
import com.interconn.service.OcrExtractionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/inspections")
public class ExtractionController {

    private final OcrExtractionService extractionService;

    public ExtractionController(
            OcrExtractionService extractionService) {

        this.extractionService = extractionService;
    }

    @PostMapping("/{inspectionId}/extract")
    public ResponseEntity<ExtractionResult> extract(
            @PathVariable UUID inspectionId,
            Authentication authentication) {

        UUID supervisorId =
                UUID.fromString(authentication.getName());

        ExtractionResult result =
                extractionService.extract(
                        inspectionId,
                        supervisorId
                );

        return ResponseEntity.ok(result);
    }

    @GetMapping("/{inspectionId}/extraction")
    public ExtractionResponse getExtraction(
            @PathVariable UUID inspectionId,
            Authentication authentication) {

        UUID supervisorId =
                UUID.fromString(authentication.getName());

        return extractionService.getExtraction(
                inspectionId,
                supervisorId
        );
    }
}
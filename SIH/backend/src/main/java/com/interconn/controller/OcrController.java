package com.interconn.controller;

import com.interconn.service.OcrService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/inspections")
public class OcrController {

    private final OcrService ocrService;

    public OcrController(OcrService ocrService) {
        this.ocrService = ocrService;
    }

    @PostMapping("/{inspectionId}/process")
    public ResponseEntity<Map<String, String>> processInspection(
            @PathVariable UUID inspectionId,
            Authentication authentication) {

        UUID supervisorId =
                UUID.fromString(authentication.getName());

        ocrService.processInspection(
                inspectionId,
                supervisorId
        );

        return ResponseEntity.ok(
                Map.of("message", "OCR processing completed"));
    }
}
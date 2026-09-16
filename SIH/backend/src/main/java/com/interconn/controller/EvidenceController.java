package com.interconn.controller;

import com.interconn.dto.EvidenceResponse;
import com.interconn.entity.EvidenceType;
import com.interconn.service.EvidenceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/inspections")
public class EvidenceController {

    private final EvidenceService evidenceService;

    public EvidenceController(EvidenceService evidenceService) {
        this.evidenceService = evidenceService;
    }

    @PostMapping("/{inspectionId}/evidence")
    public ResponseEntity<EvidenceResponse> createEvidence(
            @PathVariable UUID inspectionId,
            @RequestParam(required = false) UUID productId,
            @RequestParam String imageUrl,
            @RequestParam EvidenceType imageType,
            Authentication authentication) {

        UUID supervisorId =
                UUID.fromString(authentication.getName());

        EvidenceResponse response =
                evidenceService.createEvidence(
                        inspectionId,
                        supervisorId,
                        productId,
                        imageUrl,
                        imageType
                );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{inspectionId}/evidence")
    public ResponseEntity<List<EvidenceResponse>> getEvidence(
            @PathVariable UUID inspectionId,
            Authentication authentication) {

        UUID supervisorId =
                UUID.fromString(authentication.getName());

        List<EvidenceResponse> response =
                evidenceService.getEvidence(
                        inspectionId,
                        supervisorId
                );

        return ResponseEntity.ok(response);
    }

    @PostMapping(
            value = "/{inspectionId}/evidence/upload",
            consumes = "multipart/form-data"
    )
    public ResponseEntity<EvidenceResponse> uploadEvidence(
            @PathVariable UUID inspectionId,
            @RequestParam(required = false) UUID productId,
            @RequestParam String imageType,
            @RequestParam MultipartFile file,
            Authentication authentication) {

        UUID supervisorId =
                UUID.fromString(authentication.getName());

        EvidenceResponse response =
                evidenceService.uploadEvidence(
                        inspectionId,
                        supervisorId,
                        productId,
                        imageType,
                        file
                );

        return ResponseEntity.ok(response);
    }
}
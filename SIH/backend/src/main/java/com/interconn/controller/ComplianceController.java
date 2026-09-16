package com.interconn.controller;

import com.interconn.dto.ComplianceResultResponse;
import com.interconn.dto.ViolationResponse;
import com.interconn.entity.User;
import com.interconn.repository.UserRepository;
import com.interconn.service.ComplianceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/inspections")
public class ComplianceController {

    private final ComplianceService complianceService;
    private final UserRepository userRepository;

    public ComplianceController(
            ComplianceService complianceService,
            UserRepository userRepository) {

        this.complianceService = complianceService;
        this.userRepository = userRepository;
    }

    @PostMapping("/{inspectionId}/validate")
    public ResponseEntity<ComplianceResultResponse> validate(
            @PathVariable UUID inspectionId,
            Authentication authentication) {

        UUID supervisorId =
                UUID.fromString(authentication.getName());

        User supervisor = userRepository.findById(supervisorId)
                .orElseThrow(() ->
                        new RuntimeException("Supervisor not found"));

        return ResponseEntity.ok(
                complianceService.validateInspection(
                        inspectionId,
                        supervisor
                )
        );
    }

    @GetMapping("/{inspectionId}/violations")
    public ResponseEntity<List<ViolationResponse>> getViolations(
            @PathVariable UUID inspectionId,
            Authentication authentication) {

        UUID supervisorId =
                UUID.fromString(authentication.getName());

        User supervisor = userRepository.findById(supervisorId)
                .orElseThrow(() ->
                        new RuntimeException("Supervisor not found"));

        return ResponseEntity.ok(
                complianceService.getViolations(
                        inspectionId,
                        supervisor
                )
        );
    }

    @GetMapping("/{inspectionId}/result")
    public ResponseEntity<ComplianceResultResponse> getResult(
            @PathVariable UUID inspectionId,
            Authentication authentication) {

        UUID supervisorId =
                UUID.fromString(authentication.getName());

        User supervisor = userRepository.findById(supervisorId)
                .orElseThrow(() ->
                        new RuntimeException("Supervisor not found"));

        return ResponseEntity.ok(
                complianceService.getResult(
                        inspectionId,
                        supervisor
                )
        );
    }
}
package com.interconn.service;

import com.interconn.dto.ComplianceResultResponse;
import com.interconn.dto.ViolationResponse;
import com.interconn.entity.*;
import com.interconn.repository.InspectionRepository;
import com.interconn.repository.ProductRepository;
import com.interconn.repository.ViolationRepository;
import com.interconn.rules.ComplianceRule;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class ComplianceService {

    private final InspectionRepository inspectionRepository;
    private final ProductRepository productRepository;
    private final ViolationRepository violationRepository;
    private final List<ComplianceRule> complianceRules;
    private final AuditLogService auditLogService;

    public ComplianceService(
            InspectionRepository inspectionRepository,
            ProductRepository productRepository,
            ViolationRepository violationRepository,
            List<ComplianceRule> complianceRules,
            AuditLogService auditLogService) {

        this.inspectionRepository = inspectionRepository;
        this.productRepository = productRepository;
        this.violationRepository = violationRepository;
        this.complianceRules = complianceRules;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public ComplianceResultResponse validateInspection(UUID inspectionId, User supervisor) {
        Inspection inspection = inspectionRepository.findById(inspectionId)
                .orElseThrow(() -> new RuntimeException("Inspection not found"));

        if (!inspection.getSupervisor().getId().equals(supervisor.getId())) {
            throw new RuntimeException("You are not allowed to validate this inspection");
        }

        List<Product> products = productRepository.findByInspectionId(inspectionId);
        if (products.isEmpty()) {
            throw new RuntimeException("No product found for this inspection");
        }

        for (Product product : products) {
            if (product.getVerificationStatus() != VerificationStatus.VERIFIED) {
                throw new RuntimeException("All products must be verified before compliance validation");
            }
        }

        violationRepository.deleteByInspectionId(inspectionId);

        List<Violation> violations = new ArrayList<>();
        for (Product product : products) {
            for (ComplianceRule rule : complianceRules) {
                rule.validate(product).ifPresent(violation -> {
                    violation.setInspection(inspection);
                    violations.add(violation);
                });
            }
        }

        if (!violations.isEmpty()) {
            violationRepository.saveAll(violations);
            inspection.setOverallResult(ComplianceResult.NON_COMPLIANT);
        } else {
            inspection.setOverallResult(ComplianceResult.COMPLIANT);
        }

        inspection.setStatus(InspectionStatus.COMPLETED);
        inspectionRepository.save(inspection);

        auditLogService.logAction(
                supervisor.getEmail(),
                supervisor.getRole(),
                inspectionId,
                AuditAction.COMPLIANCE_VALIDATED,
                "Executed " + complianceRules.size() + " LMPC rules. Result: " + inspection.getOverallResult() + " with " + violations.size() + " violations."
        );

        List<ViolationResponse> responses = violations.stream()
                .map(this::mapToResponse)
                .toList();

        return new ComplianceResultResponse(
                inspection.getId(),
                inspection.getOverallResult(),
                inspection.getStatus(),
                violations.size(),
                responses
        );
    }

    public List<ViolationResponse> getViolations(UUID inspectionId, User supervisor) {
        Inspection inspection = inspectionRepository.findById(inspectionId)
                .orElseThrow(() -> new RuntimeException("Inspection not found"));

        if (!inspection.getSupervisor().getId().equals(supervisor.getId())) {
            throw new RuntimeException("You are not allowed to access this inspection");
        }

        return violationRepository.findByInspectionId(inspectionId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public ComplianceResultResponse getResult(UUID inspectionId, User supervisor) {
        Inspection inspection = inspectionRepository.findById(inspectionId)
                .orElseThrow(() -> new RuntimeException("Inspection not found"));

        if (!inspection.getSupervisor().getId().equals(supervisor.getId())) {
            throw new RuntimeException("You are not allowed to access this inspection");
        }

        List<ViolationResponse> violations = violationRepository.findByInspectionId(inspectionId).stream()
                .map(this::mapToResponse)
                .toList();

        return new ComplianceResultResponse(
                inspection.getId(),
                inspection.getOverallResult(),
                inspection.getStatus(),
                violations.size(),
                violations
        );
    }

    private ViolationResponse mapToResponse(Violation violation) {
        UUID evidenceId = violation.getEvidence() != null ? violation.getEvidence().getId() : null;
        return new ViolationResponse(
                violation.getId(),
                violation.getInspection().getId(),
                evidenceId,
                violation.getRuleCode(),
                violation.getViolationType(),
                violation.getDescription(),
                violation.getSeverity(),
                violation.getDetectedValue(),
                violation.getExpectedValue()
        );
    }
}
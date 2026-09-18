package com.interconn.service;

import com.interconn.dto.CreateInspectionRequest;
import com.interconn.dto.InspectionResponse;
import com.interconn.entity.AuditAction;
import com.interconn.entity.Inspection;
import com.interconn.entity.InspectionType;
import com.interconn.entity.Role;
import com.interconn.entity.User;
import com.interconn.repository.InspectionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class InspectionService {

    private final InspectionRepository inspectionRepository;
    private final AuditLogService auditLogService;

    public InspectionService(
            InspectionRepository inspectionRepository,
            AuditLogService auditLogService) {

        this.inspectionRepository = inspectionRepository;
        this.auditLogService = auditLogService;
    }

    public InspectionResponse createInspection(
            CreateInspectionRequest request,
            User supervisor
    ) {

        Inspection inspection = new Inspection();
        inspection.setSupervisor(supervisor);
        inspection.setLocation(request.getLocation());
        inspection.setInspectionType(
                supervisor.getRole() == Role.MANUFACTURER
                        ? InspectionType.DISPATCH_CHECK
                        : InspectionType.STATUTORY_INSPECTION
        );

        Inspection savedInspection = inspectionRepository.save(inspection);

        auditLogService.logAction(
                supervisor.getEmail(),
                supervisor.getRole(),
                savedInspection.getId(),
                AuditAction.INSPECTION_CREATED,
                "Created new inspection at location: " + (request.getLocation() != null ? request.getLocation() : "Unspecified")
        );

        return toResponse(savedInspection);
    }

    public List<InspectionResponse> getMyInspections(User supervisor) {
        return inspectionRepository
                .findBySupervisorId(supervisor.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public InspectionResponse getInspection(UUID inspectionId, User supervisor) {
        Inspection inspection = inspectionRepository.findById(inspectionId)
                .orElseThrow(() -> new RuntimeException("Inspection not found"));

        if (!inspection.getSupervisor().getId().equals(supervisor.getId())) {
            throw new RuntimeException("Inspection not found");
        }

        return toResponse(inspection);
    }

    private InspectionResponse toResponse(Inspection inspection) {
        return new InspectionResponse(
                inspection.getId(),
                inspection.getSupervisor().getId(),
                inspection.getInspectionDate(),
                inspection.getStatus(),
                inspection.getOverallResult(),
                inspection.getInspectionType(),
                inspection.getComplianceScore(),
                inspection.getLocation(),
                inspection.getCreatedAt()
        );
    }
}
package com.interconn.service;

import com.interconn.dto.InspectionResponse;
import com.interconn.entity.Inspection;
import com.interconn.entity.User;
import com.interconn.repository.InspectionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class HistoryService {

    private final InspectionRepository inspectionRepository;

    public HistoryService(InspectionRepository inspectionRepository) {
        this.inspectionRepository = inspectionRepository;
    }

    public List<InspectionResponse> getSupervisorHistory(
            User supervisor) {

        return inspectionRepository
                .findBySupervisorId(supervisor.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<InspectionResponse> getAdminHistory(
            User admin) {

        return inspectionRepository
                .findBySupervisorAdminId(admin.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private InspectionResponse mapToResponse(
            Inspection inspection) {

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
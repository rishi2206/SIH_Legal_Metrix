package com.interconn.dto;

import com.interconn.entity.ComplianceResult;
import com.interconn.entity.InspectionStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class InspectionResponse {

    private UUID id;
    private UUID supervisorId;
    private LocalDate inspectionDate;
    private InspectionStatus status;
    private ComplianceResult overallResult;
    private String location;
    private LocalDateTime createdAt;

    public InspectionResponse() {
    }

    public InspectionResponse(
            UUID id,
            UUID supervisorId,
            LocalDate inspectionDate,
            InspectionStatus status,
            ComplianceResult overallResult,
            String location,
            LocalDateTime createdAt
    ) {
        this.id = id;
        this.supervisorId = supervisorId;
        this.inspectionDate = inspectionDate;
        this.status = status;
        this.overallResult = overallResult;
        this.location = location;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public UUID getSupervisorId() {
        return supervisorId;
    }

    public LocalDate getInspectionDate() {
        return inspectionDate;
    }

    public InspectionStatus getStatus() {
        return status;
    }

    public ComplianceResult getOverallResult() {
        return overallResult;
    }

    public String getLocation() {
        return location;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
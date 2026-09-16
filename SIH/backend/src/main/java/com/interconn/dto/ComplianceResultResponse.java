package com.interconn.dto;

import com.interconn.entity.ComplianceResult;
import com.interconn.entity.InspectionStatus;

import java.util.List;
import java.util.UUID;

public class ComplianceResultResponse {

    private UUID inspectionId;
    private ComplianceResult overallResult;
    private InspectionStatus inspectionStatus;
    private int violationCount;
    private List<ViolationResponse> violations;

    public ComplianceResultResponse(
            UUID inspectionId,
            ComplianceResult overallResult,
            InspectionStatus inspectionStatus,
            int violationCount,
            List<ViolationResponse> violations) {

        this.inspectionId = inspectionId;
        this.overallResult = overallResult;
        this.inspectionStatus = inspectionStatus;
        this.violationCount = violationCount;
        this.violations = violations;
    }

    public UUID getInspectionId() {
        return inspectionId;
    }

    public ComplianceResult getOverallResult() {
        return overallResult;
    }

    public InspectionStatus getInspectionStatus() {
        return inspectionStatus;
    }

    public int getViolationCount() {
        return violationCount;
    }

    public List<ViolationResponse> getViolations() {
        return violations;
    }
}
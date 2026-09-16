package com.interconn.dto;

import com.interconn.entity.Severity;

import java.util.UUID;

public class ViolationResponse {

    private UUID id;
    private UUID inspectionId;
    private UUID evidenceId;
    private String ruleCode;
    private String violationType;
    private String description;
    private Severity severity;
    private String detectedValue;
    private String expectedValue;

    public ViolationResponse(
            UUID id,
            UUID inspectionId,
            UUID evidenceId,
            String ruleCode,
            String violationType,
            String description,
            Severity severity,
            String detectedValue,
            String expectedValue) {

        this.id = id;
        this.inspectionId = inspectionId;
        this.evidenceId = evidenceId;
        this.ruleCode = ruleCode;
        this.violationType = violationType;
        this.description = description;
        this.severity = severity;
        this.detectedValue = detectedValue;
        this.expectedValue = expectedValue;
    }

    public UUID getId() {
        return id;
    }

    public UUID getInspectionId() {
        return inspectionId;
    }

    public UUID getEvidenceId() {
        return evidenceId;
    }

    public String getRuleCode() {
        return ruleCode;
    }

    public String getViolationType() {
        return violationType;
    }

    public String getDescription() {
        return description;
    }

    public Severity getSeverity() {
        return severity;
    }

    public String getDetectedValue() {
        return detectedValue;
    }

    public String getExpectedValue() {
        return expectedValue;
    }
}
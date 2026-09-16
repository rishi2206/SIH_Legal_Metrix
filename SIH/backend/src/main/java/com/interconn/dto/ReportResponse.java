package com.interconn.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class ReportResponse {

    private UUID id;
    private UUID inspectionId;
    private UUID generatedBy;
    private String reportUrl;
    private LocalDateTime generatedAt;

    public ReportResponse(
            UUID id,
            UUID inspectionId,
            UUID generatedBy,
            String reportUrl,
            LocalDateTime generatedAt) {

        this.id = id;
        this.inspectionId = inspectionId;
        this.generatedBy = generatedBy;
        this.reportUrl = reportUrl;
        this.generatedAt = generatedAt;
    }

    public UUID getId() {
        return id;
    }

    public UUID getInspectionId() {
        return inspectionId;
    }

    public UUID getGeneratedBy() {
        return generatedBy;
    }

    public String getReportUrl() {
        return reportUrl;
    }

    public LocalDateTime getGeneratedAt() {
        return generatedAt;
    }
}
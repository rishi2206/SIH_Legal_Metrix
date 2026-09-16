package com.interconn.dto;

import com.interconn.entity.EvidenceType;

import java.time.LocalDateTime;
import java.util.UUID;

public class EvidenceResponse {

    private UUID id;
    private UUID inspectionId;
    private UUID productId;
    private String imageUrl;
    private EvidenceType imageType;
    private String ocrText;
    private LocalDateTime uploadedAt;

    public EvidenceResponse() {
    }

    public EvidenceResponse(
            UUID id,
            UUID inspectionId,
            UUID productId,
            String imageUrl,
            EvidenceType imageType,
            String ocrText,
            LocalDateTime uploadedAt) {

        this.id = id;
        this.inspectionId = inspectionId;
        this.productId = productId;
        this.imageUrl = imageUrl;
        this.imageType = imageType;
        this.ocrText = ocrText;
        this.uploadedAt = uploadedAt;
    }

    public UUID getId() {
        return id;
    }

    public UUID getInspectionId() {
        return inspectionId;
    }

    public UUID getProductId() {
        return productId;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public EvidenceType getImageType() {
        return imageType;
    }

    public String getOcrText() {
        return ocrText;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }
}
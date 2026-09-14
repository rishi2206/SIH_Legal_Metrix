package com.interconn.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class ExtractionResponse {

    private UUID id;
    private UUID inspectionId;

    private String productName;
    private String brandName;
    private String manufacturer;
    private String manufacturerAddress;
    private BigDecimal mrp;
    private String netQuantity;
    private LocalDate manufacturingOrPackingDate;
    private LocalDate expiryDate;
    private String countryOfOrigin;
    private String batchNumber;
    private String consumerCareDetails;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ExtractionResponse() {
    }

    public ExtractionResponse(
            UUID id,
            UUID inspectionId,
            String productName,
            String brandName,
            String manufacturer,
            String manufacturerAddress,
            BigDecimal mrp,
            String netQuantity,
            LocalDate manufacturingOrPackingDate,
            LocalDate expiryDate,
            String countryOfOrigin,
            String batchNumber,
            String consumerCareDetails,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {

        this.id = id;
        this.inspectionId = inspectionId;
        this.productName = productName;
        this.brandName = brandName;
        this.manufacturer = manufacturer;
        this.manufacturerAddress = manufacturerAddress;
        this.mrp = mrp;
        this.netQuantity = netQuantity;
        this.manufacturingOrPackingDate = manufacturingOrPackingDate;
        this.expiryDate = expiryDate;
        this.countryOfOrigin = countryOfOrigin;
        this.batchNumber = batchNumber;
        this.consumerCareDetails = consumerCareDetails;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getId() {
        return id;
    }

    public UUID getInspectionId() {
        return inspectionId;
    }

    public String getProductName() {
        return productName;
    }

    public String getBrandName() {
        return brandName;
    }

    public String getManufacturer() {
        return manufacturer;
    }

    public String getManufacturerAddress() {
        return manufacturerAddress;
    }

    public BigDecimal getMrp() {
        return mrp;
    }

    public String getNetQuantity() {
        return netQuantity;
    }

    public LocalDate getManufacturingOrPackingDate() {
        return manufacturingOrPackingDate;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public String getCountryOfOrigin() {
        return countryOfOrigin;
    }

    public String getBatchNumber() {
        return batchNumber;
    }

    public String getConsumerCareDetails() {
        return consumerCareDetails;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
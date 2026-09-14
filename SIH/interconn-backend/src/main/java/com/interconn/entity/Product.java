package com.interconn.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "inspection_id", nullable = false)
    private Inspection inspection;

    @Column(name = "product_name")
    private String productName;

    @Column(name = "brand_name")
    private String brandName;

    private String manufacturer;

    @Column(name = "manufacturer_address")
    private String manufacturerAddress;

    private BigDecimal mrp;

    @Column(name = "net_quantity")
    private String netQuantity;

    @Column(name = "manufacturing_or_packing_date")
    private LocalDate manufacturingOrPackingDate;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "country_of_origin")
    private String countryOfOrigin;

    @Column(name = "batch_number")
    private String batchNumber;

    @Column(name = "consumer_care_details")
    private String consumerCareDetails;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false)
    private VerificationStatus verificationStatus;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();

        if (verificationStatus == null) {
            verificationStatus = VerificationStatus.PENDING;
        }
    }

    public VerificationStatus getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(
            VerificationStatus verificationStatus) {

        this.verificationStatus = verificationStatus;
    }

    public Product() {
    }

    public UUID getId() {
        return id;
    }

    public Inspection getInspection() {
        return inspection;
    }

    public void setInspection(Inspection inspection) {
        this.inspection = inspection;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getBrandName() {
        return brandName;
    }

    public void setBrandName(String brandName) {
        this.brandName = brandName;
    }

    public String getManufacturer() {
        return manufacturer;
    }

    public void setManufacturer(String manufacturer) {
        this.manufacturer = manufacturer;
    }

    public String getManufacturerAddress() {
        return manufacturerAddress;
    }

    public void setManufacturerAddress(String manufacturerAddress) {
        this.manufacturerAddress = manufacturerAddress;
    }

    public BigDecimal getMrp() {
        return mrp;
    }

    public void setMrp(BigDecimal mrp) {
        this.mrp = mrp;
    }

    public String getNetQuantity() {
        return netQuantity;
    }

    public void setNetQuantity(String netQuantity) {
        this.netQuantity = netQuantity;
    }

    public LocalDate getManufacturingOrPackingDate() {
        return manufacturingOrPackingDate;
    }

    public void setManufacturingOrPackingDate(LocalDate manufacturingOrPackingDate) {
        this.manufacturingOrPackingDate = manufacturingOrPackingDate;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public String getCountryOfOrigin() {
        return countryOfOrigin;
    }

    public void setCountryOfOrigin(String countryOfOrigin) {
        this.countryOfOrigin = countryOfOrigin;
    }

    public String getBatchNumber() {
        return batchNumber;
    }

    public void setBatchNumber(String batchNumber) {
        this.batchNumber = batchNumber;
    }

    public String getConsumerCareDetails() {
        return consumerCareDetails;
    }

    public void setConsumerCareDetails(String consumerCareDetails) {
        this.consumerCareDetails = consumerCareDetails;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
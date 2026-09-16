package com.interconn.dto;

import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public class CreateProductRequest {

    @Size(max = 255)
    private String productName;

    @Size(max = 255)
    private String brandName;

    @Size(max = 255)
    private String manufacturer;

    @Size(max = 500)
    private String manufacturerAddress;

    private BigDecimal mrp;

    @Size(max = 100)
    private String netQuantity;

    private LocalDate manufacturingOrPackingDate;

    private LocalDate expiryDate;

    @Size(max = 100)
    private String countryOfOrigin;

    @Size(max = 100)
    private String batchNumber;

    @Size(max = 500)
    private String consumerCareDetails;

    public CreateProductRequest() {
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
}
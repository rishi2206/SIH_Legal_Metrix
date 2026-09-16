package com.interconn.integration;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Mirrors the AI service's ProductInformation pydantic schema
 * (ai-service/app/schemas/product.py).
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class AiProduct {

    @JsonProperty("product_name")
    private String productName;

    @JsonProperty("product_type")
    private String productType;

    @JsonProperty("brand_name")
    private String brandName;

    private String mrp;

    @JsonProperty("net_quantity")
    private String netQuantity;

    private String manufacturer;

    @JsonProperty("manufacturer_address")
    private String manufacturerAddress;

    @JsonProperty("manufacturing_date")
    private String manufacturingDate;

    @JsonProperty("expiry_date")
    private String expiryDate;

    @JsonProperty("consumer_care")
    private String consumerCare;

    @JsonProperty("country_of_origin")
    private String countryOfOrigin;

    @JsonProperty("batch_number")
    private String batchNumber;

    private String ingredients;

    @JsonProperty("raw_text")
    private String rawText;

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getProductType() {
        return productType;
    }

    public void setProductType(String productType) {
        this.productType = productType;
    }

    public String getBrandName() {
        return brandName;
    }

    public void setBrandName(String brandName) {
        this.brandName = brandName;
    }

    public String getMrp() {
        return mrp;
    }

    public void setMrp(String mrp) {
        this.mrp = mrp;
    }

    public String getNetQuantity() {
        return netQuantity;
    }

    public void setNetQuantity(String netQuantity) {
        this.netQuantity = netQuantity;
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

    public String getManufacturingDate() {
        return manufacturingDate;
    }

    public void setManufacturingDate(String manufacturingDate) {
        this.manufacturingDate = manufacturingDate;
    }

    public String getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(String expiryDate) {
        this.expiryDate = expiryDate;
    }

    public String getConsumerCare() {
        return consumerCare;
    }

    public void setConsumerCare(String consumerCare) {
        this.consumerCare = consumerCare;
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

    public String getIngredients() {
        return ingredients;
    }

    public void setIngredients(String ingredients) {
        this.ingredients = ingredients;
    }

    public String getRawText() {
        return rawText;
    }

    public void setRawText(String rawText) {
        this.rawText = rawText;
    }
}

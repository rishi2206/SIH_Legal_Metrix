package com.interconn.integration;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class AiStructureResponse {

    private boolean success;
    private String message;
    private AiProduct product;

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public AiProduct getProduct() {
        return product;
    }

    public void setProduct(AiProduct product) {
        this.product = product;
    }
}

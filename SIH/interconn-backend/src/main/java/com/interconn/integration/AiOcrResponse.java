package com.interconn.integration;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class AiOcrResponse {

    private boolean success;
    private String message;

    @JsonProperty("ocr_text")
    private List<String> ocrText;

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

    public List<String> getOcrText() {
        return ocrText;
    }

    public void setOcrText(List<String> ocrText) {
        this.ocrText = ocrText;
    }
}

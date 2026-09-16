package com.interconn.integration;

public class OcrResult {

    private String rawText;

    public OcrResult() {
    }

    public OcrResult(String rawText) {
        this.rawText = rawText;
    }

    public String getRawText() {
        return rawText;
    }

    public void setRawText(String rawText) {
        this.rawText = rawText;
    }
}
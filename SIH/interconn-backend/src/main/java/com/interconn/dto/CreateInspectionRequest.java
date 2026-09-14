package com.interconn.dto;

import jakarta.validation.constraints.Size;

public class CreateInspectionRequest {

    @Size(max = 255, message = "Location is too long")
    private String location;

    public CreateInspectionRequest() {
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }
}
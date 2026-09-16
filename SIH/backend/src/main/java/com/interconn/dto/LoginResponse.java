package com.interconn.dto;

import com.interconn.entity.Role;

import java.util.UUID;

public class LoginResponse {

    private String token;
    private UUID userId;
    private String name;
    private String email;
    private Role role;

    public LoginResponse() {
    }

    public LoginResponse(
            String token,
            UUID userId,
            String name,
            String email,
            Role role) {

        this.token = token;
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public Role getRole() {
        return role;
    }
}
package com.interconn.dto;

import com.interconn.entity.UserStatus;

import java.util.UUID;

public class SupervisorResponse {

    private UUID id;
    private String name;
    private String email;
    private String phone;
    private UserStatus status;
    private String inviteToken;

    public SupervisorResponse() {
    }

    public SupervisorResponse(
            UUID id,
            String name,
            String email,
            String phone,
            UserStatus status
    ) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.status = status;
    }

    public SupervisorResponse(
            UUID id,
            String name,
            String email,
            String phone,
            UserStatus status,
            String inviteToken
    ) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.status = status;
        this.inviteToken = inviteToken;
    }

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public UserStatus getStatus() {
        return status;
    }

    public String getInviteToken() {
        return inviteToken;
    }
}
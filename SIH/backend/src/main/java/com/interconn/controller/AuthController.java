package com.interconn.controller;

import com.interconn.dto.LoginRequest;
import com.interconn.dto.LoginResponse;
import com.interconn.dto.RegisterManufacturerRequest;
import com.interconn.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request) {

        LoginResponse response = authService.login(request);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/register/manufacturer")
    public ResponseEntity<LoginResponse> registerManufacturer(
            @Valid @RequestBody RegisterManufacturerRequest request) {

        LoginResponse response = authService.registerManufacturer(request);

        return ResponseEntity.ok(response);
    }
}
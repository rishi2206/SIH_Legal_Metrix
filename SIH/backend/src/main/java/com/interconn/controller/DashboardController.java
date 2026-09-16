package com.interconn.controller;

import com.interconn.dto.DashboardResponse;
import com.interconn.entity.User;
import com.interconn.repository.UserRepository;
import com.interconn.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;
    private final UserRepository userRepository;

    public DashboardController(
            DashboardService dashboardService,
            UserRepository userRepository) {

        this.dashboardService = dashboardService;
        this.userRepository = userRepository;
    }

    @GetMapping("/supervisor")
    public ResponseEntity<DashboardResponse> supervisorDashboard(
            Authentication authentication) {

        UUID supervisorId =
                UUID.fromString(authentication.getName());

        User supervisor = userRepository.findById(supervisorId)
                .orElseThrow(() ->
                        new RuntimeException("Supervisor not found"));

        return ResponseEntity.ok(
                dashboardService.getSupervisorDashboard(
                        supervisor.getId()
                )
        );
    }

    @GetMapping("/admin")
    public ResponseEntity<DashboardResponse> adminDashboard(
            Authentication authentication) {

        UUID adminId =
                UUID.fromString(authentication.getName());

        User admin = userRepository.findById(adminId)
                .orElseThrow(() ->
                        new RuntimeException("Admin not found"));

        return ResponseEntity.ok(
                dashboardService.getAdminDashboard(
                        admin.getId()
                )
        );
    }
}
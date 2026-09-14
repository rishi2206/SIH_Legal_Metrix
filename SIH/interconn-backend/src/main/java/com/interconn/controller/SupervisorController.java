package com.interconn.controller;

import com.interconn.dto.ActivateSupervisorRequest;
import com.interconn.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/supervisors")
public class SupervisorController {

    private final AdminService adminService;

    public SupervisorController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PostMapping("/activate")
    public ResponseEntity<String> activateSupervisor(
            @Valid @RequestBody ActivateSupervisorRequest request
    ) {

        adminService.activateSupervisor(request);

        return ResponseEntity.ok(
                "Supervisor activated successfully"
        );
    }
}
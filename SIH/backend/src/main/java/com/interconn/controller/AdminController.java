package com.interconn.controller;

import com.interconn.dto.CreateSupervisorRequest;
import com.interconn.dto.SupervisorResponse;
import com.interconn.entity.User;
import com.interconn.repository.UserRepository;
import com.interconn.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;
    private final UserRepository userRepository;

    public AdminController(AdminService adminService,
                           UserRepository userRepository) {
        this.adminService = adminService;
        this.userRepository = userRepository;
    }

    @PostMapping("/supervisors")
    public ResponseEntity<SupervisorResponse> createSupervisor(
            @RequestBody CreateSupervisorRequest request,
            Authentication authentication) {

        UUID adminId = UUID.fromString(authentication.getName());

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        return ResponseEntity.ok(
                adminService.createSupervisor(request, admin)
        );
    }

    @GetMapping("/supervisors")
    public ResponseEntity<List<SupervisorResponse>> getSupervisors(
            Authentication authentication) {

        UUID adminId = UUID.fromString(authentication.getName());

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        return ResponseEntity.ok(
                adminService.getSupervisors(admin)
        );
    }

    @GetMapping("/supervisors/{supervisorId}")
    public ResponseEntity<SupervisorResponse> getSupervisor(
            @PathVariable UUID supervisorId,
            Authentication authentication) {

        UUID adminId = UUID.fromString(authentication.getName());

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        return ResponseEntity.ok(
                adminService.getSupervisor(supervisorId, admin)
        );
    }

    @PostMapping("/manufacturers")
    public ResponseEntity<SupervisorResponse> createManufacturer(
            @RequestBody CreateSupervisorRequest request,
            Authentication authentication) {

        UUID adminId = UUID.fromString(authentication.getName());

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        return ResponseEntity.ok(
                adminService.createManufacturer(request, admin)
        );
    }

    @GetMapping("/manufacturers")
    public ResponseEntity<List<SupervisorResponse>> getManufacturers(
            Authentication authentication) {

        UUID adminId = UUID.fromString(authentication.getName());

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        return ResponseEntity.ok(
                adminService.getManufacturers(admin)
        );
    }

    @GetMapping("/manufacturers/{manufacturerId}")
    public ResponseEntity<SupervisorResponse> getManufacturer(
            @PathVariable UUID manufacturerId,
            Authentication authentication) {

        UUID adminId = UUID.fromString(authentication.getName());

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        return ResponseEntity.ok(
                adminService.getManufacturer(manufacturerId, admin)
        );
    }

    @DeleteMapping("/supervisors/{supervisorId}")
    public ResponseEntity<Void> deleteSupervisor(
            @PathVariable UUID supervisorId,
            Authentication authentication) {

        UUID adminId = UUID.fromString(authentication.getName());

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        adminService.deleteSupervisor(supervisorId, admin);

        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/manufacturers/{manufacturerId}")
    public ResponseEntity<Void> deleteManufacturer(
            @PathVariable UUID manufacturerId,
            Authentication authentication) {

        UUID adminId = UUID.fromString(authentication.getName());

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        adminService.deleteManufacturer(manufacturerId, admin);

        return ResponseEntity.noContent().build();
    }
}
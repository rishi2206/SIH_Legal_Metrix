package com.interconn.controller;

import com.interconn.dto.InspectionResponse;
import com.interconn.entity.User;
import com.interconn.repository.UserRepository;
import com.interconn.service.HistoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/history")
public class HistoryController {

    private final HistoryService historyService;
    private final UserRepository userRepository;

    public HistoryController(
            HistoryService historyService,
            UserRepository userRepository) {

        this.historyService = historyService;
        this.userRepository = userRepository;
    }

    @GetMapping("/supervisor")
    public ResponseEntity<List<InspectionResponse>>
    getSupervisorHistory(Authentication authentication) {

        UUID supervisorId =
                UUID.fromString(authentication.getName());

        User supervisor = userRepository.findById(supervisorId)
                .orElseThrow(() ->
                        new RuntimeException("Supervisor not found"));

        return ResponseEntity.ok(
                historyService.getSupervisorHistory(supervisor)
        );
    }

    @GetMapping("/admin")
    public ResponseEntity<List<InspectionResponse>>
    getAdminHistory(Authentication authentication) {

        UUID adminId =
                UUID.fromString(authentication.getName());

        User admin = userRepository.findById(adminId)
                .orElseThrow(() ->
                        new RuntimeException("Admin not found"));

        return ResponseEntity.ok(
                historyService.getAdminHistory(admin)
        );
    }
}
package com.interconn.controller;

import com.interconn.dto.CreateInspectionRequest;
import com.interconn.dto.InspectionResponse;
import com.interconn.entity.User;
import com.interconn.repository.UserRepository;
import com.interconn.service.InspectionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/inspections")
public class InspectionController {

    private final InspectionService inspectionService;
    private final UserRepository userRepository;

    public InspectionController(
            InspectionService inspectionService,
            UserRepository userRepository
    ) {
        this.inspectionService = inspectionService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<InspectionResponse> createInspection(
            @Valid @RequestBody CreateInspectionRequest request,
            Authentication authentication
    ) {

        User supervisor = getAuthenticatedUser(authentication);

        InspectionResponse response =
                inspectionService.createInspection(
                        request,
                        supervisor
                );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/my")
    public ResponseEntity<List<InspectionResponse>> getMyInspections(
            Authentication authentication
    ) {

        User supervisor = getAuthenticatedUser(authentication);

        return ResponseEntity.ok(
                inspectionService.getMyInspections(supervisor)
        );
    }

    @GetMapping("/{inspectionId}")
    public ResponseEntity<InspectionResponse> getInspection(
            @PathVariable UUID inspectionId,
            Authentication authentication
    ) {

        User supervisor = getAuthenticatedUser(authentication);

        return ResponseEntity.ok(
                inspectionService.getInspection(
                        inspectionId,
                        supervisor
                )
        );
    }

    private User getAuthenticatedUser(
            Authentication authentication
    ) {

        UUID userId = UUID.fromString(
                authentication.getName()
        );

        return userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Authenticated user not found"
                        )
                );
    }
}
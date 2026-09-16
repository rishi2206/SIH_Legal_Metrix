package com.interconn.controller;

import com.interconn.entity.AuditLog;
import com.interconn.service.AuditLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/audit-logs")
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public ResponseEntity<List<AuditLog>> getAllLogs() {
        return ResponseEntity.ok(auditLogService.getAllLogs());
    }

    @GetMapping("/inspection/{inspectionId}")
    public ResponseEntity<List<AuditLog>> getLogsByInspection(@PathVariable UUID inspectionId) {
        return ResponseEntity.ok(auditLogService.getLogsByInspection(inspectionId));
    }
}

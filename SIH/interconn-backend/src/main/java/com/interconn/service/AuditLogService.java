package com.interconn.service;

import com.interconn.entity.AuditAction;
import com.interconn.entity.AuditLog;
import com.interconn.entity.Role;
import com.interconn.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public AuditLog logAction(String userEmail, Role userRole, UUID inspectionId, AuditAction action, String details) {
        AuditLog auditLog = new AuditLog(userEmail, userRole, inspectionId, action, details);
        return auditLogRepository.save(auditLog);
    }

    public List<AuditLog> getAllLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc();
    }

    public List<AuditLog> getLogsByInspection(UUID inspectionId) {
        return auditLogRepository.findByInspectionIdOrderByTimestampDesc(inspectionId);
    }

    public List<AuditLog> getLogsByUser(String userEmail) {
        return auditLogRepository.findByUserEmailOrderByTimestampDesc(userEmail);
    }
}

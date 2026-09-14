package com.interconn;

import com.interconn.entity.AuditAction;
import com.interconn.entity.AuditLog;
import com.interconn.entity.Role;
import com.interconn.repository.AuditLogRepository;
import com.interconn.service.AuditLogService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class AuditLogServiceTest {

    @Test
    void testLogAction() {
        AuditLogRepository repository = Mockito.mock(AuditLogRepository.class);
        AuditLogService service = new AuditLogService(repository);

        UUID inspectionId = UUID.randomUUID();
        AuditLog expectedLog = new AuditLog("test@example.com", Role.SUPERVISOR, inspectionId, AuditAction.INSPECTION_CREATED, "Created inspection");

        when(repository.save(any(AuditLog.class))).thenReturn(expectedLog);

        AuditLog result = service.logAction("test@example.com", Role.SUPERVISOR, inspectionId, AuditAction.INSPECTION_CREATED, "Created inspection");

        assertEquals("test@example.com", result.getUserEmail());
        assertEquals(AuditAction.INSPECTION_CREATED, result.getAction());
    }
}

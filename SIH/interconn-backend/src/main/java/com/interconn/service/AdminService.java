package com.interconn.service;

import com.interconn.dto.ActivateSupervisorRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.interconn.dto.CreateSupervisorRequest;
import com.interconn.dto.SupervisorResponse;
import com.interconn.entity.Role;
import com.interconn.entity.SupervisorInvite;
import com.interconn.entity.User;
import com.interconn.entity.UserStatus;
import com.interconn.repository.SupervisorInviteRepository;
import com.interconn.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final SupervisorInviteRepository inviteRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(
            UserRepository userRepository,
            SupervisorInviteRepository inviteRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.inviteRepository = inviteRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public SupervisorResponse createSupervisor(
            CreateSupervisorRequest request,
            User admin
    ) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // Create supervisor
        User supervisor = new User();

        supervisor.setName(request.getName());
        supervisor.setEmail(request.getEmail());
        supervisor.setPhone(request.getPhone());
        supervisor.setRole(Role.SUPERVISOR);
        supervisor.setStatus(UserStatus.INVITED);
        supervisor.setAdmin(admin);

        User savedSupervisor = userRepository.save(supervisor);

        // Generate invite
        SupervisorInvite invite = new SupervisorInvite();

        invite.setSupervisor(savedSupervisor);
        invite.setToken(UUID.randomUUID().toString());
        invite.setExpiresAt(LocalDateTime.now().plusHours(24));
        invite.setUsed(false);

        inviteRepository.save(invite);

        return new SupervisorResponse(
                savedSupervisor.getId(),
                savedSupervisor.getName(),
                savedSupervisor.getEmail(),
                savedSupervisor.getPhone(),
                savedSupervisor.getStatus(),
                invite.getToken()
        );
    }

    public List<SupervisorResponse> getSupervisors(User admin) {

        return userRepository.findByAdminId(admin.getId())
                .stream()
                .filter(user -> user.getRole() == Role.SUPERVISOR)
                .map(user -> new SupervisorResponse(
                        user.getId(),
                        user.getName(),
                        user.getEmail(),
                        user.getPhone(),
                        user.getStatus()
                ))
                .toList();
    }

    public SupervisorResponse getSupervisor(
            UUID supervisorId,
            User admin
    ) {

        User supervisor = userRepository.findById(supervisorId)
                .orElseThrow(() ->
                        new RuntimeException("Supervisor not found")
                );

        if (supervisor.getRole() != Role.SUPERVISOR ||
                supervisor.getAdmin() == null ||
                !supervisor.getAdmin().getId().equals(admin.getId())) {

            throw new RuntimeException("Supervisor not found");
        }

        return new SupervisorResponse(
                supervisor.getId(),
                supervisor.getName(),
                supervisor.getEmail(),
                supervisor.getPhone(),
                supervisor.getStatus()
        );
    }
    public void activateSupervisor(ActivateSupervisorRequest request) {

        SupervisorInvite invite = inviteRepository
                .findByToken(request.getInviteToken())
                .orElseThrow(() ->
                        new RuntimeException("Invalid invite token")
                );

        if (invite.isUsed()) {
            throw new RuntimeException("Invite has already been used");
        }

        if (invite.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Invite has expired");
        }

        User supervisor = invite.getSupervisor();

        if (supervisor.getRole() != Role.SUPERVISOR) {
            throw new RuntimeException("Invalid supervisor account");
        }

        if (supervisor.getStatus() != UserStatus.INVITED) {
            throw new RuntimeException("Supervisor is already activated");
        }

        supervisor.setPasswordHash(
                passwordEncoder.encode(request.getPassword())
        );

        supervisor.setStatus(UserStatus.ACTIVE);

        userRepository.save(supervisor);

        invite.setUsed(true);

        inviteRepository.save(invite);
    }
}
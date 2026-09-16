package com.interconn.service;

import com.interconn.dto.LoginRequest;
import com.interconn.dto.LoginResponse;
import com.interconn.dto.RegisterManufacturerRequest;
import com.interconn.entity.AuditAction;
import com.interconn.entity.Role;
import com.interconn.entity.User;
import com.interconn.entity.UserStatus;
import com.interconn.repository.UserRepository;
import com.interconn.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuditLogService auditLogService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuditLogService auditLogService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.auditLogService = auditLogService;
    }

    public LoginResponse login(LoginRequest request) {

        User user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RuntimeException("Invalid email or password"));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new RuntimeException("User account is not active");
        }

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPasswordHash())) {

            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtService.generateToken(user);

        auditLogService.logAction(
                user.getEmail(),
                user.getRole(),
                null,
                AuditAction.LOGIN,
                "User successfully logged in"
        );

        return new LoginResponse(
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole()
        );
    }

    /**
     * Self-service sign-up for manufacturing companies. Unlike supervisors (who are
     * invited by an admin and activate via a token), a manufacturer can register
     * directly and is active immediately so they can start running pre-dispatch
     * checks right away.
     */
    public LoginResponse registerManufacturer(RegisterManufacturerRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("An account with this email already exists");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.MANUFACTURER);
        user.setStatus(UserStatus.ACTIVE);

        User savedUser = userRepository.save(user);

        auditLogService.logAction(
                savedUser.getEmail(),
                savedUser.getRole(),
                null,
                AuditAction.USER_REGISTERED,
                "Manufacturer account registered: " + savedUser.getName()
        );

        String token = jwtService.generateToken(savedUser);

        return new LoginResponse(
                token,
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole()
        );
    }
}
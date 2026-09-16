package com.interconn.repository;

import com.interconn.entity.Role;
import com.interconn.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByAdminId(UUID adminId);

    long countByAdminId(UUID adminId);

    long countByAdminIdAndRole(UUID adminId, Role role);
}
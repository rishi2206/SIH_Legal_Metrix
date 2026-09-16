package com.interconn.repository;

import com.interconn.entity.SupervisorInvite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SupervisorInviteRepository
        extends JpaRepository<SupervisorInvite, UUID> {

    Optional<SupervisorInvite> findByToken(String token);

    Optional<SupervisorInvite> findBySupervisorId(UUID supervisorId);
}
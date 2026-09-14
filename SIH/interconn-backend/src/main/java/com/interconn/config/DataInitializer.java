package com.interconn.config;

import com.interconn.entity.Role;
import com.interconn.entity.User;
import com.interconn.entity.UserStatus;
import com.interconn.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initializeAdmin(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {

            if (userRepository.existsByEmail("admin@interconn.com")) {
                return;
            }

            User admin = new User();

            admin.setName("InterConn Admin");
            admin.setEmail("admin@interconn.com");

            admin.setPasswordHash(
                    passwordEncoder.encode("Admin@123")
            );

            admin.setRole(Role.ADMIN);
            admin.setStatus(UserStatus.ACTIVE);

            userRepository.save(admin);

            System.out.println("=================================");
            System.out.println("Initial Admin Created");
            System.out.println("Email: admin@interconn.com");
            System.out.println("Password: Admin@123");
            System.out.println("=================================");
        };
    }
}
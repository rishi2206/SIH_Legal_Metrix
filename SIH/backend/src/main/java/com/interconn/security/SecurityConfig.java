package com.interconn.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
public class SecurityConfig {

    private final JwtService jwtService;
    private final CorsConfigurationSource corsConfigurationSource;

    public SecurityConfig(JwtService jwtService, CorsConfigurationSource corsConfigurationSource) {
        this.jwtService = jwtService;
        this.corsConfigurationSource = corsConfigurationSource;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/supervisors/activate").permitAll()
                        .requestMatchers("/api/health").permitAll()

                        // Admin-only endpoints
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/dashboard/admin").hasRole("ADMIN")
                        .requestMatchers("/api/history/admin").hasRole("ADMIN")

                        // Supervisor-only endpoints
                        .requestMatchers("/api/supervisors/**").hasRole("SUPERVISOR")

                        // Endpoints shared by field Supervisors (statutory inspections) and
                        // Manufacturers (pre-dispatch self-checks) — both just operate on
                        // "their own" inspections, so the same inspection pipeline covers both
                        .requestMatchers("/api/dashboard/supervisor").hasAnyRole("SUPERVISOR", "MANUFACTURER")
                        .requestMatchers("/api/history/supervisor").hasAnyRole("SUPERVISOR", "MANUFACTURER")
                        .requestMatchers("/api/inspections/**").hasAnyRole("SUPERVISOR", "MANUFACTURER")

                        // Audit logs endpoint (Admin, Supervisor and Manufacturer)
                        .requestMatchers("/api/audit-logs/**").hasAnyRole("ADMIN", "SUPERVISOR", "MANUFACTURER")

                        // Everything else requires authentication
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 ->
                        oauth2.jwt(jwt ->
                                jwt
                                        .decoder(jwtService.getJwtDecoder())
                                        .jwtAuthenticationConverter(jwtAuthenticationConverter())
                        )
                );

        return http.build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter authoritiesConverter = new JwtGrantedAuthoritiesConverter();
        authoritiesConverter.setAuthoritiesClaimName("role");
        authoritiesConverter.setAuthorityPrefix("ROLE_");

        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(authoritiesConverter);
        return converter;
    }
}
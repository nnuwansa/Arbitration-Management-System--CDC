package com.CooperativeDevelopmentManagementSystem.DCDSystem.config;

import com.CooperativeDevelopmentManagementSystem.DCDSystem.security.AuthEntryPointJwt;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.security.AuthTokenFilter;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.security.JwtUtils;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.service.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.ArrayList;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class WebSecurityConfig {

    private static final Logger log = LoggerFactory.getLogger(WebSecurityConfig.class);

    private final UserDetailsServiceImpl userDetailsService;
    private final AuthEntryPointJwt unauthorizedHandler;
    private final JwtUtils jwtUtils;

    @Value("${app.base-url:http://localhost:5173}")
    private String baseUrl;

    @Value("${app.frontend-url:https://ams-cdc.netlify.app}")
    private String frontendUrl;

    @Bean
    public AuthTokenFilter authenticationJwtTokenFilter() {
        return new AuthTokenFilter(jwtUtils, userDetailsService);
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // Configure CORS first, then disable CSRF
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints - MUST BE FIRST IN ORDER
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/districts/**").permitAll()

                        // Registration endpoints (public)
                        .requestMatchers("/api/societies/district/*/available-for-registration").permitAll()
                        .requestMatchers("/api/officers/district/*/available-for-registration").permitAll()
                        .requestMatchers("/api/legal-officers/district/*/available-for-registration").permitAll()

                        // Protected endpoints - REQUIRE AUTHENTICATION
                        .requestMatchers("/api/users/**").authenticated()
                        .requestMatchers("/api/submissions/**").authenticated()
                        .requestMatchers("/api/societies/**").authenticated()
                        .requestMatchers("/api/officers/**").authenticated()
                        .requestMatchers("/api/legal-officers/**").authenticated()
                        .requestMatchers("/api/courts/**").authenticated()

                        // All other endpoints require authentication
                        .anyRequest().authenticated()
                );

        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Build list of allowed origins dynamically
        List<String> allowedOrigins = new ArrayList<>();

        // Add local development URLs
        allowedOrigins.add("http://localhost:5173");
        allowedOrigins.add("http://localhost:5174");
        allowedOrigins.add("http://localhost:3000");

        // Add base URL if it's not localhost
        if (baseUrl != null && !baseUrl.isEmpty() && !baseUrl.startsWith("http://localhost")) {
            allowedOrigins.add(baseUrl);
            log.info("Added base URL to CORS: {}", baseUrl);
        }

        // Add frontend URL if it's not localhost and different from base URL
        if (frontendUrl != null && !frontendUrl.isEmpty() &&
                !frontendUrl.startsWith("http://localhost") &&
                !frontendUrl.equals(baseUrl)) {
            allowedOrigins.add(frontendUrl);
            log.info("Added frontend URL to CORS: {}", frontendUrl);
        }

        configuration.setAllowedOrigins(allowedOrigins);
        log.info("CORS allowed origins: {}", allowedOrigins);

        // Allow all necessary HTTP methods including OPTIONS
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));

        // Allow all headers
        configuration.setAllowedHeaders(Arrays.asList("*"));

        // Enable credentials
        configuration.setAllowCredentials(true);

        // Expose Authorization header
        configuration.setExposedHeaders(Arrays.asList("Authorization"));

        // Cache preflight requests for 1 hour
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}


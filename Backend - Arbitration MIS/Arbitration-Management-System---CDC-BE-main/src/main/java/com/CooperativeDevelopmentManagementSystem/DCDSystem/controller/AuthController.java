package com.CooperativeDevelopmentManagementSystem.DCDSystem.controller;

import jakarta.validation.Valid;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.dto.JwtResponse;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.dto.LoginRequest;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.dto.MessageResponse;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.dto.SignupRequest;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        JwtResponse response = authService.authenticateUser(loginRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/signup")
    public ResponseEntity<MessageResponse> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        MessageResponse response = authService.registerUser(signUpRequest);
        return ResponseEntity.ok(response);
    }
}

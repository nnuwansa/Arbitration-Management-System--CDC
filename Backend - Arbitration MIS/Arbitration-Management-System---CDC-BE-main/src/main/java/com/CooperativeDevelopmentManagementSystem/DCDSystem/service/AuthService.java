package com.CooperativeDevelopmentManagementSystem.DCDSystem.service;

import com.CooperativeDevelopmentManagementSystem.DCDSystem.dto.JwtResponse;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.dto.LoginRequest;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.dto.MessageResponse;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.dto.SignupRequest;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.model.*;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.repository.ArbitrationOfficerRepository;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.repository.LegalOfficerRepository;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.repository.SocietyRepository;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.repository.UserRepository;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.security.JwtUtils;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.security.UserDetailsImpl;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Builder



@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final ArbitrationOfficerRepository arbitrationOfficerRepository;
    private final LegalOfficerRepository legalOfficerRepository;
    private final SocietyRepository societyRepository;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;

    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Set<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toSet());

        return JwtResponse.builder()
                .token(jwt)
                .id(userDetails.getId())
                .email(userDetails.getEmail())
                .name(userDetails.getName())
                .district(userDetails.getDistrict())
                .society(userDetails.getSociety())
                .societyId(userDetails.getSocietyId())  // ⭐ SOCIETY ID INCLUDED
                .roles(roles)
                .build();
    }

    public MessageResponse registerUser(SignupRequest signUpRequest) {
        // Check if email already exists
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        Set<Role> roles = new HashSet<>();
        String userName = signUpRequest.getName();
        String officerId = null;
        String legalOfficerId = null;
        String societyId = null;  // ⭐ WILL BE SAVED IN DATABASE
        String societyName = null;  // ⭐ WILL BE SAVED IN DATABASE
        String district = signUpRequest.getDistrict(); // Can be null for Provincial Admin

        if ("SOCIETY".equals(signUpRequest.getUserType())) {
            // ========== SOCIETY USER REGISTRATION ==========

            // Validate society selection
            if (signUpRequest.getSocietyId() == null || signUpRequest.getSocietyId().isEmpty()) {
                throw new RuntimeException("Society selection is required for society users");
            }

            // Get the society from database
            Society society = societyRepository.findById(signUpRequest.getSocietyId())
                    .orElseThrow(() -> new RuntimeException("Society not found"));

            // Validate district matches
            if (district == null || district.isEmpty()) {
                district = society.getDistrictId();
            } else if (!district.equals(society.getDistrictId())) {
                throw new RuntimeException("District does not match the selected society");
            }

            // ⭐ SAVE BOTH SOCIETY ID AND NAME FROM DATABASE
            societyId = society.getId();
            societyName = society.getName();
            userName = signUpRequest.getName(); // User's name (e.g., secretary name)

            // Assign role and check if this specific role already exists
            if ("SOCIETY_ADMIN".equals(signUpRequest.getRole())) {
                // Check if admin account already exists for this society
                if (Boolean.TRUE.equals(society.getAdminAccountCreated())) {
                    throw new RuntimeException("This society already has an Admin account");
                }

                roles.add(Role.SOCIETY_ADMIN);

                // Mark admin account as created
                society.setAdminAccountCreated(true);
                society.setAdminEmail(signUpRequest.getEmail());

            } else if ("SOCIETY_APPROVAL".equals(signUpRequest.getRole())) {
                // Check if approval account already exists for this society
                if (Boolean.TRUE.equals(society.getApprovalAccountCreated())) {
                    throw new RuntimeException("This society already has an Approval account");
                }

                roles.add(Role.SOCIETY_APPROVAL);

                // Mark approval account as created
                society.setApprovalAccountCreated(true);
                society.setApprovalEmail(signUpRequest.getEmail());

            } else {
                throw new RuntimeException("Invalid role for society user. Must be SOCIETY_ADMIN or SOCIETY_APPROVAL");
            }

            // Check if both accounts are now created
            if (society.hasBothAccounts()) {
                society.setUserAccountCreated(true);
            }

            society.setUpdatedAt(LocalDateTime.now());
            societyRepository.save(society);

        } else if ("OFFICER".equals(signUpRequest.getUserType())) {
            // ========== OFFICER USER REGISTRATION ==========

            // Determine role first
            String requestedRole = signUpRequest.getRole();
            if (requestedRole == null || requestedRole.isEmpty()) {
                // Fallback: determine from designation
                if (signUpRequest.getDesignation() != null) {
                    String designation = signUpRequest.getDesignation().toLowerCase();
                    if (designation.contains("provincial") || designation.contains("පළාත්")) {
                        requestedRole = "PROVINCIAL_ADMIN";
                    } else if (designation.contains("district") || designation.contains("දිස්ත්‍රික්")) {
                        requestedRole = "DISTRICT_ADMIN";
                    } else if (designation.contains("legal") || designation.contains("නීති")) {
                        requestedRole = "LEGAL_OFFICER";
                    } else {
                        requestedRole = "OFFICER";
                    }
                } else {
                    requestedRole = "OFFICER";
                }
            }

            // Provincial Admin does NOT need district
            if ("PROVINCIAL_ADMIN".equals(requestedRole)) {
                district = null; // Provincial admin has no specific district
                roles.add(Role.PROVINCIAL_ADMIN);
                userName = signUpRequest.getName();

            } else {
                // District Admin, Officer, and Legal Officer MUST have district
                if (district == null || district.isEmpty()) {
                    throw new RuntimeException("District is required for District Admin, Officer, and Legal Officer roles");
                }

                if ("DISTRICT_ADMIN".equals(requestedRole)) {
                    // District Admin
                    roles.add(Role.DISTRICT_ADMIN);
                    userName = signUpRequest.getName();

                } else if ("LEGAL_OFFICER".equals(requestedRole)) {
                    // ========== LEGAL OFFICER REGISTRATION ==========
                    roles.add(Role.LEGAL_OFFICER);

                    if (signUpRequest.getLegalOfficerId() == null || signUpRequest.getLegalOfficerId().isEmpty()) {
                        throw new RuntimeException("Legal Officer ID is required for Legal Officer role");
                    }

                    LegalOfficer legalOfficer = legalOfficerRepository.findById(signUpRequest.getLegalOfficerId())
                            .orElseThrow(() -> new RuntimeException("Legal Officer not found"));

                    // Check if legal officer already has a user account
                    if (Boolean.TRUE.equals(legalOfficer.getUserAccountCreated())) {
                        throw new RuntimeException("This legal officer already has a user account");
                    }

                    // Use the legal officer's name from the database
                    userName = legalOfficer.getName();
                    legalOfficerId = legalOfficer.getId();

                    // Mark that this legal officer now has a user account
                    legalOfficer.setUserAccountCreated(true);
                    legalOfficer.setUserEmail(signUpRequest.getEmail());
                    legalOfficer.setUpdatedAt(LocalDateTime.now());
                    legalOfficerRepository.save(legalOfficer);

                } else {
                    // Regular Officer - must select from dropdown
                    roles.add(Role.OFFICER);

                    if (signUpRequest.getOfficerId() == null || signUpRequest.getOfficerId().isEmpty()) {
                        throw new RuntimeException("Officer ID is required for Officer role");
                    }

                    ArbitrationOfficer officer = arbitrationOfficerRepository.findById(signUpRequest.getOfficerId())
                            .orElseThrow(() -> new RuntimeException("Arbitration Officer not found"));

                    // Check if officer already has a user account
                    if (Boolean.TRUE.equals(officer.getUserAccountCreated())) {
                        throw new RuntimeException("This officer already has a user account");
                    }

                    // Use the officer's name from the database
                    userName = officer.getName();
                    officerId = officer.getId();

                    // Mark that this officer now has a user account
                    officer.setUserAccountCreated(true);
                    officer.setUserEmail(signUpRequest.getEmail());
                    officer.setUpdatedAt(LocalDateTime.now());
                    arbitrationOfficerRepository.save(officer);
                }
            }
        } else {
            throw new RuntimeException("Invalid user type. Must be SOCIETY or OFFICER");
        }

        // ⭐ CREATE USER WITH SOCIETY ID AND SOCIETY NAME SAVED IN DATABASE
        User user = User.builder()
                .email(signUpRequest.getEmail())
                .password(encoder.encode(signUpRequest.getPassword()))
                .name(userName)
                .district(district) // Will be null for Provincial Admin
                .contactNo(signUpRequest.getContactNo())  // ⭐ ADD THIS LINE
                .society(societyName)  // ⭐ SOCIETY NAME SAVED IN DATABASE
                .societyId(societyId)  // ⭐ SOCIETY ID SAVED IN DATABASE (Link to Society document)
                .designation(signUpRequest.getDesignation())
                .officerId(officerId)
                .legalOfficerId(legalOfficerId)
                .roles(roles)
                .enabled(true)
                .createdAt(LocalDateTime.now())
                .build();

        userRepository.save(user);

        return new MessageResponse("User registered successfully!");
    }
}
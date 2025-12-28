


package com.CooperativeDevelopmentManagementSystem.DCDSystem.service;

import com.CooperativeDevelopmentManagementSystem.DCDSystem.dto.SocietyRequest;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.model.ArbitrationOfficer;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.model.Society;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.repository.SocietyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.repository.support.SimpleMongoRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
//
//@Service
//@RequiredArgsConstructor
//public class SocietyService {
//
//    private final SocietyRepository societyRepository;
//
//    public Society createSociety(SocietyRequest request) {
//        Society society = Society.builder()
//                .name(request.getName())
//                .districtId(request.getDistrictId())
//                .registrationNo(request.getRegistrationNo())
//                .registeredAddress(request.getRegisteredAddress())
//                .registrationDate(request.getRegistrationDate())
//                .userEmail(request.getUserEmail()) // NEW: Store email
//                .userAccountCreated(false) // NEW: Initialize as false
//                .createdAt(LocalDateTime.now())
//                .build();
//
//        return societyRepository.save(society);
//    }
//
//    public Society updateSociety(String id, SocietyRequest request) {
//        Society society = getSocietyById(id);
//
//        society.setName(request.getName());
//        society.setDistrictId(request.getDistrictId());
//        society.setRegistrationNo(request.getRegistrationNo());
//        society.setRegisteredAddress(request.getRegisteredAddress());
//        society.setRegistrationDate(request.getRegistrationDate());
//        society.setUserEmail(request.getUserEmail());
//        society.setUpdatedAt(LocalDateTime.now());
//
//        return societyRepository.save(society);
//    }
//
//    public Society markUserAccountCreated(String societyId, String email) {
//        Society society = getSocietyById(societyId);
//        society.setUserAccountCreated(true);
//        society.setUserEmail(email);
//        society.setUpdatedAt(LocalDateTime.now());
//        return societyRepository.save(society);
//    }
//
//    public List<Society> getAllSocieties() {
//        return societyRepository.findAll();
//    }
//
//    public List<Society> getSocietiesByDistrict(String districtId) {
//        return societyRepository.findByDistrictId(districtId);
//    }
//
//    public Society getSocietyById(String id) {
//        return societyRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Society not found with id: " + id));
//    }
//
//    public List<Society> getSocietiesWithoutUserAccount() {
//        return societyRepository.findByUserAccountCreated(false);
//    }
//}




import com.CooperativeDevelopmentManagementSystem.DCDSystem.dto.SocietyRequest;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.model.Society;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.repository.SocietyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
//
//@Service
//@RequiredArgsConstructor
//public class SocietyService {
//
//    private final SocietyRepository societyRepository;
//
//    public Society createSociety(SocietyRequest request) {
//        Society society = Society.builder()
//                .name(request.getName())
//                .districtId(request.getDistrictId())
//                .registrationNo(request.getRegistrationNo())
//                .registeredAddress(request.getRegisteredAddress())
//                .registrationDate(request.getRegistrationDate())
//                .userAccountCreated(false) // Initialize as false
//                .createdAt(LocalDateTime.now())
//                .build();
//
//        return societyRepository.save(society);
//    }
//
//    public Society updateSociety(String id, SocietyRequest request) {
//        Society society = getSocietyById(id);
//
//        society.setName(request.getName());
//        society.setDistrictId(request.getDistrictId());
//        society.setRegistrationNo(request.getRegistrationNo());
//        society.setRegisteredAddress(request.getRegisteredAddress());
//        society.setRegistrationDate(request.getRegistrationDate());
//        society.setUpdatedAt(LocalDateTime.now());
//
//        return societyRepository.save(society);
//    }
//
//    // NEW: Mark user account as created when society signs up
//    public Society markUserAccountCreated(String societyId, String email) {
//        Society society = getSocietyById(societyId);
//        society.setUserAccountCreated(true);
//        society.setUserEmail(email);
//        society.setUpdatedAt(LocalDateTime.now());
//        return societyRepository.save(society);
//    }
//
//    public List<Society> getAllSocieties() {
//        return societyRepository.findAll();
//    }
//
//    public List<Society> getSocietiesByDistrict(String districtId) {
//        return societyRepository.findByDistrictId(districtId);
//    }
//
//    public Society getSocietyById(String id) {
//        return societyRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Society not found with id: " + id));
//    }
//
//    // NEW: Get societies without user accounts (for registration dropdown)
//    public List<Society> getAvailableSocietiesForRegistration(String districtId) {
//        return societyRepository.findByDistrictIdAndUserAccountCreated(districtId, false);
//    }
//
//    public List<Society> getSocietiesWithoutUserAccount() {
//        return societyRepository.findByUserAccountCreated(false);
//    }
//}




import com.CooperativeDevelopmentManagementSystem.DCDSystem.dto.SocietyRequest;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.model.Society;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.repository.ArbitrationOfficerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SocietyService {

    private final SocietyRepository societyRepository;
    private final ArbitrationOfficerRepository arbitrationOfficerRepository;
    /**
     * Create a new society
     */
    public Society createSociety(SocietyRequest request) {
        // Check if registration number already exists
        if (request.getRegistrationNo() != null &&
                !request.getRegistrationNo().isEmpty() &&
                societyRepository.existsByRegistrationNo(request.getRegistrationNo())) {
            throw new RuntimeException("Society with this registration number already exists");
        }

        Society society = Society.builder()
                .name(request.getName())
                .districtId(request.getDistrictId())
                .registrationNo(request.getRegistrationNo())
                .registeredAddress(request.getRegisteredAddress())
                .registrationDate(request.getRegistrationDate())
                .adminAccountCreated(false)
                .approvalAccountCreated(false)
                .userAccountCreated(false)
                .createdAt(LocalDateTime.now())
                .build();

        return societyRepository.save(society);
    }

    /**
     * Update an existing society
     */
    public Society updateSociety(String id, SocietyRequest request) {
        Society society = getSocietyById(id);

        // Check if changing registration number to one that already exists
        if (request.getRegistrationNo() != null &&
                !request.getRegistrationNo().isEmpty() &&
                !request.getRegistrationNo().equals(society.getRegistrationNo()) &&
                societyRepository.existsByRegistrationNo(request.getRegistrationNo())) {
            throw new RuntimeException("Society with this registration number already exists");
        }

        society.setName(request.getName());
        society.setDistrictId(request.getDistrictId());
        society.setRegistrationNo(request.getRegistrationNo());
        society.setRegisteredAddress(request.getRegisteredAddress());
        society.setRegistrationDate(request.getRegistrationDate());
        society.setUpdatedAt(LocalDateTime.now());

        return societyRepository.save(society);
    }

    /**
     * Delete a society
     */
    public void deleteSociety(String id) {
        Society society = getSocietyById(id);

        // Check if society has user accounts
        if (Boolean.TRUE.equals(society.getAdminAccountCreated()) ||
                Boolean.TRUE.equals(society.getApprovalAccountCreated())) {
            throw new RuntimeException("Cannot delete society with existing user accounts. Please delete user accounts first.");
        }

        societyRepository.deleteById(id);
    }

    /**
     * Get all societies
     */
    public List<Society> getAllSocieties() {
        return societyRepository.findAll();
    }

    /**
     * Get societies by district
     */
    public List<Society> getSocietiesByDistrict(String districtId) {
        return societyRepository.findByDistrictId(districtId);
    }

    /**
     * Get society by ID
     */
    public Society getSocietyById(String id) {
        return societyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Society not found with id: " + id));
    }

    /**
     * Get societies available for registration in a district
     * Returns societies where at least one role (admin OR approval) is still available
     */
    public List<Society> getAvailableSocietiesForRegistration(String districtId) {
        return societyRepository.findAvailableForRegistrationByDistrict(districtId);
    }

    /**
     * Get societies without any user accounts (neither admin nor approval)
     */
    public List<Society> getSocietiesWithoutUserAccount() {
        return societyRepository.findByUserAccountCreated(false);
    }

    /**
     * Get societies with both accounts created
     */
    public List<Society> getSocietiesWithBothAccounts() {
        return societyRepository.findByUserAccountCreated(true);
    }

    /**
     * Get account status for a specific society
     */
    public Map<String, Object> getSocietyAccountStatus(String societyId) {
        Society society = getSocietyById(societyId);

        Map<String, Object> status = new HashMap<>();
        status.put("societyId", society.getId());
        status.put("societyName", society.getName());
        status.put("districtId", society.getDistrictId());
        status.put("registrationNo", society.getRegistrationNo());
        status.put("adminAccountCreated", society.getAdminAccountCreated());
        status.put("approvalAccountCreated", society.getApprovalAccountCreated());
        status.put("adminEmail", society.getAdminEmail());
        status.put("approvalEmail", society.getApprovalEmail());
        status.put("bothAccountsCreated", society.hasBothAccounts());
        status.put("canCreateAccount", society.canCreateAccount());

        return status;
    }

    /**
     * Search societies by name
     */
    public List<Society> searchSocietiesByName(String name) {
        return societyRepository.findByNameContainingIgnoreCase(name);
    }

    /**
     * Mark admin account as created for a society
     * This is called from AuthService during registration
     */
    public Society markAdminAccountCreated(String societyId, String email) {
        Society society = getSocietyById(societyId);

        if (Boolean.TRUE.equals(society.getAdminAccountCreated())) {
            throw new RuntimeException("Admin account already exists for this society");
        }

        society.setAdminAccountCreated(true);
        society.setAdminEmail(email);

        // Check if both accounts are now created
        if (society.hasBothAccounts()) {
            society.setUserAccountCreated(true);
        }

        society.setUpdatedAt(LocalDateTime.now());
        return societyRepository.save(society);
    }

    /**
     * Mark approval account as created for a society
     * This is called from AuthService during registration
     */
    public Society markApprovalAccountCreated(String societyId, String email) {
        Society society = getSocietyById(societyId);

        if (Boolean.TRUE.equals(society.getApprovalAccountCreated())) {
            throw new RuntimeException("Approval account already exists for this society");
        }

        society.setApprovalAccountCreated(true);
        society.setApprovalEmail(email);

        // Check if both accounts are now created
        if (society.hasBothAccounts()) {
            society.setUserAccountCreated(true);
        }

        society.setUpdatedAt(LocalDateTime.now());
        return societyRepository.save(society);
    }

    /**
     * Remove admin account link (for account deletion)
     */
    public Society removeAdminAccount(String societyId) {
        Society society = getSocietyById(societyId);

        society.setAdminAccountCreated(false);
        society.setAdminEmail(null);
        society.setUserAccountCreated(false); // Reset since both are no longer created
        society.setUpdatedAt(LocalDateTime.now());

        return societyRepository.save(society);
    }

    /**
     * Remove approval account link (for account deletion)
     */
    public Society removeApprovalAccount(String societyId) {
        Society society = getSocietyById(societyId);

        society.setApprovalAccountCreated(false);
        society.setApprovalEmail(null);
        society.setUserAccountCreated(false); // Reset since both are no longer created
        society.setUpdatedAt(LocalDateTime.now());

        return societyRepository.save(society);
    }

    /**
     * Get statistics about societies
     */
    public Map<String, Object> getSocietyStatistics() {
        List<Society> allSocieties = societyRepository.findAll();

        long totalSocieties = allSocieties.size();
        long withNoAccounts = allSocieties.stream()
                .filter(s -> !Boolean.TRUE.equals(s.getAdminAccountCreated()) &&
                        !Boolean.TRUE.equals(s.getApprovalAccountCreated()))
                .count();
        long withAdminOnly = allSocieties.stream()
                .filter(s -> Boolean.TRUE.equals(s.getAdminAccountCreated()) &&
                        !Boolean.TRUE.equals(s.getApprovalAccountCreated()))
                .count();
        long withApprovalOnly = allSocieties.stream()
                .filter(s -> !Boolean.TRUE.equals(s.getAdminAccountCreated()) &&
                        Boolean.TRUE.equals(s.getApprovalAccountCreated()))
                .count();
        long withBothAccounts = allSocieties.stream()
                .filter(Society::hasBothAccounts)
                .count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalSocieties", totalSocieties);
        stats.put("withNoAccounts", withNoAccounts);
        stats.put("withAdminOnly", withAdminOnly);
        stats.put("withApprovalOnly", withApprovalOnly);
        stats.put("withBothAccounts", withBothAccounts);
        stats.put("availableForRegistration", totalSocieties - withBothAccounts);

        return stats;
    }

    /**
     * Get society by admin email
     */
    public Society getSocietyByAdminEmail(String email) {
        return societyRepository.findByAdminEmail(email)
                .orElseThrow(() -> new RuntimeException("Society not found with admin email: " + email));
    }

    /**
     * Get society by approval email
     */
    public Society getSocietyByApprovalEmail(String email) {
        return societyRepository.findByApprovalEmail(email)
                .orElseThrow(() -> new RuntimeException("Society not found with approval email: " + email));
    }

    /**
     * Delete an arbitration officer
     * IMPORTANT: Remove the deleteOfficer method from SocietyService.java if it's there
     */
    public void deleteOfficer(String officerId) {

        ArbitrationOfficer officer =arbitrationOfficerRepository.findById(officerId)
                .orElseThrow(() -> new RuntimeException("Officer not found with id: " + officerId));

        // Prevent deletion if officer has a user account created
        if (Boolean.TRUE.equals(officer.getUserAccountCreated())) {
            throw new RuntimeException("Cannot delete officer with an existing user account. Please delete user account first.");
        }

        // Prevent deletion if officer is assigned to a society
        if (officer.getAssignedToSocietyId() != null && !officer.getAssignedToSocietyId().isEmpty()) {
            throw new RuntimeException("Cannot delete officer that is assigned to a society. Please unassign the officer first.");
        }

        arbitrationOfficerRepository.deleteById(officerId);
    }
}
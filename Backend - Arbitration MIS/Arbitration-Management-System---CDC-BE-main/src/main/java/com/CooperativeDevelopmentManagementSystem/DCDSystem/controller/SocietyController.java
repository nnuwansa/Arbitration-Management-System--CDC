

package com.CooperativeDevelopmentManagementSystem.DCDSystem.controller;

import jakarta.validation.Valid;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.dto.SocietyRequest;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.model.Society;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.service.SocietyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
//
//@CrossOrigin(origins = "*", maxAge = 3600)
//@RestController
//@RequestMapping("/api/societies")
//@RequiredArgsConstructor
//public class SocietyController {
//
//    private final SocietyService societyService;
//
//    @PostMapping
//    @PreAuthorize("hasAuthority('DISTRICT_ADMIN') or hasAuthority('PROVINCIAL_ADMIN')")
//    public ResponseEntity<Society> createSociety(@Valid @RequestBody SocietyRequest request) {
//        Society society = societyService.createSociety(request);
//        return ResponseEntity.ok(society);
//    }
//
//    @PutMapping("/{id}")
//    @PreAuthorize("hasAuthority('DISTRICT_ADMIN') or hasAuthority('PROVINCIAL_ADMIN')")
//    public ResponseEntity<Society> updateSociety(
//            @PathVariable String id,
//            @Valid @RequestBody SocietyRequest request) {
//        Society society = societyService.updateSociety(id, request);
//        return ResponseEntity.ok(society);
//    }
//
//    @GetMapping
//    public ResponseEntity<List<Society>> getAllSocieties() {
//        return ResponseEntity.ok(societyService.getAllSocieties());
//    }
//
//    @GetMapping("/district/{districtId}")
//    public ResponseEntity<List<Society>> getSocietiesByDistrict(@PathVariable String districtId) {
//        return ResponseEntity.ok(societyService.getSocietiesByDistrict(districtId));
//    }
//
//    @GetMapping("/{id}")
//    public ResponseEntity<Society> getSocietyById(@PathVariable String id) {
//        return ResponseEntity.ok(societyService.getSocietyById(id));
//    }
//
//    @GetMapping("/without-account")
//    @PreAuthorize("hasAuthority('DISTRICT_ADMIN') or hasAuthority('PROVINCIAL_ADMIN')")
//    public ResponseEntity<List<Society>> getSocietiesWithoutUserAccount() {
//        return ResponseEntity.ok(societyService.getSocietiesWithoutUserAccount());
//    }
//}




import jakarta.validation.Valid;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.dto.SocietyRequest;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.model.Society;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.service.SocietyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

//
//@CrossOrigin(origins = "*", maxAge = 3600)
//@RestController
//@RequestMapping("/api/societies")
//@RequiredArgsConstructor
//public class SocietyController {
//
//    private final SocietyService societyService;
//
//    @PostMapping
//    @PreAuthorize("hasAuthority('DISTRICT_ADMIN') or hasAuthority('PROVINCIAL_ADMIN')")
//    public ResponseEntity<Society> createSociety(@Valid @RequestBody SocietyRequest request) {
//        Society society = societyService.createSociety(request);
//        return ResponseEntity.ok(society);
//    }
//
//    @GetMapping
//    public ResponseEntity<List<Society>> getAllSocieties() {
//        return ResponseEntity.ok(societyService.getAllSocieties());
//    }
//
//    @GetMapping("/district/{districtId}")
//    public ResponseEntity<List<Society>> getSocietiesByDistrict(@PathVariable String districtId) {
//        return ResponseEntity.ok(societyService.getSocietiesByDistrict(districtId));
//    }
//
//    @GetMapping("/{id}")
//    public ResponseEntity<Society> getSocietyById(@PathVariable String id) {
//        return ResponseEntity.ok(societyService.getSocietyById(id));
//    }
//
//    // NEW: Get societies available for user registration (no account created yet)
//    @GetMapping("/district/{districtId}/available-for-registration")
//    public ResponseEntity<List<Society>> getAvailableSocietiesForRegistration(@PathVariable String districtId) {
//        return ResponseEntity.ok(societyService.getAvailableSocietiesForRegistration(districtId));
//    }
//
//    // NEW: Get all societies without user accounts
//    @GetMapping("/without-account")
//    @PreAuthorize("hasAuthority('DISTRICT_ADMIN') or hasAuthority('PROVINCIAL_ADMIN')")
//    public ResponseEntity<List<Society>> getSocietiesWithoutUserAccount() {
//        return ResponseEntity.ok(societyService.getSocietiesWithoutUserAccount());
//    }
//}
//@CrossOrigin(origins = "*", maxAge = 3600)
//@RestController
//@RequestMapping("/api/societies")
//@RequiredArgsConstructor
//public class SocietyController {
//
//    private final SocietyService societyService;
//
//    @PostMapping
//    @PreAuthorize("hasAuthority('DISTRICT_ADMIN') or hasAuthority('PROVINCIAL_ADMIN')")
//    public ResponseEntity<Society> createSociety(@Valid @RequestBody SocietyRequest request) {
//        Society society = societyService.createSociety(request);
//        return ResponseEntity.ok(society);
//    }
//
//    @GetMapping
//    public ResponseEntity<List<Society>> getAllSocieties() {
//        return ResponseEntity.ok(societyService.getAllSocieties());
//    }
//
//    @GetMapping("/district/{districtId}")
//    public ResponseEntity<List<Society>> getSocietiesByDistrict(@PathVariable String districtId) {
//        return ResponseEntity.ok(societyService.getSocietiesByDistrict(districtId));
//    }
//
//    @GetMapping("/{id}")
//    public ResponseEntity<Society> getSocietyById(@PathVariable String id) {
//        return ResponseEntity.ok(societyService.getSocietyById(id));
//    }
//
//    /**
//     * Get societies available for registration
//     * Shows societies where admin OR approval account (or both) are still available
//     */
//    @GetMapping("/district/{districtId}/available-for-registration")
//    public ResponseEntity<List<Society>> getAvailableSocietiesForRegistration(@PathVariable String districtId) {
//        return ResponseEntity.ok(societyService.getAvailableSocietiesForRegistration(districtId));
//    }
//
//    /**
//     * Get societies without any user accounts
//     */
//    @GetMapping("/without-account")
//    @PreAuthorize("hasAuthority('DISTRICT_ADMIN') or hasAuthority('PROVINCIAL_ADMIN')")
//    public ResponseEntity<List<Society>> getSocietiesWithoutUserAccount() {
//        return ResponseEntity.ok(societyService.getSocietiesWithoutUserAccount());
//    }
//
//    /**
//     * Get account status for a specific society
//     */
//    @GetMapping("/{id}/account-status")
//    public ResponseEntity<Map<String, Object>> getSocietyAccountStatus(@PathVariable String id) {
//        return ResponseEntity.ok(societyService.getSocietyAccountStatus(id));
//    }
//}




import com.CooperativeDevelopmentManagementSystem.DCDSystem.dto.SocietyRequest;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.model.Society;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.service.SocietyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/societies")
@RequiredArgsConstructor
public class SocietyController {

    private final SocietyService societyService;

    @PostMapping
    @PreAuthorize("hasAuthority('DISTRICT_ADMIN') or hasAuthority('PROVINCIAL_ADMIN')")
    public ResponseEntity<Society> createSociety(@Valid @RequestBody SocietyRequest request) {
        Society society = societyService.createSociety(request);
        return ResponseEntity.ok(society);
    }

    @GetMapping
    public ResponseEntity<List<Society>> getAllSocieties() {
        return ResponseEntity.ok(societyService.getAllSocieties());
    }

    @GetMapping("/district/{districtId}")
    public ResponseEntity<List<Society>> getSocietiesByDistrict(@PathVariable String districtId) {
        return ResponseEntity.ok(societyService.getSocietiesByDistrict(districtId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Society> getSocietyById(@PathVariable String id) {
        return ResponseEntity.ok(societyService.getSocietyById(id));
    }

    /**
     * Update society details
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('DISTRICT_ADMIN') or hasAuthority('PROVINCIAL_ADMIN')")
    public ResponseEntity<Society> updateSociety(
            @PathVariable String id,
            @Valid @RequestBody SocietyRequest request) {
        Society society = societyService.updateSociety(id, request);
        return ResponseEntity.ok(society);
    }

    /**
     * Delete society
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('DISTRICT_ADMIN') or hasAuthority('PROVINCIAL_ADMIN')")
    public ResponseEntity<Map<String, String>> deleteSociety(@PathVariable String id) {
        try {
            societyService.deleteSociety(id);
            return ResponseEntity.ok(Map.of("message", "Society deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Get societies available for registration
     * Shows societies where admin OR approval account (or both) are still available
     */
    @GetMapping("/district/{districtId}/available-for-registration")
    public ResponseEntity<List<Society>> getAvailableSocietiesForRegistration(@PathVariable String districtId) {
        return ResponseEntity.ok(societyService.getAvailableSocietiesForRegistration(districtId));
    }

    /**
     * Get societies without any user accounts
     */
    @GetMapping("/without-account")
    @PreAuthorize("hasAuthority('DISTRICT_ADMIN') or hasAuthority('PROVINCIAL_ADMIN')")
    public ResponseEntity<List<Society>> getSocietiesWithoutUserAccount() {
        return ResponseEntity.ok(societyService.getSocietiesWithoutUserAccount());
    }

    /**
     * Get account status for a specific society
     */
    @GetMapping("/{id}/account-status")
    public ResponseEntity<Map<String, Object>> getSocietyAccountStatus(@PathVariable String id) {
        return ResponseEntity.ok(societyService.getSocietyAccountStatus(id));
    }

    /**
     * Get society statistics
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasAuthority('DISTRICT_ADMIN') or hasAuthority('PROVINCIAL_ADMIN')")
    public ResponseEntity<Map<String, Object>> getSocietyStatistics() {
        return ResponseEntity.ok(societyService.getSocietyStatistics());
    }
}
package com.CooperativeDevelopmentManagementSystem.DCDSystem.controller;

import jakarta.validation.Valid;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.dto.ArbitrationOfficerRequest;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.model.ArbitrationOfficer;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.service.ArbitrationOfficerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;



@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/officers")
@RequiredArgsConstructor
public class ArbitrationOfficerController {

    private final ArbitrationOfficerService officerService;

    @PostMapping
    @PreAuthorize("hasAuthority('DISTRICT_ADMIN') or hasAuthority('PROVINCIAL_ADMIN')")
    public ResponseEntity<ArbitrationOfficer> createOfficer(@Valid @RequestBody ArbitrationOfficerRequest request) {
        ArbitrationOfficer officer = officerService.createOfficer(request);
        return ResponseEntity.ok(officer);
    }

    @GetMapping("/district/{districtId}")
    @PreAuthorize("hasAuthority('DISTRICT_ADMIN') or hasAuthority('PROVINCIAL_ADMIN')")
    public ResponseEntity<List<ArbitrationOfficer>> getOfficersByDistrict(@PathVariable String districtId) {
        return ResponseEntity.ok(officerService.getOfficersByDistrict(districtId));
    }

    @GetMapping("/district/{districtId}/available-for-registration")
    public ResponseEntity<List<ArbitrationOfficer>> getAvailableOfficersForRegistration(@PathVariable String districtId) {
        return ResponseEntity.ok(officerService.getAvailableOfficersForRegistration(districtId));
    }

    // NEW: Get officer workload statistics
    @GetMapping("/district/{districtId}/workload")
    @PreAuthorize("hasAuthority('DISTRICT_ADMIN') or hasAuthority('PROVINCIAL_ADMIN')")
    public ResponseEntity<Map<String, Object>> getOfficerWorkloadStats(@PathVariable String districtId) {
        return ResponseEntity.ok(officerService.getOfficerWorkloadStats(districtId));
    }

    @DeleteMapping("/{officerId}")
    @PreAuthorize("hasAuthority('DISTRICT_ADMIN')")
    public ResponseEntity<Void> deleteOfficer(@PathVariable String officerId) {
        officerService.deleteOfficer(officerId);
        return ResponseEntity.noContent().build();
    }
}
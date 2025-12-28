package com.CooperativeDevelopmentManagementSystem.DCDSystem.controller;

import com.CooperativeDevelopmentManagementSystem.DCDSystem.dto.LegalOfficerRequest;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.model.LegalOfficer;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.service.LegalOfficerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
//
//@CrossOrigin(origins = "*", maxAge = 3600)
//@RestController
//@RequestMapping("/api/legal-officers")
//@RequiredArgsConstructor
//public class LegalOfficerController {
//
//    private final LegalOfficerService legalOfficerService;
//
//    @PostMapping
//    @PreAuthorize("hasAuthority('DISTRICT_ADMIN') or hasAuthority('PROVINCIAL_ADMIN')")
//    public ResponseEntity<LegalOfficer> createLegalOfficer(@Valid @RequestBody LegalOfficerRequest request) {
//        LegalOfficer legalOfficer = legalOfficerService.createLegalOfficer(request);
//        return ResponseEntity.ok(legalOfficer);
//    }
//
//    @GetMapping("/district/{districtId}")
//    @PreAuthorize("hasAuthority('DISTRICT_ADMIN') or hasAuthority('PROVINCIAL_ADMIN')")
//    public ResponseEntity<List<LegalOfficer>> getLegalOfficersByDistrict(@PathVariable String districtId) {
//        return ResponseEntity.ok(legalOfficerService.getLegalOfficersByDistrict(districtId));
//    }
//
//    @GetMapping("/district/{districtId}/available-for-registration")
//    public ResponseEntity<List<LegalOfficer>> getAvailableLegalOfficersForRegistration(@PathVariable String districtId) {
//        return ResponseEntity.ok(legalOfficerService.getAvailableLegalOfficersForRegistration(districtId));
//    }
//
//    @DeleteMapping("/{legalOfficerId}")
//    @PreAuthorize("hasAuthority('DISTRICT_ADMIN')")
//    public ResponseEntity<Void> deleteLegalOfficer(@PathVariable String legalOfficerId) {
//        legalOfficerService.deleteLegalOfficer(legalOfficerId);
//        return ResponseEntity.noContent().build();
//    }
//}




import com.CooperativeDevelopmentManagementSystem.DCDSystem.dto.LegalOfficerRequest;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.model.LegalOfficer;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.service.LegalOfficerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/legal-officers")
@RequiredArgsConstructor
public class LegalOfficerController {

    private final LegalOfficerService legalOfficerService;

    @PostMapping
    @PreAuthorize("hasAuthority('DISTRICT_ADMIN') or hasAuthority('PROVINCIAL_ADMIN')")
    public ResponseEntity<LegalOfficer> createLegalOfficer(@Valid @RequestBody LegalOfficerRequest request) {
        LegalOfficer legalOfficer = legalOfficerService.createLegalOfficer(request);
        return ResponseEntity.ok(legalOfficer);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('DISTRICT_ADMIN') or hasAuthority('PROVINCIAL_ADMIN')")
    public ResponseEntity<LegalOfficer> updateLegalOfficer(
            @PathVariable String id,
            @Valid @RequestBody LegalOfficerRequest request) {
        LegalOfficer legalOfficer = legalOfficerService.updateLegalOfficer(id, request);
        return ResponseEntity.ok(legalOfficer);
    }

    @GetMapping("/district/{districtId}")
    @PreAuthorize("hasAuthority('DISTRICT_ADMIN') or hasAuthority('PROVINCIAL_ADMIN')")
    public ResponseEntity<List<LegalOfficer>> getLegalOfficersByDistrict(@PathVariable String districtId) {
        return ResponseEntity.ok(legalOfficerService.getLegalOfficersByDistrict(districtId));
    }

    @GetMapping("/district/{districtId}/available-for-registration")
    public ResponseEntity<List<LegalOfficer>> getAvailableLegalOfficersForRegistration(@PathVariable String districtId) {
        return ResponseEntity.ok(legalOfficerService.getAvailableLegalOfficersForRegistration(districtId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LegalOfficer> getLegalOfficerById(@PathVariable String id) {
        return ResponseEntity.ok(legalOfficerService.getLegalOfficerById(id));
    }

    @GetMapping("/court/{courtId}")
    public ResponseEntity<List<LegalOfficer>> getLegalOfficersByCourtId(@PathVariable String courtId) {
        return ResponseEntity.ok(legalOfficerService.getLegalOfficersByCourtId(courtId));
    }

    @PostMapping("/{officerId}/assign-court/{courtId}")
    @PreAuthorize("hasAuthority('DISTRICT_ADMIN') or hasAuthority('PROVINCIAL_ADMIN')")
    public ResponseEntity<LegalOfficer> assignCourtToOfficer(
            @PathVariable String officerId,
            @PathVariable String courtId) {
        return ResponseEntity.ok(legalOfficerService.assignCourtToOfficer(officerId, courtId));
    }

    @DeleteMapping("/{officerId}/remove-court/{courtId}")
    @PreAuthorize("hasAuthority('DISTRICT_ADMIN') or hasAuthority('PROVINCIAL_ADMIN')")
    public ResponseEntity<LegalOfficer> removeCourtFromOfficer(
            @PathVariable String officerId,
            @PathVariable String courtId) {
        return ResponseEntity.ok(legalOfficerService.removeCourtFromOfficer(officerId, courtId));
    }

    @DeleteMapping("/{legalOfficerId}")
    @PreAuthorize("hasAuthority('DISTRICT_ADMIN')")
    public ResponseEntity<Void> deleteLegalOfficer(@PathVariable String legalOfficerId) {
        legalOfficerService.deleteLegalOfficer(legalOfficerId);
        return ResponseEntity.noContent().build();
    }
}
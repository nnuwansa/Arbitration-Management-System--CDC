package com.CooperativeDevelopmentManagementSystem.DCDSystem.service;

import com.CooperativeDevelopmentManagementSystem.DCDSystem.dto.LegalOfficerRequest;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.model.LegalOfficer;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.repository.LegalOfficerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;





import com.CooperativeDevelopmentManagementSystem.DCDSystem.model.Court;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.model.LegalOfficer;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.repository.CourtRepository;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.repository.LegalOfficerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LegalOfficerService {

    private final LegalOfficerRepository legalOfficerRepository;
    private final CourtRepository courtRepository;

    public LegalOfficer createLegalOfficer(LegalOfficerRequest request) {
        // Validate court assignments if provided
        List<String> courtNames = new ArrayList<>();
        if (request.getAssignedCourtIds() != null && !request.getAssignedCourtIds().isEmpty()) {
            for (String courtId : request.getAssignedCourtIds()) {
                Court court = courtRepository.findById(courtId)
                        .orElseThrow(() -> new RuntimeException("Court not found: " + courtId));
                courtNames.add(court.getName());
            }
        }

        LegalOfficer legalOfficer = LegalOfficer.builder()
                .name(request.getName())
                .districtId(request.getDistrictId())
                .assignedCourtIds(request.getAssignedCourtIds())
                .assignedCourtNames(courtNames)
                .userAccountCreated(false)
                .createdAt(LocalDateTime.now())
                .build();

        return legalOfficerRepository.save(legalOfficer);
    }

    public LegalOfficer updateLegalOfficer(String id, LegalOfficerRequest request) {
        LegalOfficer legalOfficer = legalOfficerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Legal officer not found"));

        // Validate and update court assignments
        List<String> courtNames = new ArrayList<>();
        if (request.getAssignedCourtIds() != null && !request.getAssignedCourtIds().isEmpty()) {
            for (String courtId : request.getAssignedCourtIds()) {
                Court court = courtRepository.findById(courtId)
                        .orElseThrow(() -> new RuntimeException("Court not found: " + courtId));
                courtNames.add(court.getName());
            }
        }

        legalOfficer.setName(request.getName());
        legalOfficer.setDistrictId(request.getDistrictId());
        legalOfficer.setAssignedCourtIds(request.getAssignedCourtIds());
        legalOfficer.setAssignedCourtNames(courtNames);
        legalOfficer.setUpdatedAt(LocalDateTime.now());

        return legalOfficerRepository.save(legalOfficer);
    }

    public List<LegalOfficer> getLegalOfficersByDistrict(String districtId) {
        return legalOfficerRepository.findByDistrictId(districtId);
    }

    public List<LegalOfficer> getAvailableLegalOfficersForRegistration(String districtId) {
        return legalOfficerRepository.findByDistrictIdAndUserAccountCreated(districtId, false);
    }

    public LegalOfficer getLegalOfficerById(String id) {
        return legalOfficerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Legal officer not found with id: " + id));
    }

    public void deleteLegalOfficer(String legalOfficerId) {
        LegalOfficer legalOfficer = legalOfficerRepository.findById(legalOfficerId)
                .orElseThrow(() -> new RuntimeException("Legal Officer not found with id: " + legalOfficerId));

        if (Boolean.TRUE.equals(legalOfficer.getUserAccountCreated())) {
            throw new RuntimeException("Cannot delete legal officer with an existing user account. Please delete user account first.");
        }

        legalOfficerRepository.deleteById(legalOfficerId);
    }

    // Get legal officers assigned to a specific court
    public List<LegalOfficer> getLegalOfficersByCourtId(String courtId) {
        List<LegalOfficer> allOfficers = legalOfficerRepository.findAll();

        return allOfficers.stream()
                .filter(officer -> officer.getAssignedCourtIds() != null &&
                        officer.getAssignedCourtIds().contains(courtId))
                .collect(Collectors.toList());
    }

    // Assign court to legal officer
    public LegalOfficer assignCourtToOfficer(String officerId, String courtId) {
        LegalOfficer officer = getLegalOfficerById(officerId);
        Court court = courtRepository.findById(courtId)
                .orElseThrow(() -> new RuntimeException("Court not found"));

        if (officer.getAssignedCourtIds() == null) {
            officer.setAssignedCourtIds(new ArrayList<>());
            officer.setAssignedCourtNames(new ArrayList<>());
        }

        if (!officer.getAssignedCourtIds().contains(courtId)) {
            officer.getAssignedCourtIds().add(courtId);
            officer.getAssignedCourtNames().add(court.getName());
            officer.setUpdatedAt(LocalDateTime.now());
            return legalOfficerRepository.save(officer);
        }

        return officer;
    }

    // Remove court from legal officer
    public LegalOfficer removeCourtFromOfficer(String officerId, String courtId) {
        LegalOfficer officer = getLegalOfficerById(officerId);

        if (officer.getAssignedCourtIds() != null) {
            int index = officer.getAssignedCourtIds().indexOf(courtId);
            if (index >= 0) {
                officer.getAssignedCourtIds().remove(index);
                officer.getAssignedCourtNames().remove(index);
                officer.setUpdatedAt(LocalDateTime.now());
                return legalOfficerRepository.save(officer);
            }
        }

        return officer;
    }
}
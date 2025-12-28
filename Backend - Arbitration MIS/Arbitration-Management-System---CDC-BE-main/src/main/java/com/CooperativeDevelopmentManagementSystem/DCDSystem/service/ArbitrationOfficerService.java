package com.CooperativeDevelopmentManagementSystem.DCDSystem.service;

import com.CooperativeDevelopmentManagementSystem.DCDSystem.dto.ArbitrationOfficerRequest;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.model.ArbitrationOfficer;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.model.Submission;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.repository.ArbitrationOfficerRepository;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.repository.SubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import lombok.Builder;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ArbitrationOfficerService {

    private final ArbitrationOfficerRepository officerRepository;
    private final SubmissionRepository submissionRepository;

    public ArbitrationOfficer createOfficer(ArbitrationOfficerRequest request) {
        ArbitrationOfficer officer = ArbitrationOfficer.builder()
                .name(request.getName())
                .districtId(request.getDistrictId())
                .userAccountCreated(false)
                .createdAt(LocalDateTime.now())
                .build();

        return officerRepository.save(officer);
    }

    public List<ArbitrationOfficer> getOfficersByDistrict(String districtId) {
        return officerRepository.findByDistrictId(districtId);
    }

    public List<ArbitrationOfficer> getAvailableOfficersForRegistration(String districtId) {
        return officerRepository.findByDistrictIdAndUserAccountCreated(districtId, false);
    }

    public ArbitrationOfficer getAvailableOfficer(String districtId) {
        return officerRepository.findFirstByDistrictIdAndAssignedToSocietyIdIsNull(districtId)
                .orElseThrow(() -> new RuntimeException("No available officers in district"));
    }

    /**
     * NEW IMPROVED METHOD: Get available officer or re-assign based on workload
     * Strategy:
     * 1. First, try to find officers not assigned to any society
     * 2. If all officers are assigned, find the officer with the least number of active borrowers
     */
    public ArbitrationOfficer getAvailableOfficerOrReassign(String districtId) {
        // Step 1: Try to get an unassigned officer first
        Optional<ArbitrationOfficer> availableOfficer =
                officerRepository.findFirstByDistrictIdAndAssignedToSocietyIdIsNull(districtId);

        if (availableOfficer.isPresent()) {
            System.out.println("✅ Found available officer: " + availableOfficer.get().getName());
            return availableOfficer.get();
        }

        System.out.println("⚠️ No available officers, calculating workload for reassignment...");

        // Step 2: All officers are assigned, find the one with least workload
        List<ArbitrationOfficer> allOfficers = officerRepository.findByDistrictId(districtId);

        if (allOfficers.isEmpty()) {
            throw new RuntimeException("No officers exist in this district. Please create officers first.");
        }

        // Get all submissions to count borrowers per officer
        List<Submission> allSubmissions = submissionRepository.findByDistrictId(districtId);

        // Count active borrowers (not decision-given) for each officer
        Map<String, Long> officerWorkload = new HashMap<>();

        for (ArbitrationOfficer officer : allOfficers) {
            long activeBorrowers = allSubmissions.stream()
                    .flatMap(submission -> submission.getBorrowers().stream())
                    .filter(borrower -> officer.getId().equals(borrower.getAssignedOfficerId()))
                    .filter(borrower -> !"decision-given".equals(borrower.getStatus()))
                    .count();

            officerWorkload.put(officer.getId(), activeBorrowers);
            System.out.println("👤 Officer: " + officer.getName() + " | Active Borrowers: " + activeBorrowers);
        }

        // Find officer with minimum workload
        ArbitrationOfficer selectedOfficer = allOfficers.stream()
                .min(Comparator.comparing(officer -> officerWorkload.get(officer.getId())))
                .orElse(allOfficers.get(0));

        System.out.println("✅ Selected officer with least workload: " + selectedOfficer.getName() +
                " (Active Borrowers: " + officerWorkload.get(selectedOfficer.getId()) + ")");

        return selectedOfficer;
    }

    /**
     * Alternative method: Simple round-robin based on total assignments (not workload)
     * This is simpler but less optimal than workload-based assignment
     */
    public ArbitrationOfficer getAvailableOfficerRoundRobin(String districtId) {
        // First try to get an unassigned officer
        Optional<ArbitrationOfficer> availableOfficer =
                officerRepository.findFirstByDistrictIdAndAssignedToSocietyIdIsNull(districtId);

        if (availableOfficer.isPresent()) {
            return availableOfficer.get();
        }

        // All officers assigned, use round-robin
        List<ArbitrationOfficer> allOfficers = officerRepository.findByDistrictId(districtId);

        if (allOfficers.isEmpty()) {
            throw new RuntimeException("No officers exist in this district. Please create officers first.");
        }

        // Get all submissions
        List<Submission> allSubmissions = submissionRepository.findByDistrictId(districtId);

        // Count total borrowers assigned to each officer
        Map<String, Long> officerAssignmentCount = new HashMap<>();

        for (ArbitrationOfficer officer : allOfficers) {
            long totalAssignments = allSubmissions.stream()
                    .flatMap(submission -> submission.getBorrowers().stream())
                    .filter(borrower -> officer.getId().equals(borrower.getAssignedOfficerId()))
                    .count();

            officerAssignmentCount.put(officer.getId(), totalAssignments);
        }

        // Return officer with least total assignments
        return allOfficers.stream()
                .min(Comparator.comparing(officer ->
                        officerAssignmentCount.getOrDefault(officer.getId(), 0L)))
                .orElse(allOfficers.get(0));
    }

    public void assignOfficerToSociety(String officerId, String societyId) {
        ArbitrationOfficer officer = officerRepository.findById(officerId)
                .orElseThrow(() -> new RuntimeException("Officer not found"));

        // Officers can now handle multiple societies
        officer.setAssignedToSocietyId(societyId);
        officer.setUpdatedAt(LocalDateTime.now());
        officerRepository.save(officer);
    }

    /**
     * Get officer workload statistics
     */
    public Map<String, Object> getOfficerWorkloadStats(String districtId) {
        List<ArbitrationOfficer> officers = officerRepository.findByDistrictId(districtId);
        List<Submission> submissions = submissionRepository.findByDistrictId(districtId);

        List<Map<String, Object>> stats = new ArrayList<>();

        for (ArbitrationOfficer officer : officers) {
            long totalAssigned = submissions.stream()
                    .flatMap(s -> s.getBorrowers().stream())
                    .filter(b -> officer.getId().equals(b.getAssignedOfficerId()))
                    .count();

            long activeCases = submissions.stream()
                    .flatMap(s -> s.getBorrowers().stream())
                    .filter(b -> officer.getId().equals(b.getAssignedOfficerId()))
                    .filter(b -> !"decision-given".equals(b.getStatus()))
                    .count();

            long completedCases = submissions.stream()
                    .flatMap(s -> s.getBorrowers().stream())
                    .filter(b -> officer.getId().equals(b.getAssignedOfficerId()))
                    .filter(b -> "decision-given".equals(b.getStatus()))
                    .count();

            Map<String, Object> officerStats = new HashMap<>();
            officerStats.put("officerId", officer.getId());
            officerStats.put("officerName", officer.getName());
            officerStats.put("totalAssigned", totalAssigned);
            officerStats.put("activeCases", activeCases);
            officerStats.put("completedCases", completedCases);
            officerStats.put("assignedToSociety", officer.getAssignedToSocietyId());

            stats.add(officerStats);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("districtId", districtId);
        result.put("totalOfficers", officers.size());
        result.put("officerStats", stats);

        return result;
    }

    public void deleteOfficer(String officerId) {
        ArbitrationOfficer officer = officerRepository.findById(officerId)
                .orElseThrow(() -> new RuntimeException("Officer not found with id: " + officerId));

        if (Boolean.TRUE.equals(officer.getUserAccountCreated())) {
            throw new RuntimeException("Cannot delete officer with an existing user account. Please delete user account first.");
        }

        if (officer.getAssignedToSocietyId() != null && !officer.getAssignedToSocietyId().isEmpty()) {
            throw new RuntimeException("Cannot delete officer that is assigned to a society. Please unassign the officer first.");
        }

        officerRepository.deleteById(officerId);
    }
}
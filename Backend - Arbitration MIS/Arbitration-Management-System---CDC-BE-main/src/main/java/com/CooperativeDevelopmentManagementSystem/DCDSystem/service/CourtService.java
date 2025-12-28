package com.CooperativeDevelopmentManagementSystem.DCDSystem.service;



import com.CooperativeDevelopmentManagementSystem.DCDSystem.model.Court;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.model.District;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.repository.CourtRepository;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.repository.DistrictRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CourtService {

    private final CourtRepository courtRepository;
    private final DistrictRepository districtRepository;

    /**
     * Create a new court
     */
    public Court createCourt(Court court) {
        // Validate required fields
        if (court.getName() == null || court.getName().trim().isEmpty()) {
            throw new RuntimeException("Court name is required");
        }

        if (court.getDistrictId() == null || court.getDistrictId().trim().isEmpty()) {
            throw new RuntimeException("District ID is required");
        }

        // Validate district exists
        District district = districtRepository.findById(court.getDistrictId())
                .orElseThrow(() -> new RuntimeException("District not found with ID: " + court.getDistrictId()));

        // Set district name
        court.setDistrictName(district.getName());

        // Set creation timestamp
        court.setCreatedAt(LocalDateTime.now());

        return courtRepository.save(court);
    }

    /**
     * Update court
     */
    public Court updateCourt(String courtId, Court updatedCourt) {
        Court existingCourt = courtRepository.findById(courtId)
                .orElseThrow(() -> new RuntimeException("Court not found with ID: " + courtId));

        // Update fields
        if (updatedCourt.getName() != null && !updatedCourt.getName().trim().isEmpty()) {
            existingCourt.setName(updatedCourt.getName());
        }

        if (updatedCourt.getDistrictId() != null && !updatedCourt.getDistrictId().trim().isEmpty()) {
            // Validate district exists
            District district = districtRepository.findById(updatedCourt.getDistrictId())
                    .orElseThrow(() -> new RuntimeException("District not found with ID: " + updatedCourt.getDistrictId()));

            existingCourt.setDistrictId(updatedCourt.getDistrictId());
            existingCourt.setDistrictName(district.getName());
        }

        if (updatedCourt.getAddress() != null) {
            existingCourt.setAddress(updatedCourt.getAddress());
        }

        if (updatedCourt.getContactNumber() != null) {
            existingCourt.setContactNumber(updatedCourt.getContactNumber());
        }

        if (updatedCourt.getType() != null) {
            existingCourt.setType(updatedCourt.getType());
        }

        // Set update timestamp
        existingCourt.setUpdatedAt(LocalDateTime.now());

        return courtRepository.save(existingCourt);
    }

    /**
     * Delete court
     */
    public void deleteCourt(String courtId) {
        Court court = courtRepository.findById(courtId)
                .orElseThrow(() -> new RuntimeException("Court not found with ID: " + courtId));

        // Optional: Check if court is assigned to any legal officers
        // You can add validation here if needed

        courtRepository.deleteById(courtId);
    }

    /**
     * Get all courts
     */
    public List<Court> getAllCourts() {
        return courtRepository.findAll();
    }

    /**
     * Get courts by district
     */
    public List<Court> getCourtsByDistrict(String districtId) {
        return courtRepository.findByDistrictId(districtId);
    }

    /**
     * Get court by ID
     */
    public Court getCourtById(String courtId) {
        return courtRepository.findById(courtId)
                .orElseThrow(() -> new RuntimeException("Court not found with ID: " + courtId));
    }
}
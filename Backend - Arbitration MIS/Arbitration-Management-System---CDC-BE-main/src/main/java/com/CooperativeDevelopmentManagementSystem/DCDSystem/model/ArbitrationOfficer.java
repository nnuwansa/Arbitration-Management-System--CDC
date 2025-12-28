package com.CooperativeDevelopmentManagementSystem.DCDSystem.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "arbitration_officers")
public class ArbitrationOfficer {
    @Id
    private String id;

    private String name;

    private String districtId;

    private String assignedToSocietyId;

    @Builder.Default
    private Boolean userAccountCreated = false; // NEW: Track if user account created

    private String userEmail; // NEW: Email of linked user account

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDistrictId() {
        return districtId;
    }

    public void setDistrictId(String districtId) {
        this.districtId = districtId;
    }

    public String getAssignedToSocietyId() {
        return assignedToSocietyId;
    }

    public void setAssignedToSocietyId(String assignedToSocietyId) {
        this.assignedToSocietyId = assignedToSocietyId;
    }

    public Boolean getUserAccountCreated() {
        return userAccountCreated;
    }

    public void setUserAccountCreated(Boolean userAccountCreated) {
        this.userAccountCreated = userAccountCreated;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
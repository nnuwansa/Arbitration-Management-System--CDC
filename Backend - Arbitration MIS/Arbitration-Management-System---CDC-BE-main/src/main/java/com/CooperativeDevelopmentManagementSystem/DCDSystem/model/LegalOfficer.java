package com.CooperativeDevelopmentManagementSystem.DCDSystem.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
//
//@Document(collection = "legal_officers")
//@Data
//@Builder
//@NoArgsConstructor
//@AllArgsConstructor
//public class LegalOfficer {
//    @Id
//    private String id;
//
//    private String name;
//    private String districtId;
//
//    // User account tracking
//    private Boolean userAccountCreated = false;
//    private String userEmail;
//
//    private LocalDateTime createdAt;
//    private LocalDateTime updatedAt;
//
//    public String getId() {
//        return id;
//    }
//
//    public void setId(String id) {
//        this.id = id;
//    }
//
//    public String getName() {
//        return name;
//    }
//
//    public void setName(String name) {
//        this.name = name;
//    }
//
//    public String getDistrictId() {
//        return districtId;
//    }
//
//    public void setDistrictId(String districtId) {
//        this.districtId = districtId;
//    }
//
//    public Boolean getUserAccountCreated() {
//        return userAccountCreated;
//    }
//
//    public void setUserAccountCreated(Boolean userAccountCreated) {
//        this.userAccountCreated = userAccountCreated;
//    }
//
//    public String getUserEmail() {
//        return userEmail;
//    }
//
//    public void setUserEmail(String userEmail) {
//        this.userEmail = userEmail;
//    }
//
//    public LocalDateTime getCreatedAt() {
//        return createdAt;
//    }
//
//    public void setCreatedAt(LocalDateTime createdAt) {
//        this.createdAt = createdAt;
//    }
//
//    public LocalDateTime getUpdatedAt() {
//        return updatedAt;
//    }
//
//    public void setUpdatedAt(LocalDateTime updatedAt) {
//        this.updatedAt = updatedAt;
//    }
//}






import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "legal_officers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LegalOfficer {
    @Id
    private String id;

    private String name;
    private String districtId;

    // Court assignments - can be assigned to multiple courts
    private List<String> assignedCourtIds;
    private List<String> assignedCourtNames;

    // User account tracking
    private Boolean userAccountCreated = false;
    private String userEmail;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Getters and Setters
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

    public List<String> getAssignedCourtIds() {
        return assignedCourtIds;
    }

    public void setAssignedCourtIds(List<String> assignedCourtIds) {
        this.assignedCourtIds = assignedCourtIds;
    }

    public List<String> getAssignedCourtNames() {
        return assignedCourtNames;
    }

    public void setAssignedCourtNames(List<String> assignedCourtNames) {
        this.assignedCourtNames = assignedCourtNames;
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
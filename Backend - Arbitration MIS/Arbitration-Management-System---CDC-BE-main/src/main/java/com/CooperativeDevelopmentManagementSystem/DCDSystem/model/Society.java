package com.CooperativeDevelopmentManagementSystem.DCDSystem.model;//package com.CooperativeDevelopmentManagementSystem.DCDSystem.model;

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
@Document(collection = "societies")
public class Society {
    @Id
    private String id;

    private String name;
    private String districtId;
    private String registrationNo;
    private String registeredAddress;
    private LocalDateTime registrationDate;

    // Track both admin and approval accounts
    @Builder.Default
    private Boolean adminAccountCreated = false;

    @Builder.Default
    private Boolean approvalAccountCreated = false;

    private String adminEmail;
    private String approvalEmail;

    // Convenience field - true when BOTH accounts are created
    @Builder.Default
    private Boolean userAccountCreated = false;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Helper method to check if both accounts are created
    public boolean hasBothAccounts() {
        return Boolean.TRUE.equals(adminAccountCreated) &&
                Boolean.TRUE.equals(approvalAccountCreated);
    }

    // Helper method to check if society can still create accounts
    public boolean canCreateAccount() {
        return !hasBothAccounts();
    }

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

    public String getRegistrationNo() {
        return registrationNo;
    }

    public void setRegistrationNo(String registrationNo) {
        this.registrationNo = registrationNo;
    }

    public String getRegisteredAddress() {
        return registeredAddress;
    }

    public void setRegisteredAddress(String registeredAddress) {
        this.registeredAddress = registeredAddress;
    }

    public LocalDateTime getRegistrationDate() {
        return registrationDate;
    }

    public void setRegistrationDate(LocalDateTime registrationDate) {
        this.registrationDate = registrationDate;
    }

    public Boolean getAdminAccountCreated() {
        return adminAccountCreated;
    }

    public void setAdminAccountCreated(Boolean adminAccountCreated) {
        this.adminAccountCreated = adminAccountCreated;
    }

    public Boolean getApprovalAccountCreated() {
        return approvalAccountCreated;
    }

    public void setApprovalAccountCreated(Boolean approvalAccountCreated) {
        this.approvalAccountCreated = approvalAccountCreated;
    }

    public String getAdminEmail() {
        return adminEmail;
    }

    public void setAdminEmail(String adminEmail) {
        this.adminEmail = adminEmail;
    }

    public String getApprovalEmail() {
        return approvalEmail;
    }

    public void setApprovalEmail(String approvalEmail) {
        this.approvalEmail = approvalEmail;
    }

    public Boolean getUserAccountCreated() {
        return userAccountCreated;
    }

    public void setUserAccountCreated(Boolean userAccountCreated) {
        this.userAccountCreated = userAccountCreated;
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
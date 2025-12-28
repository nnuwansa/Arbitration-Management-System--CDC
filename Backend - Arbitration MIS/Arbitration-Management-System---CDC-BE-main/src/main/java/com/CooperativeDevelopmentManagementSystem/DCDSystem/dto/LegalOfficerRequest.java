package com.CooperativeDevelopmentManagementSystem.DCDSystem.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class LegalOfficerRequest {
    @NotBlank
    private String name;

    @NotBlank
    private String districtId;

    // List of court IDs this legal officer is assigned to
    private List<String> assignedCourtIds;

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


}
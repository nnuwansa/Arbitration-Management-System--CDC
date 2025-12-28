package com.CooperativeDevelopmentManagementSystem.DCDSystem.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ArbitrationOfficerRequest {
    @NotBlank
    private String name;

    @NotBlank
    private String districtId;

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
}

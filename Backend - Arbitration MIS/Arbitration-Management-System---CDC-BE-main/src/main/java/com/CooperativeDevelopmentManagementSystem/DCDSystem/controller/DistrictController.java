package com.CooperativeDevelopmentManagementSystem.DCDSystem.controller;

import com.CooperativeDevelopmentManagementSystem.DCDSystem.model.District;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.repository.DistrictRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/districts")
@RequiredArgsConstructor
public class DistrictController {

    private final DistrictRepository districtRepository;

    @GetMapping
    public ResponseEntity<List<District>> getAllDistricts() {
        return ResponseEntity.ok(districtRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<District> getDistrictById(@PathVariable String id) {
        District district = districtRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("District not found"));
        return ResponseEntity.ok(district);
    }
}

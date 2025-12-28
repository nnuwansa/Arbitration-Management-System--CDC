package com.CooperativeDevelopmentManagementSystem.DCDSystem.repository;

import com.CooperativeDevelopmentManagementSystem.DCDSystem.model.District;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DistrictRepository extends MongoRepository<District, String> {

    // Existing methods
    Optional<District> findByCode(String code);

    // ADD THIS METHOD to find by name
    Optional<District> findByName(String name);
}
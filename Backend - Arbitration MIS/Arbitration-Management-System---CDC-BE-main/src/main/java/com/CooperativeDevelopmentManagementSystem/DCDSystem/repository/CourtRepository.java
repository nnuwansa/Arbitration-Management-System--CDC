package com.CooperativeDevelopmentManagementSystem.DCDSystem.repository;



import com.CooperativeDevelopmentManagementSystem.DCDSystem.model.Court;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface CourtRepository extends MongoRepository<Court, String> {
    List<Court> findByDistrictId(String districtId);
}
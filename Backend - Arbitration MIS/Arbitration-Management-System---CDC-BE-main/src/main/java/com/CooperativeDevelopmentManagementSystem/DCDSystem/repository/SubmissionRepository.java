package com.CooperativeDevelopmentManagementSystem.DCDSystem.repository;

import com.CooperativeDevelopmentManagementSystem.DCDSystem.model.Submission;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubmissionRepository extends MongoRepository<Submission, String> {
    List<Submission> findBySocietyId(String societyId);


    List<Submission> findByDistrictId(String districtId);


    List<Submission> findBySocietyIdAndStatus(String societyId, String status);

    List<Submission> findByDistrictIdAndStatus(String districtId, String status);
}


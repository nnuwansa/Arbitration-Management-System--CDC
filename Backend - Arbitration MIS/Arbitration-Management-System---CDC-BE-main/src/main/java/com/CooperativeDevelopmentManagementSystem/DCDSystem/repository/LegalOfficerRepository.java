package com.CooperativeDevelopmentManagementSystem.DCDSystem.repository;

import com.CooperativeDevelopmentManagementSystem.DCDSystem.model.LegalOfficer;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface LegalOfficerRepository extends MongoRepository<LegalOfficer, String> {

    List<LegalOfficer> findByDistrictId(String districtId);

    List<LegalOfficer> findByDistrictIdAndUserAccountCreated(String districtId, boolean userAccountCreated);
}
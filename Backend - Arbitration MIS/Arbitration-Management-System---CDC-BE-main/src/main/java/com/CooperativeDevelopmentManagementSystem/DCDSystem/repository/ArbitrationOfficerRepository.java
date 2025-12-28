package com.CooperativeDevelopmentManagementSystem.DCDSystem.repository;




import com.CooperativeDevelopmentManagementSystem.DCDSystem.model.ArbitrationOfficer;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


public interface ArbitrationOfficerRepository extends MongoRepository<ArbitrationOfficer, String> {

    List<ArbitrationOfficer> findByDistrictId(String districtId);

    List<ArbitrationOfficer> findByDistrictIdAndUserAccountCreated(String districtId, boolean userAccountCreated);

    Optional<ArbitrationOfficer> findFirstByDistrictIdAndAssignedToSocietyIdIsNull(String districtId);


    @Query(value = "{ 'assignedToSocietyId': { $ne: null } }", count = true)
    default int countSocietiesAssignedToOfficer(String officerId) {

        return 0;
    }
}
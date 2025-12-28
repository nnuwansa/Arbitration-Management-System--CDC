


package com.CooperativeDevelopmentManagementSystem.DCDSystem.repository;

import com.CooperativeDevelopmentManagementSystem.DCDSystem.model.Society;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
//
//@Repository
//public interface SocietyRepository extends MongoRepository<Society, String> {
//    List<Society> findByDistrictId(String districtId);
//    List<Society> findByUserAccountCreated(Boolean userAccountCreated);
//    Optional<Society> findByUserEmail(String userEmail);
//}


//
//@Repository
//public interface SocietyRepository extends MongoRepository<Society, String> {
//    List<Society> findByDistrictId(String districtId);
//
//    // NEW: Find societies by district and account creation status
//    List<Society> findByDistrictIdAndUserAccountCreated(String districtId, Boolean userAccountCreated);
//
//    List<Society> findByUserAccountCreated(Boolean userAccountCreated);
//
//    Optional<Society> findByUserEmail(String userEmail);
//}




import com.CooperativeDevelopmentManagementSystem.DCDSystem.model.Society;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SocietyRepository extends MongoRepository<Society, String> {

    // Find all societies in a district
    List<Society> findByDistrictId(String districtId);

    /**
     * Find societies available for registration in a district
     * Returns societies where at least one role (admin OR approval) is still available
     * This uses MongoDB query to find societies where:
     * - adminAccountCreated is not true OR approvalAccountCreated is not true
     */
    @Query("{ 'districtId': ?0, '$or': [ " +
            "{ 'adminAccountCreated': { '$ne': true } }, " +
            "{ 'approvalAccountCreated': { '$ne': true } } " +
            "] }")
    List<Society> findAvailableForRegistrationByDistrict(String districtId);

    /**
     * Alternative method without @Query annotation
     * Find societies where userAccountCreated is false (both accounts not created)
     */
    List<Society> findByDistrictIdAndUserAccountCreated(String districtId, Boolean userAccountCreated);

    /**
     * Find societies where BOTH accounts are created (or not)
     */
    List<Society> findByUserAccountCreated(Boolean userAccountCreated);

    /**
     * Find society by admin email
     */
    Optional<Society> findByAdminEmail(String adminEmail);

    /**
     * Find society by approval email
     */
    Optional<Society> findByApprovalEmail(String approvalEmail);

    /**
     * Check if a society exists with given registration number
     */
    boolean existsByRegistrationNo(String registrationNo);

    /**
     * Find societies by name (case insensitive, partial match)
     */
    @Query("{ 'name': { $regex: ?0, $options: 'i' } }")
    List<Society> findByNameContainingIgnoreCase(String name);

    // ADD THIS METHOD to find by name
    Optional<Society> findByName(String name);

    // Optional: case-insensitive search
    Optional<Society> findByNameIgnoreCase(String name);
}
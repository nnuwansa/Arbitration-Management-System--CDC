package com.CooperativeDevelopmentManagementSystem.DCDSystem.service;

import com.CooperativeDevelopmentManagementSystem.DCDSystem.dto.UpdateUserRequest;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.model.ArbitrationOfficer;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.model.Role;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.model.Society;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.model.User;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.repository.ArbitrationOfficerRepository;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.repository.SocietyRepository;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
//
//@Service
//@RequiredArgsConstructor
//public class UserService {
//
//    private final UserRepository userRepository;
//    private final SocietyRepository societyRepository;
//    private final ArbitrationOfficerRepository arbitrationOfficerRepository;
//    private final PasswordEncoder passwordEncoder;
//
//    /**
//     * Get all users (for Provincial Admin)
//     * ⭐ UPDATED - Now populates society names
//     */
//    public List<User> getAllUsers() {
//        List<User> users = userRepository.findAll();
//        return users.stream()
//                .map(this::populateSocietyName)
//                .collect(Collectors.toList());
//    }
//
//    /**
//     * Get users by district (for District Admin)
//     * ⭐ UPDATED - Now populates society names
//     */
//    public List<User> getUsersByDistrict(String districtId) {
//        List<User> users = userRepository.findAll().stream()
//                .filter(user -> districtId.equals(user.getDistrict()))
//                .collect(Collectors.toList());
//
//        return users.stream()
//                .map(this::populateSocietyName)
//                .collect(Collectors.toList());
//    }
//
//    /**
//     * Get user by ID
//     * ⭐ UPDATED - Now populates society name
//     */
//    public User getUserById(String id) {
//        User user = userRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
//        return populateSocietyName(user);
//    }
//
//    /**
//     * Get user by email
//     * ⭐ UPDATED - Now populates society name
//     */
//    public User getUserByEmail(String email) {
//        User user = userRepository.findByEmail(email)
//                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
//        return populateSocietyName(user);
//    }
//
//    /**
//     * Update user details
//     * ⭐ UPDATED - Updates society name if societyId is present in request
//     */
//    public User updateUser(String id, UpdateUserRequest request) {
//        User user = getUserById(id);
//
//        // Check if email is being changed and if new email already exists
//        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
//            if (userRepository.existsByEmail(request.getEmail())) {
//                throw new RuntimeException("Email is already in use by another user");
//            }
//            user.setEmail(request.getEmail());
//        }
//
//        // Update name if provided
//        if (request.getName() != null && !request.getName().isEmpty()) {
//            user.setName(request.getName());
//        }
//
//        // Update designation if provided
//        if (request.getDesignation() != null) {
//            user.setDesignation(request.getDesignation());
//        }
//
//        // Update enabled status if provided
//        if (request.getEnabled() != null) {
//            user.setEnabled(request.getEnabled());
//        }
//
//        // ⭐ NEW - Update society name if societyId changes
//        // Note: Add societyId to UpdateUserRequest DTO if you want to allow changing society
//        // For now, this ensures society name stays current with societyId
//        if (user.getSocietyId() != null && !user.getSocietyId().isEmpty()) {
//            societyRepository.findById(user.getSocietyId())
//                    .ifPresent(society -> user.setSociety(society.getName()));
//        }
//
//        user.setUpdatedAt(LocalDateTime.now());
//        User saved = userRepository.save(user);
//        return populateSocietyName(saved);
//    }
//
//    /**
//     * Change user password
//     */
//    public void changePassword(String id, String newPassword) {
//        User user = userRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
//        user.setPassword(passwordEncoder.encode(newPassword));
//        user.setUpdatedAt(LocalDateTime.now());
//        userRepository.save(user);
//    }
//
//    /**
//     * Enable/Disable user account
//     * ⭐ UPDATED - Now populates society name
//     */
//    public User toggleUserStatus(String id) {
//        User user = userRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
//        user.setEnabled(!user.getEnabled());
//        user.setUpdatedAt(LocalDateTime.now());
//        User saved = userRepository.save(user);
//        return populateSocietyName(saved);
//    }
//
//    /**
//     * Delete user and clean up related records
//     */
//    public void deleteUser(String id) {
//        User user = userRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
//
//        // If user is linked to a society, update society records
//        if (user.getSocietyId() != null) {
//            try {
//                Society society = societyRepository.findById(user.getSocietyId()).orElse(null);
//                if (society != null) {
//                    // Check which role and remove the link
//                    if (user.getRoles().contains(Role.SOCIETY_ADMIN)) {
//                        society.setAdminAccountCreated(false);
//                        society.setAdminEmail(null);
//                    } else if (user.getRoles().contains(Role.SOCIETY_APPROVAL)) {
//                        society.setApprovalAccountCreated(false);
//                        society.setApprovalEmail(null);
//                    }
//
//                    // Update userAccountCreated flag
//                    society.setUserAccountCreated(society.hasBothAccounts());
//                    society.setUpdatedAt(LocalDateTime.now());
//                    societyRepository.save(society);
//                }
//            } catch (Exception e) {
//                // Log error but continue with deletion
//                System.err.println("Error updating society record: " + e.getMessage());
//            }
//        }
//
//        // If user is linked to an officer, update officer record
//        if (user.getOfficerId() != null) {
//            try {
//                ArbitrationOfficer officer = arbitrationOfficerRepository.findById(user.getOfficerId()).orElse(null);
//                if (officer != null) {
//                    officer.setUserAccountCreated(false);
//                    officer.setUserEmail(null);
//                    officer.setUpdatedAt(LocalDateTime.now());
//                    arbitrationOfficerRepository.save(officer);
//                }
//            } catch (Exception e) {
//                // Log error but continue with deletion
//                System.err.println("Error updating officer record: " + e.getMessage());
//            }
//        }
//
//        // Delete the user
//        userRepository.deleteById(id);
//    }
//
//    /**
//     * Get user statistics
//     * ⭐ UPDATED - Now uses updated getUsersByDistrict
//     */
//    public Map<String, Object> getUserStatistics(String districtId) {
//        // Note: We get the raw data without society name population for statistics
//        List<User> users = districtId != null
//                ? userRepository.findAll().stream()
//                .filter(user -> districtId.equals(user.getDistrict()))
//                .collect(Collectors.toList())
//                : userRepository.findAll();
//
//        long totalUsers = users.size();
//        long societyAdmins = users.stream()
//                .filter(u -> u.getRoles().contains(Role.SOCIETY_ADMIN))
//                .count();
//        long societyApprovals = users.stream()
//                .filter(u -> u.getRoles().contains(Role.SOCIETY_APPROVAL))
//                .count();
//        long officers = users.stream()
//                .filter(u -> u.getRoles().contains(Role.OFFICER))
//                .count();
//        long districtAdmins = users.stream()
//                .filter(u -> u.getRoles().contains(Role.DISTRICT_ADMIN))
//                .count();
//        long provincialAdmins = users.stream()
//                .filter(u -> u.getRoles().contains(Role.PROVINCIAL_ADMIN))
//                .count();
//        long enabledUsers = users.stream()
//                .filter(User::getEnabled)
//                .count();
//        long disabledUsers = totalUsers - enabledUsers;
//
//        Map<String, Object> stats = new HashMap<>();
//        stats.put("totalUsers", totalUsers);
//        stats.put("societyAdmins", societyAdmins);
//        stats.put("societyApprovals", societyApprovals);
//        stats.put("officers", officers);
//        stats.put("districtAdmins", districtAdmins);
//        stats.put("provincialAdmins", provincialAdmins);
//        stats.put("enabledUsers", enabledUsers);
//        stats.put("disabledUsers", disabledUsers);
//
//        return stats;
//    }
//
//    // ⭐⭐⭐ NEW HELPER METHOD ⭐⭐⭐
//    /**
//     * Helper method to populate society name from societyId
//     * This method ensures the society name is always current when reading users
//     *
//     * Why use this approach instead of storing permanently?
//     * - Society name is always up-to-date even if society name changes
//     * - No need to update all user records when a society name changes
//     * - No data duplication in database
//     * - Minimal performance impact (single lookup per user)
//     */
//    private User populateSocietyName(User user) {
//        if (user == null) {
//            return null;
//        }
//
//        // Only populate if user has a societyId
//        if (user.getSocietyId() != null && !user.getSocietyId().isEmpty()) {
//            societyRepository.findById(user.getSocietyId())
//                    .ifPresent(society -> user.setSociety(society.getName()));
//        }
//
//        return user;
//    }
//
//    // ⭐⭐⭐ OPTIONAL: Method to sync society names for existing users ⭐⭐⭐
//    /**
//     * One-time migration method to populate society names in database
//     * Run this ONCE if you want to store society names permanently
//     *
//     * Call this from a controller endpoint or startup script
//     */
//    public void migrateSocietyNamesToDatabase() {
//        List<User> allUsers = userRepository.findAll();
//        int updated = 0;
//
//        for (User user : allUsers) {
//            if (user.getSocietyId() != null && !user.getSocietyId().isEmpty()) {
//                societyRepository.findById(user.getSocietyId())
//                        .ifPresent(society -> {
//                            user.setSociety(society.getName());
//                            userRepository.save(user);
//                        });
//                updated++;
//            }
//        }
//
//        System.out.println("Migrated society names for " + updated + " users");
//    }
//
//    // ⭐⭐⭐ OPTIONAL: Batch update society names when society name changes ⭐⭐⭐
//    /**
//     * Update society name for all users linked to a specific society
//     * Call this from SocietyService when a society name is updated
//     *
//     * @param societyId The ID of the society
//     * @param newSocietyName The new name of the society
//     */
//    public void updateSocietyNameForAllUsers(String societyId, String newSocietyName) {
//        List<User> users = userRepository.findAll().stream()
//                .filter(user -> societyId.equals(user.getSocietyId()))
//                .collect(Collectors.toList());
//
//        users.forEach(user -> {
//            user.setSociety(newSocietyName);
//            user.setUpdatedAt(LocalDateTime.now());
//            userRepository.save(user);
//        });
//
//        System.out.println("Updated society name for " + users.size() + " users");
//    }
//}




import com.CooperativeDevelopmentManagementSystem.DCDSystem.dto.UpdateUserRequest;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.model.ArbitrationOfficer;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.model.Role;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.model.Society;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.model.User;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.repository.ArbitrationOfficerRepository;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.repository.SocietyRepository;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final SocietyRepository societyRepository;
    private final ArbitrationOfficerRepository arbitrationOfficerRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Get all users
     * No need to populate - names are already in database
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Get users by district
     */
    public List<User> getUsersByDistrict(String districtId) {
        return userRepository.findAll().stream()
                .filter(user -> districtId.equals(user.getDistrict()))
                .collect(Collectors.toList());
    }

    /**
     * Get user by ID
     */
    public User getUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    /**
     * Get user by email
     */
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }


    public User updateUser(String id, UpdateUserRequest request) {
        User user = getUserById(id);

        // Check if email is being changed
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email is already in use by another user");
            }
            user.setEmail(request.getEmail());
        }

        // Update name if provided
        if (request.getName() != null && !request.getName().isEmpty()) {
            user.setName(request.getName());
        }

        // Update designation if provided
        if (request.getDesignation() != null) {
            user.setDesignation(request.getDesignation());
        }

        // Update enabled status if provided
        if (request.getEnabled() != null) {
            user.setEnabled(request.getEnabled());
        }

        // ⭐ UPDATE SOCIETY NAME IF SOCIETYID EXISTS
        if (user.getSocietyId() != null && !user.getSocietyId().isEmpty()) {
            String societyName = societyRepository.findById(user.getSocietyId())
                    .map(Society::getName)
                    .orElse(null);
            user.setSociety(societyName);  // Save to database
        }

        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    /**
     * Change user password
     */
    public void changePassword(String id, String newPassword) {
        User user = getUserById(id);
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    /**
     * Enable/Disable user account
     */
    public User toggleUserStatus(String id) {
        User user = getUserById(id);
        user.setEnabled(!user.getEnabled());
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    /**
     * Delete user and clean up related records
     */
    public void deleteUser(String id) {
        User user = getUserById(id);

        // Clean up society records
        if (user.getSocietyId() != null) {
            try {
                Society society = societyRepository.findById(user.getSocietyId()).orElse(null);
                if (society != null) {
                    if (user.getRoles().contains(Role.SOCIETY_ADMIN)) {
                        society.setAdminAccountCreated(false);
                        society.setAdminEmail(null);
                    } else if (user.getRoles().contains(Role.SOCIETY_APPROVAL)) {
                        society.setApprovalAccountCreated(false);
                        society.setApprovalEmail(null);
                    }
                    society.setUserAccountCreated(society.hasBothAccounts());
                    society.setUpdatedAt(LocalDateTime.now());
                    societyRepository.save(society);
                }
            } catch (Exception e) {
                System.err.println("Error updating society record: " + e.getMessage());
            }
        }

        // Clean up officer records
        if (user.getOfficerId() != null) {
            try {
                ArbitrationOfficer officer = arbitrationOfficerRepository.findById(user.getOfficerId()).orElse(null);
                if (officer != null) {
                    officer.setUserAccountCreated(false);
                    officer.setUserEmail(null);
                    officer.setUpdatedAt(LocalDateTime.now());
                    arbitrationOfficerRepository.save(officer);
                }
            } catch (Exception e) {
                System.err.println("Error updating officer record: " + e.getMessage());
            }
        }

        userRepository.deleteById(id);
    }

    /**
     * Get user statistics
     */
    public Map<String, Object> getUserStatistics(String districtId) {
        List<User> users = districtId != null ? getUsersByDistrict(districtId) : getAllUsers();

        long totalUsers = users.size();
        long societyAdmins = users.stream()
                .filter(u -> u.getRoles().contains(Role.SOCIETY_ADMIN))
                .count();
        long societyApprovals = users.stream()
                .filter(u -> u.getRoles().contains(Role.SOCIETY_APPROVAL))
                .count();
        long officers = users.stream()
                .filter(u -> u.getRoles().contains(Role.OFFICER))
                .count();
        long districtAdmins = users.stream()
                .filter(u -> u.getRoles().contains(Role.DISTRICT_ADMIN))
                .count();
        long provincialAdmins = users.stream()
                .filter(u -> u.getRoles().contains(Role.PROVINCIAL_ADMIN))
                .count();
        long enabledUsers = users.stream()
                .filter(User::getEnabled)
                .count();
        long disabledUsers = totalUsers - enabledUsers;

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("societyAdmins", societyAdmins);
        stats.put("societyApprovals", societyApprovals);
        stats.put("officers", officers);
        stats.put("districtAdmins", districtAdmins);
        stats.put("provincialAdmins", provincialAdmins);
        stats.put("enabledUsers", enabledUsers);
        stats.put("disabledUsers", disabledUsers);

        return stats;
    }

    /**
     *
     * Call this from SocietyService.updateSociety() when name changes
     */
    public void updateSocietyNameForAllUsers(String societyId, String newSocietyName) {
        List<User> users = userRepository.findBySocietyId(societyId);

        users.forEach(user -> {
            user.setSociety(newSocietyName);
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);
        });

        System.out.println("Updated society name for " + users.size() + " users");
    }
}
package com.CooperativeDevelopmentManagementSystem.DCDSystem.controller;



import com.CooperativeDevelopmentManagementSystem.DCDSystem.dto.UpdateUserRequest;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.model.User;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;


    @GetMapping
    @PreAuthorize("hasAuthority('PROVINCIAL_ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }


    @GetMapping("/district/{districtId}")
    @PreAuthorize("hasAnyAuthority('DISTRICT_ADMIN', 'PROVINCIAL_ADMIN')")
    public ResponseEntity<List<User>> getUsersByDistrict(@PathVariable String districtId) {
        List<User> users = userService.getUsersByDistrict(districtId);
        return ResponseEntity.ok(users);
    }

    /**
     * Get user by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('DISTRICT_ADMIN', 'PROVINCIAL_ADMIN')")
    public ResponseEntity<User> getUserById(@PathVariable String id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    /**
     * Update user details
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('DISTRICT_ADMIN', 'PROVINCIAL_ADMIN')")
    public ResponseEntity<User> updateUser(
            @PathVariable String id,
            @RequestBody UpdateUserRequest request) {
        User updatedUser = userService.updateUser(id, request);
        return ResponseEntity.ok(updatedUser);
    }

    /**
     * Change user password
     */
    @PutMapping("/{id}/password")
    @PreAuthorize("hasAnyAuthority('DISTRICT_ADMIN', 'PROVINCIAL_ADMIN')")
    public ResponseEntity<Map<String, String>> changePassword(
            @PathVariable String id,
            @RequestBody Map<String, String> request) {
        String newPassword = request.get("newPassword");
        if (newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Password must be at least 6 characters"));
        }
        userService.changePassword(id, newPassword);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    /**
     * Toggle user status (enable/disable)
     */
    @PutMapping("/{id}/toggle-status")
    @PreAuthorize("hasAnyAuthority('DISTRICT_ADMIN', 'PROVINCIAL_ADMIN')")
    public ResponseEntity<User> toggleUserStatus(@PathVariable String id) {
        User user = userService.toggleUserStatus(id);
        return ResponseEntity.ok(user);
    }

    /**
     * Delete user
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('DISTRICT_ADMIN', 'PROVINCIAL_ADMIN')")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    /**
     * Get user statistics
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasAnyAuthority('DISTRICT_ADMIN', 'PROVINCIAL_ADMIN')")
    public ResponseEntity<Map<String, Object>> getUserStatistics(
            @RequestParam(required = false) String districtId) {
        Map<String, Object> statistics = userService.getUserStatistics(districtId);
        return ResponseEntity.ok(statistics);
    }
}
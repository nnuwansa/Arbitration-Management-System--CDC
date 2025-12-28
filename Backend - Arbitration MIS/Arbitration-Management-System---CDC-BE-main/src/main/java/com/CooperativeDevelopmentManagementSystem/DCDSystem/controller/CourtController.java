package com.CooperativeDevelopmentManagementSystem.DCDSystem.controller;



import com.CooperativeDevelopmentManagementSystem.DCDSystem.model.Court;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.service.CourtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
//
//@RestController
//@RequestMapping("/api/courts")
//@RequiredArgsConstructor
//@CrossOrigin(origins = "*")
//public class CourtController {
//
//    private final CourtService courtService;
//
//    /**
//     * Create a new court (District Admin only)
//     */
//    @PostMapping
//    @PreAuthorize("hasRole('DISTRICT_ADMIN')")
//    public ResponseEntity<?> createCourt(@RequestBody Court court) {
//        try {
//            Court createdCourt = courtService.createCourt(court);
//            return ResponseEntity.status(HttpStatus.CREATED).body(createdCourt);
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
//                    .body(new ErrorResponse(e.getMessage()));
//        }
//    }
//
//    /**
//     * Update court (District Admin only)
//     */
//    @PutMapping("/{courtId}")
//    @PreAuthorize("hasRole('DISTRICT_ADMIN')")
//    public ResponseEntity<?> updateCourt(@PathVariable String courtId, @RequestBody Court court) {
//        try {
//            Court updatedCourt = courtService.updateCourt(courtId, court);
//            return ResponseEntity.ok(updatedCourt);
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
//                    .body(new ErrorResponse(e.getMessage()));
//        }
//    }
//
//    /**
//     * Delete court (District Admin only)
//     */
//    @DeleteMapping("/{courtId}")
//    @PreAuthorize("hasRole('DISTRICT_ADMIN')")
//    public ResponseEntity<?> deleteCourt(@PathVariable String courtId) {
//        try {
//            courtService.deleteCourt(courtId);
//            return ResponseEntity.ok(new SuccessResponse("Court deleted successfully"));
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
//                    .body(new ErrorResponse(e.getMessage()));
//        }
//    }
//
//    /**
//     * Get all courts (Provincial Admin only)
//     */
//    @GetMapping
//    @PreAuthorize("hasAnyRole('PROVINCIAL_ADMIN', 'DISTRICT_ADMIN')")
//    public ResponseEntity<List<Court>> getAllCourts() {
//        List<Court> courts = courtService.getAllCourts();
//        return ResponseEntity.ok(courts);
//    }
//
//    /**
//     * Get courts by district
//     */
//    @GetMapping("/district/{districtId}")
//    @PreAuthorize("hasAnyRole('PROVINCIAL_ADMIN', 'DISTRICT_ADMIN')")
//    public ResponseEntity<List<Court>> getCourtsByDistrict(@PathVariable String districtId) {
//        List<Court> courts = courtService.getCourtsByDistrict(districtId);
//        return ResponseEntity.ok(courts);
//    }
//
//    /**
//     * Get court by ID
//     */
//    @GetMapping("/{courtId}")
//    @PreAuthorize("hasAnyRole('PROVINCIAL_ADMIN', 'DISTRICT_ADMIN')")
//    public ResponseEntity<?> getCourtById(@PathVariable String courtId) {
//        try {
//            Court court = courtService.getCourtById(courtId);
//            return ResponseEntity.ok(court);
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.NOT_FOUND)
//                    .body(new ErrorResponse(e.getMessage()));
//        }
//    }
//
//    // Helper classes for responses
//    static class ErrorResponse {
//        private String message;
//
//        public ErrorResponse(String message) {
//            this.message = message;
//        }
//
//        public String getMessage() {
//            return message;
//        }
//
//        public void setMessage(String message) {
//            this.message = message;
//        }
//    }
//
//    static class SuccessResponse {
//        private String message;
//
//        public SuccessResponse(String message) {
//            this.message = message;
//        }
//
//        public String getMessage() {
//            return message;
//        }
//
//        public void setMessage(String message) {
//            this.message = message;
//        }
//    }
//}




import com.CooperativeDevelopmentManagementSystem.DCDSystem.model.Court;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.service.CourtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/courts")
@RequiredArgsConstructor
public class CourtController {

    private final CourtService courtService;

    /**
     * Create a new court (District Admin only)
     */
    @PostMapping
    @PreAuthorize("hasAuthority('DISTRICT_ADMIN') or hasAuthority('PROVINCIAL_ADMIN')")
    public ResponseEntity<?> createCourt(@Valid @RequestBody Court court) {
        try {
            Court createdCourt = courtService.createCourt(court);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdCourt);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Update court (District Admin only)
     */
    @PutMapping("/{courtId}")
    @PreAuthorize("hasAuthority('DISTRICT_ADMIN') or hasAuthority('PROVINCIAL_ADMIN')")
    public ResponseEntity<?> updateCourt(@PathVariable String courtId, @Valid @RequestBody Court court) {
        try {
            Court updatedCourt = courtService.updateCourt(courtId, court);
            return ResponseEntity.ok(updatedCourt);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Delete court (District Admin only)
     */
    @DeleteMapping("/{courtId}")
    @PreAuthorize("hasAuthority('DISTRICT_ADMIN') or hasAuthority('PROVINCIAL_ADMIN')")
    public ResponseEntity<?> deleteCourt(@PathVariable String courtId) {
        try {
            courtService.deleteCourt(courtId);
            return ResponseEntity.ok(new SuccessResponse("Court deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Get all courts
     */
    @GetMapping
    public ResponseEntity<List<Court>> getAllCourts() {
        List<Court> courts = courtService.getAllCourts();
        return ResponseEntity.ok(courts);
    }

    /**
     * Get courts by district
     */
    @GetMapping("/district/{districtId}")
    public ResponseEntity<List<Court>> getCourtsByDistrict(@PathVariable String districtId) {
        List<Court> courts = courtService.getCourtsByDistrict(districtId);
        return ResponseEntity.ok(courts);
    }

    /**
     * Get court by ID
     */
    @GetMapping("/{courtId}")
    public ResponseEntity<?> getCourtById(@PathVariable String courtId) {
        try {
            Court court = courtService.getCourtById(courtId);
            return ResponseEntity.ok(court);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    // Helper classes for responses
    static class ErrorResponse {
        private String message;

        public ErrorResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }

    static class SuccessResponse {
        private String message;

        public SuccessResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}
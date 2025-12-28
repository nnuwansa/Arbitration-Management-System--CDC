package com.CooperativeDevelopmentManagementSystem.DCDSystem.controller;

import com.CooperativeDevelopmentManagementSystem.DCDSystem.model.ArbitrationOfficer;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.model.Borrower;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.model.District;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.model.Submission;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import javax.swing.*;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.math.BigDecimal;
import java.time.LocalDate;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;

    // SOCIETY_ADMIN creates submissions and sends to Society Approval
    @PostMapping
    @PreAuthorize("hasAuthority('SOCIETY_ADMIN')")
    public ResponseEntity<Submission> createSubmission(@RequestBody Submission submission, Authentication authentication) {
        String userEmail = authentication.getName();
        Submission created = submissionService.createSubmission(submission, userEmail);
        return ResponseEntity.ok(created);
    }

    // SOCIETY_APPROVAL approves submissions (sends to District Office)
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAuthority('SOCIETY_APPROVAL')")
    public ResponseEntity<Submission> approveSubmission(@PathVariable String id, Authentication authentication) {
        String userEmail = authentication.getName();
        Submission approved = submissionService.approveSubmission(id, userEmail);
        return ResponseEntity.ok(approved);
    }

    // SOCIETY_APPROVAL rejects submissions
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAuthority('SOCIETY_APPROVAL')")
    public ResponseEntity<Submission> rejectSubmission(
            @PathVariable String id,
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        String userEmail = authentication.getName();
        String reason = request.getOrDefault("reason", "No reason provided");
        Submission rejected = submissionService.rejectSubmission(id, userEmail, reason);
        return ResponseEntity.ok(rejected);
    }


    // Both SOCIETY_ADMIN and SOCIETY_APPROVAL can view all submissions
    @GetMapping("/society/{societyId}")
    @PreAuthorize("hasAuthority('SOCIETY_ADMIN') or hasAuthority('SOCIETY_APPROVAL')")
    public ResponseEntity<List<Submission>> getSubmissionsBySociety(@PathVariable String societyId) {
        return ResponseEntity.ok(submissionService.getSubmissionsBySociety(societyId));
    }



    // Both SOCIETY_ADMIN and SOCIETY_APPROVAL can view  pending approvals
    @GetMapping("/society/{societyId}/pending")
    @PreAuthorize("hasAuthority('SOCIETY_ADMIN') or hasAuthority('SOCIETY_APPROVAL')")
    public ResponseEntity<List<Submission>> getPendingApprovalsBySociety(@PathVariable String societyId) {
        return ResponseEntity.ok(submissionService.getPendingApprovalsBySociety(societyId));
    }

    // Both can view approved submissions (to see what was sent to district)
    @GetMapping("/society/{societyId}/approved")
    @PreAuthorize("hasAuthority('SOCIETY_ADMIN') or hasAuthority('SOCIETY_APPROVAL')")
    public ResponseEntity<List<Submission>> getApprovedSubmissionsBySociety(@PathVariable String societyId) {
        return ResponseEntity.ok(submissionService.getApprovedSubmissionsBySociety(societyId));
    }

    // District/Provincial Admin views district submissions
    @GetMapping("/district/{districtId}")
    @PreAuthorize("hasAuthority('DISTRICT_ADMIN') or hasAuthority('PROVINCIAL_ADMIN')")
    public ResponseEntity<List<Submission>> getSubmissionsByDistrict(@PathVariable String districtId) {
        return ResponseEntity.ok(submissionService.getSubmissionsByDistrict(districtId));
    }

    // District/Provincial Admin views approved submissions (received from societies)
    @GetMapping("/district/{districtId}/approved")
    @PreAuthorize("hasAuthority('DISTRICT_ADMIN') or hasAuthority('PROVINCIAL_ADMIN')")
    public ResponseEntity<List<Submission>> getApprovedSubmissionsByDistrict(@PathVariable String districtId) {
        return ResponseEntity.ok(submissionService.getApprovedSubmissionsByDistrict(districtId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Submission> getSubmissionById(@PathVariable String id) {
        return ResponseEntity.ok(submissionService.getSubmissionById(id));
    }


    // ADD THESE NEW ENDPOINTS TO SubmissionController

    // NEW: Officer gets their assigned submissions
    @GetMapping("/officer/my-submissions")
    @PreAuthorize("hasAuthority('OFFICER')")
    public ResponseEntity<List<Submission>> getOfficerAssignedSubmissions(Authentication authentication) {
        String userEmail = authentication.getName();
        return ResponseEntity.ok(submissionService.getSubmissionsAssignedToOfficer(userEmail));
    }

    // NEW: Officer gets their assigned borrowers (detailed view)
    @GetMapping("/officer/my-borrowers")
    @PreAuthorize("hasAuthority('OFFICER')")
    public ResponseEntity<List<Map<String, Object>>> getOfficerAssignedBorrowers(Authentication authentication) {
        String userEmail = authentication.getName();
        return ResponseEntity.ok(submissionService.getBorrowersAssignedToOfficer(userEmail));
    }



    // ⭐ Batch endpoint - MUST have @PreAuthorize
    @PutMapping("/{submissionId}/borrowers/batch-arbitration-fee")
    @PreAuthorize("hasAuthority('DISTRICT_ADMIN') or hasAuthority('PROVINCIAL_ADMIN')")
    public ResponseEntity<Submission> updateMultipleArbitrationFees(
            @PathVariable String submissionId,
            @RequestBody List<String> borrowerIds) {

        System.out.println("🔍 Batch update called for " + borrowerIds.size() + " borrowers");

        Submission updated = submissionService.updateMultipleArbitrationFees(submissionId, borrowerIds);
        return ResponseEntity.ok(updated);
    }

    // ⭐ Single endpoint - MUST have @PreAuthorize
    @PutMapping("/{submissionId}/borrowers/{borrowerId}/arbitration-fee")
    @PreAuthorize("hasAuthority('DISTRICT_ADMIN') or hasAuthority('PROVINCIAL_ADMIN')")
    public ResponseEntity<Submission> updateArbitrationFee(
            @PathVariable String submissionId,
            @PathVariable String borrowerId,
            @RequestBody Map<String, Boolean> payload) {

        boolean isPaid = payload.get("isPaid");

        System.out.println("🔍 Single update called for borrower: " + borrowerId);

        Submission updated = submissionService.updateArbitrationFee(submissionId, borrowerId, isPaid);
        return ResponseEntity.ok(updated);
    }

    // ADD THESE ENDPOINTS TO YOUR EXISTING SubmissionController.java

    // ⭐ Society updates payment status after decision
    @PutMapping("/{submissionId}/borrowers/{borrowerId}/payment-status")
    @PreAuthorize("hasAuthority('SOCIETY_ADMIN') or hasAuthority('SOCIETY_APPROVAL')")
    public ResponseEntity<Submission> updatePaymentStatus(
            @PathVariable String submissionId,
            @PathVariable String borrowerId,
            @RequestBody Map<String, Boolean> request,
            Authentication authentication) {
        String userEmail = authentication.getName();
        boolean isPaid = request.getOrDefault("isPaid", false);

        Submission updated = submissionService.updatePaymentStatusAfterDecision(
                submissionId, borrowerId, isPaid, userEmail
        );
        return ResponseEntity.ok(updated);
    }

    // ⭐ Society gets unpaid borrowers after decision
    @GetMapping("/society/{societyId}/unpaid-after-decision")
    @PreAuthorize("hasAuthority('SOCIETY_ADMIN') or hasAuthority('SOCIETY_APPROVAL')")
    public ResponseEntity<List<Map<String, Object>>> getUnpaidBorrowersAfterDecision(
            @PathVariable String societyId) {
        return ResponseEntity.ok(submissionService.getUnpaidBorrowersAfterDecision(societyId));
    }

    // ⭐ District office gets payment-pending cases
    @GetMapping("/district/{districtId}/payment-pending")
    @PreAuthorize("hasAuthority('DISTRICT_ADMIN') or hasAuthority('PROVINCIAL_ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getPaymentPendingCases(
            @PathVariable String districtId) {
        return ResponseEntity.ok(submissionService.getPaymentPendingCases(districtId));
    }

    // ⭐ District admin assigns legal officer to borrower
    @PutMapping("/{submissionId}/borrowers/{borrowerId}/assign-legal-officer")
    @PreAuthorize("hasAuthority('DISTRICT_ADMIN') or hasAuthority('PROVINCIAL_ADMIN')")
    public ResponseEntity<Submission> assignLegalOfficer(
            @PathVariable String submissionId,
            @PathVariable String borrowerId,
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        String userEmail = authentication.getName();
        String legalOfficerId = request.get("legalOfficerId");
        String courtId = request.get("courtId");

        Submission updated = submissionService.assignLegalOfficerToBorrower(
                submissionId, borrowerId, legalOfficerId, courtId, userEmail
        );
        return ResponseEntity.ok(updated);
    }

    // ⭐ Batch assign legal officer
    @PostMapping("/batch-assign-legal-officer")
    @PreAuthorize("hasAuthority('DISTRICT_ADMIN') or hasAuthority('PROVINCIAL_ADMIN')")
    public ResponseEntity<Map<String, Object>> batchAssignLegalOfficer(
            @RequestBody List<Map<String, String>> assignments,
            Authentication authentication) {
        String userEmail = authentication.getName();
        return ResponseEntity.ok(submissionService.batchAssignLegalOfficer(assignments, userEmail));
    }

    // ⭐ Legal officer adds judgment
    @PutMapping("/{submissionId}/borrowers/{borrowerId}/judgment")
    @PreAuthorize("hasAuthority('LEGAL_OFFICER')")
    public ResponseEntity<Submission> addJudgment(
            @PathVariable String submissionId,
            @PathVariable String borrowerId,
            @RequestBody Borrower judgmentData,
            Authentication authentication) {
        String userEmail = authentication.getName();

        Submission updated = submissionService.addJudgment(
                submissionId, borrowerId, judgmentData, userEmail
        );
        return ResponseEntity.ok(updated);
    }

    // ⭐ Legal officer gets assigned cases
    @GetMapping("/legal-officer/my-cases")
    @PreAuthorize("hasAuthority('LEGAL_OFFICER')")
    public ResponseEntity<List<Map<String, Object>>> getLegalOfficerCases(
            Authentication authentication) {
        String userEmail = authentication.getName();
        return ResponseEntity.ok(submissionService.getLegalOfficerAssignedCases(userEmail));
    }


    //

    // ⭐ NEW: Society Admin submits unpaid cases to approval
    @PostMapping("/submit-unpaid-to-approval")
    @PreAuthorize("hasAuthority('SOCIETY_ADMIN')")
    public ResponseEntity<Map<String, Object>> submitUnpaidCasesToApproval(
            @RequestBody List<Map<String, String>> cases,
            Authentication authentication) {
        String userEmail = authentication.getName();
        return ResponseEntity.ok(submissionService.submitUnpaidCasesToApproval(cases, userEmail));
    }

    // ⭐ NEW: Society Approval Officer gets unpaid cases pending approval
    @GetMapping("/society/{societyId}/unpaid-pending-approval")
    @PreAuthorize("hasAuthority('SOCIETY_APPROVAL')")
    public ResponseEntity<List<Map<String, Object>>> getUnpaidCasesPendingApproval(
            @PathVariable String societyId) {
        return ResponseEntity.ok(submissionService.getUnpaidCasesPendingApproval(societyId));
    }

    // ⭐ NEW: Society Approval Officer approves unpaid cases and sends to district
    @PostMapping("/approve-unpaid-and-send-to-district")
    @PreAuthorize("hasAuthority('SOCIETY_APPROVAL')")
    public ResponseEntity<Map<String, Object>> approveUnpaidCasesAndSendToDistrict(
            @RequestBody List<Map<String, String>> cases,
            Authentication authentication) {
        String userEmail = authentication.getName();
        return ResponseEntity.ok(submissionService.approveUnpaidCasesAndSendToDistrict(cases, userEmail));
    }




    // ⭐ Add a court payment (can be called multiple times)
    @PostMapping("/{submissionId}/borrowers/{borrowerId}/court-payment")
    @PreAuthorize("hasAuthority('LEGAL_OFFICER')")
    public ResponseEntity<Submission> addCourtPayment(
            @PathVariable String submissionId,
            @PathVariable String borrowerId,
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        String userEmail = authentication.getName();

        BigDecimal amount = new BigDecimal(request.get("amount").toString());
        LocalDate paymentDate = request.get("paymentDate") != null
                ? LocalDate.parse(request.get("paymentDate").toString())
                : LocalDate.now();

        Submission updated = submissionService.addCourtPayment(
                submissionId, borrowerId, amount, paymentDate, userEmail
        );
        return ResponseEntity.ok(updated);
    }

    // ⭐ Delete a court payment
    @DeleteMapping("/{submissionId}/borrowers/{borrowerId}/court-payment/{paymentId}")
    @PreAuthorize("hasAuthority('LEGAL_OFFICER')")
    public ResponseEntity<Submission> deleteCourtPayment(
            @PathVariable String submissionId,
            @PathVariable String borrowerId,
            @PathVariable String paymentId,
            Authentication authentication) {
        String userEmail = authentication.getName();
        Submission updated = submissionService.deleteCourtPayment(
                submissionId, borrowerId, paymentId, userEmail
        );
        return ResponseEntity.ok(updated);
    }

    // ⭐ Legal officer adds/updates special remarks (UNCHANGED)
    @PutMapping("/{submissionId}/borrowers/{borrowerId}/remarks")
    @PreAuthorize("hasAuthority('LEGAL_OFFICER')")
    public ResponseEntity<Submission> updateLegalRemarks(
            @PathVariable String submissionId,
            @PathVariable String borrowerId,
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        String userEmail = authentication.getName();
        String remarks = request.get("remarks");
        Submission updated = submissionService.updateLegalRemarks(
                submissionId, borrowerId, remarks, userEmail
        );
        return ResponseEntity.ok(updated);
    }

    // ⭐ Society gets cases with court decisions
    @GetMapping("/society/{societyId}/court-decisions")
    @PreAuthorize("hasAuthority('SOCIETY_ADMIN') or hasAuthority('SOCIETY_APPROVAL')")
    public ResponseEntity<List<Map<String, Object>>> getCasesWithCourtDecisions(
            @PathVariable String societyId) {
        return ResponseEntity.ok(submissionService.getCasesWithCourtDecisions(societyId));
    }

    // ⭐ District gets cases with court decisions
    @GetMapping("/district/{districtId}/court-decisions")
    @PreAuthorize("hasAuthority('DISTRICT_ADMIN') or hasAuthority('PROVINCIAL_ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getDistrictCourtDecisions(
            @PathVariable String districtId) {
        return ResponseEntity.ok(submissionService.getDistrictCourtDecisions(districtId));
    }

    // ⭐ Provincial admin gets all court decisions
    @GetMapping("/provincial/court-decisions")
    @PreAuthorize("hasAuthority('PROVINCIAL_ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getProvincialCourtDecisions() {
        return ResponseEntity.ok(submissionService.getAllCourtDecisions());
    }



    ////////////////**********
    // ⭐ NEW: Check document deficiencies
//    @PutMapping("/{submissionId}/borrowers/{borrowerId}/check-deficiencies")
//    @PreAuthorize("hasAuthority('DISTRICT_ADMIN') or hasAuthority('PROVINCIAL_ADMIN')")
//    public ResponseEntity<Submission> checkDocumentDeficiencies(
//            @PathVariable String submissionId,
//            @PathVariable String borrowerId,
//            @RequestBody Map<String, String> request,
//            Authentication authentication) {
//        String userEmail = authentication.getName();
//        String deficiencies = request.get("deficiencies");
//
//        Submission updated = submissionService.checkAndMarkDeficiencies(
//                submissionId, borrowerId, deficiencies, userEmail
//        );
//        return ResponseEntity.ok(updated);
//    }

    // ⭐ NEW: Mark arbitration fee paid with manual officer selection
    @PutMapping("/{submissionId}/borrowers/{borrowerId}/arbitration-fee-mark")
    @PreAuthorize("hasAuthority('DISTRICT_ADMIN') or hasAuthority('PROVINCIAL_ADMIN')")
    public ResponseEntity<Submission> markArbitrationFeePaid(
            @PathVariable String submissionId,
            @PathVariable String borrowerId,
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        String userEmail = authentication.getName();
        String assignedOfficerId = request.get("assignedOfficerId");

        Submission updated = submissionService.markArbitrationFeePaidWithOfficer(
                submissionId, borrowerId, assignedOfficerId, userEmail
        );
        return ResponseEntity.ok(updated);
    }

    // ⭐ REPLACE: Old arbitration decision endpoint with this updated one
    // Remove: @PutMapping("/{submissionId}/borrowers/{borrowerId}/decision")
    // Add NEW:
//    @PutMapping("/{submissionId}/borrowers/{borrowerId}/arbitration-decision")
//    @PreAuthorize("hasAuthority('OFFICER') or hasAuthority('DISTRICT_ADMIN') or hasAuthority('PROVINCIAL_ADMIN')")
//    public ResponseEntity<Submission> addArbitrationDecision(
//            @PathVariable String submissionId,
//            @PathVariable String borrowerId,
//            @RequestBody Map<String, Object> decisionPayload,
//            Authentication authentication) {
//        String userEmail = authentication.getName();
//
//        Submission updated = submissionService.addDetailedArbitrationDecision(
//                submissionId, borrowerId, decisionPayload, userEmail
//        );
//        return ResponseEntity.ok(updated);
//    }


    /// /
    // ⭐ STEP 1: Check document deficiencies
    @PutMapping("/{submissionId}/borrowers/{borrowerId}/check-deficiencies")
    @PreAuthorize("hasAuthority('DISTRICT_ADMIN') or hasAuthority('PROVINCIAL_ADMIN')")
    public ResponseEntity<Submission> checkDocumentDeficiencies(
            @PathVariable String submissionId,
            @PathVariable String borrowerId,
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        String userEmail = authentication.getName();
        String deficiencies = request.get("deficiencies");

        Submission updated = submissionService.checkAndMarkDeficiencies(
                submissionId, borrowerId, deficiencies, userEmail
        );
        return ResponseEntity.ok(updated);
    }

    // ⭐ STEP 2: Mark arbitration fee paid + Select Officer + Generate Number
//    @PutMapping("/{submissionId}/borrowers/{borrowerId}/mark-fee-and-assign")
//    @PreAuthorize("hasAuthority('DISTRICT_ADMIN') or hasAuthority('PROVINCIAL_ADMIN')")
//    public ResponseEntity<Submission> markFeeAndAssignOfficer(
//            @PathVariable String submissionId,
//            @PathVariable String borrowerId,
//            @RequestBody Map<String, String> request,
//            Authentication authentication) {
//        String userEmail = authentication.getName();
//        String assignedOfficerId = request.get("assignedOfficerId");
//
//        if (assignedOfficerId == null || assignedOfficerId.isEmpty()) {
//            return ResponseEntity.badRequest().build();
//        }
//
//        Submission updated = submissionService.markFeePaidAndAssignOfficer(
//                submissionId, borrowerId, assignedOfficerId, userEmail
//        );
//        return ResponseEntity.ok(updated);
//    }

    // ⭐ STEP 2: Mark arbitration fee paid + Select Officer + Generate Number
    @PutMapping("/{submissionId}/borrowers/{borrowerId}/mark-fee-and-assign")
    @PreAuthorize("hasAuthority('DISTRICT_ADMIN') or hasAuthority('PROVINCIAL_ADMIN')")
    public ResponseEntity<?> markFeeAndAssignOfficer(
            @PathVariable String submissionId,
            @PathVariable String borrowerId,
            @RequestBody Map<String, Object> request,
            Authentication authentication) {

        try {
            String userEmail = authentication.getName();
            String assignedOfficerId = (String) request.get("assignedOfficerId");

            // Validate required fields
            if (assignedOfficerId == null || assignedOfficerId.isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "නිලධාරියා අඩුවී ඇත");
                error.put("data", null);
                return ResponseEntity.badRequest().body(error);
            }

            Submission updated = submissionService.markFeePaidAndAssignOfficer(
                    submissionId, borrowerId, assignedOfficerId, userEmail
            );

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "සාර්ථකයි");
            response.put("data", updated);
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            error.put("data", null);
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "දෝෂය: " + e.getMessage());
            error.put("data", null);
            return ResponseEntity.status(500).body(error);
        }
    }

    // ⭐ STEP 3: Add detailed arbitration decision
    @PutMapping("/{submissionId}/borrowers/{borrowerId}/add-decision")
    @PreAuthorize("hasAuthority('OFFICER') or hasAuthority('DISTRICT_ADMIN') or hasAuthority('PROVINCIAL_ADMIN')")
    public ResponseEntity<Submission> addArbitrationDecision(
            @PathVariable String submissionId,
            @PathVariable String borrowerId,
            @RequestBody Map<String, Object> decisionPayload,
            Authentication authentication) {
        String userEmail = authentication.getName();

        Submission updated = submissionService.addDetailedArbitrationDecision(
                submissionId, borrowerId, decisionPayload, userEmail
        );
        return ResponseEntity.ok(updated);
    }

    // Get officers by district (for dropdown)
    @GetMapping("/officers/district/{districtId}")
    @PreAuthorize("hasAuthority('DISTRICT_ADMIN') or hasAuthority('PROVINCIAL_ADMIN')")
    public ResponseEntity<List<ArbitrationOfficer>> getOfficersByDistrict(
            @PathVariable String districtId) {
        List<ArbitrationOfficer> officers = submissionService.getOfficersByDistrict(districtId);
        return ResponseEntity.ok(officers);
    }


    // Add this to SubmissionController.java

    /**
     * Society submits cases to legal action with required deduction details
     */
    @PostMapping("/submit-to-legal-action")
    @PreAuthorize("hasAuthority('SOCIETY_ADMIN')")
    public ResponseEntity<Map<String, Object>> submitCasesToLegalAction(
            @RequestBody List<Map<String, Object>> cases,
            Authentication authentication) {
        String userEmail = authentication.getName();
        return ResponseEntity.ok(submissionService.submitCasesToLegalAction(cases, userEmail));
    }


    // ⭐ Add multiple judgments
//    @PostMapping("/{submissionId}/borrowers/{borrowerId}/add-judgment")
//    @PreAuthorize("hasAuthority('LEGAL_OFFICER')")
//    public ResponseEntity<Submission> addJudgmentEntry(
//            @PathVariable String submissionId,
//            @PathVariable String borrowerId,
//            @RequestBody Map<String, String> request,
//            Authentication authentication) {
//        String userEmail = authentication.getName();
//
//        LocalDate judgmentDate = LocalDate.parse(request.get("judgmentDate"));
//        String judgmentNumber = request.get("judgmentNumber");
//        String judgmentResult = request.get("judgmentResult");
//
//        Submission updated = submissionService.addJudgmentEntry(
//                submissionId, borrowerId, judgmentDate, judgmentNumber, judgmentResult, userEmail
//        );
//        return ResponseEntity.ok(updated);
//    }

    // ⭐ Add multiple judgments (supports partial data)
    @PostMapping("/{submissionId}/borrowers/{borrowerId}/add-judgment")
    @PreAuthorize("hasAuthority('LEGAL_OFFICER')")
    public ResponseEntity<Submission> addJudgmentEntry(
            @PathVariable String submissionId,
            @PathVariable String borrowerId,
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        String userEmail = authentication.getName();

        // ⭐ CHANGED: Parse date only if provided
        LocalDate judgmentDate = request.get("judgmentDate") != null && !request.get("judgmentDate").isEmpty()
                ? LocalDate.parse(request.get("judgmentDate"))
                : null;

        String judgmentNumber = request.get("judgmentNumber");

        // ⭐ CHANGED: Use empty string if not provided
        String judgmentResult = request.getOrDefault("judgmentResult", "");

        Submission updated = submissionService.addJudgmentEntry(
                submissionId, borrowerId, judgmentDate, judgmentNumber, judgmentResult, userEmail
        );
        return ResponseEntity.ok(updated);
    }
// Add this endpoint to your SubmissionController.java
// Place it after the deleteJudgmentEntry method

    /**
     * Update judgment number for a specific borrower
     * Legal officer can update the judgment number for a case
     */
    @PutMapping("/{submissionId}/borrowers/{borrowerId}/judgment-number")
    @PreAuthorize("hasAuthority('LEGAL_OFFICER')")
    public ResponseEntity<Submission> updateJudgmentNumber(
            @PathVariable String submissionId,
            @PathVariable String borrowerId,
            @RequestBody Map<String, String> request,
            Authentication authentication) {

        String userEmail = authentication.getName();
        String judgmentNumber = request.get("judgmentNumber");

        if (judgmentNumber == null || judgmentNumber.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Submission updated = submissionService.updateJudgmentNumber(
                submissionId,
                borrowerId,
                judgmentNumber.trim(),
                userEmail
        );

        return ResponseEntity.ok(updated);
    }
    // ⭐ Delete judgment entry
    @DeleteMapping("/{submissionId}/borrowers/{borrowerId}/judgments/{judgmentId}")
    @PreAuthorize("hasAuthority('LEGAL_OFFICER')")
    public ResponseEntity<Submission> deleteJudgmentEntry(
            @PathVariable String submissionId,
            @PathVariable String borrowerId,
            @PathVariable String judgmentId,
            Authentication authentication) {
        String userEmail = authentication.getName();
        Submission updated = submissionService.deleteJudgmentEntry(
                submissionId, borrowerId, judgmentId, userEmail
        );
        return ResponseEntity.ok(updated);
    }

    // ⭐ Generate monthly payment report
    @GetMapping("/legal-officer/monthly-payment-report")
    @PreAuthorize("hasAuthority('LEGAL_OFFICER')")
    public ResponseEntity<byte[]> generateMonthlyPaymentReport(
            @RequestParam int year,
            @RequestParam int month,
            Authentication authentication) throws IOException {
        String userEmail = authentication.getName();
        byte[] csvData = submissionService.generateMonthlyPaymentReport(userEmail, year, month);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment",
                String.format("payment-report-%d-%02d.csv", year, month));

        return ResponseEntity.ok()
                .headers(headers)
                .body(csvData);
    }
}


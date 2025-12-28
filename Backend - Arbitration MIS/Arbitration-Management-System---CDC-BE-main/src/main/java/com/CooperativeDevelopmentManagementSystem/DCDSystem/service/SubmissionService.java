package com.CooperativeDevelopmentManagementSystem.DCDSystem.service;

import com.CooperativeDevelopmentManagementSystem.DCDSystem.model.*;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.*;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.time.LocalDateTime;

import java.util.*;

import java.time.LocalDate;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final ArbitrationOfficerService officerService;
    private final ArbitrationOfficerRepository arbitrationOfficerRepository;
    private final DistrictRepository districtRepository;
    private final SocietyRepository societyRepository;
    private final UserRepository userRepository;
    private final EmailService emailService; // ⭐ ADDED
    private final LegalOfficerRepository legalOfficerRepository; // ⭐ ADD THIS
    private final CourtRepository courtRepository; // ⭐ ADD THIS

    public Submission createSubmission(Submission submission, String userEmail) {
        submission.setSubmittedDate(LocalDateTime.now());
        submission.setStatus("pending-approval");
        submission.setSubmittedBy(userEmail);

        // Look up and save society name
        if (submission.getSocietyId() != null && !submission.getSocietyId().isEmpty()) {
            societyRepository.findById(submission.getSocietyId())
                    .ifPresent(society -> submission.setSocietyName(society.getName()));
        }

        // Look up and save district name
        if (submission.getDistrictId() != null && !submission.getDistrictId().isEmpty()) {
            districtRepository.findById(submission.getDistrictId())
                    .ifPresent(district -> submission.setDistrictName(district.getName()));
        }

        submission.getBorrowers().forEach(borrower -> {
            if (borrower.getId() == null) {
                borrower.setId(UUID.randomUUID().toString());
            }
            borrower.setStatus("pending");
            borrower.setArbitrationFeePaid(false);
        });

        Submission savedSubmission = submissionRepository.save(submission);

        // ⭐ SEND EMAIL TO SOCIETY APPROVAL OFFICER
        try {
            // Get submitter's name
            User submitter = userRepository.findByEmail(userEmail).orElse(null);
            String submitterName = submitter != null ? submitter.getName() : userEmail;

            // Find society approval officer
            Society society = societyRepository.findById(submission.getSocietyId()).orElse(null);
            if (society != null && society.getApprovalEmail() != null) {
                User approvalOfficer = userRepository.findByEmail(society.getApprovalEmail()).orElse(null);
                if (approvalOfficer != null) {
                    emailService.sendSubmissionToApprovalNotification(
                            approvalOfficer.getEmail(),
                            approvalOfficer.getName(),
                            savedSubmission,
                            submitterName
                    );
                }
            }
        } catch (Exception e) {
            // Log but don't fail the submission if email fails
            System.err.println("Failed to send approval notification email: " + e.getMessage());
        }

        return savedSubmission;
    }

    @Transactional
    public Submission approveSubmission(String submissionId, String approverEmail) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        if (!"pending-approval".equals(submission.getStatus())) {
            throw new RuntimeException("Submission is not in pending-approval status");
        }

        submission.setStatus("approved");
        submission.setApprovedDate(LocalDateTime.now());
        submission.setApprovedBy(approverEmail);

        Submission savedSubmission = submissionRepository.save(submission);

        // ⭐ SEND EMAIL TO DISTRICT OFFICE
        try {
            // Get approver's name
            User approver = userRepository.findByEmail(approverEmail).orElse(null);
            String approverName = approver != null ? approver.getName() : approverEmail;

            // Find district admin users
            List<User> districtAdmins = userRepository.findAll().stream()
                    .filter(user -> submission.getDistrictId().equals(user.getDistrict()))
                    .filter(user -> user.getRoles().contains(Role.DISTRICT_ADMIN) ||
                            user.getRoles().contains(Role.PROVINCIAL_ADMIN))
                    .collect(Collectors.toList());

            for (User admin : districtAdmins) {
                emailService.sendSubmissionToDistrictNotification(
                        admin.getEmail(),
                        admin.getName(),
                        savedSubmission,
                        approverName
                );
            }
        } catch (Exception e) {
            System.err.println("Failed to send district notification email: " + e.getMessage());
        }

        return savedSubmission;
    }

    public Submission rejectSubmission(String submissionId, String rejectorEmail, String reason) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        submission.setStatus("rejected");
        submission.setRejectedDate(LocalDateTime.now());
        submission.setRejectedBy(rejectorEmail);
        submission.setRejectionReason(reason);

        return submissionRepository.save(submission);
    }





    // ⭐ UPDATE: updateMultipleArbitrationFees method
    @Transactional
    public Submission updateMultipleArbitrationFees(String submissionId, List<String> borrowerIds) {
        System.out.println("========================================");
        System.out.println("🔍 updateMultipleArbitrationFees CALLED");
        System.out.println("🔍 Time: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss")));
        System.out.println("🔍 Submission ID: " + submissionId);
        System.out.println("🔍 Number of borrowers: " + borrowerIds.size());
        System.out.println("========================================");

        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        List<Borrower> newlyAssignedBorrowers = new ArrayList<>();
        ArbitrationOfficer officer = null;

        District district = districtRepository.findById(submission.getDistrictId())
                .orElseThrow(() -> new RuntimeException("District not found"));

        long startingNumber = getNextArbitrationNumber(district.getCode(), submission.getDistrictId());
        int counter = 0;

        // ⭐ Get current timestamp for all assignments
        LocalDateTime assignmentTime = LocalDateTime.now();

        // Process all borrowers
        for (String borrowerId : borrowerIds) {
            Borrower borrower = submission.getBorrowers().stream()
                    .filter(b -> b.getId().equals(borrowerId))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Borrower not found: " + borrowerId));

            // Only process if not already paid
            if (!borrower.getArbitrationFeePaid()) {
                System.out.println("✅ Processing: " + borrower.getBorrowerName());

                int currentYear = LocalDate.now().getYear();
                String arbitrationNumber = String.format("CDC/%s/%d/%04d",
                        district.getCode(),
                        currentYear,
                        startingNumber + counter);
                counter++;

                if (officer == null) {
                    officer = getOrAssignOfficerForSubmission(submission);
                    System.out.println("✅ Officer assigned: " + officer.getName());
                }

                borrower.setArbitrationFeePaid(true);
                borrower.setArbitrationNumber(arbitrationNumber);
                borrower.setAssignedOfficerId(officer.getId());
                borrower.setAssignedOfficerName(officer.getName());
                borrower.setAssignedDate(assignmentTime); // ⭐ NEW: Set assigned date
                borrower.setStatus("assigned");

                newlyAssignedBorrowers.add(borrower);

                System.out.println("✅ Arbitration Number: " + arbitrationNumber);
                System.out.println("✅ Assigned Date: " + assignmentTime);
            } else {
                System.out.println("⚠️ Skipping (already paid): " + borrower.getBorrowerName());
            }
        }

        Submission savedSubmission = submissionRepository.save(submission);
        System.out.println("✅ Submission saved with " + newlyAssignedBorrowers.size() + " newly assigned borrowers");

        if (!newlyAssignedBorrowers.isEmpty() && officer != null) {
            System.out.println("📧 Sending emails for " + newlyAssignedBorrowers.size() + " borrowers...");
            sendArbitrationAssignmentEmails(savedSubmission, newlyAssignedBorrowers, officer);
        }

        return savedSubmission;
    }

        private long getNextArbitrationNumber(String districtCode, String districtId) {
        List<Submission> districtSubmissions = submissionRepository.findByDistrictId(districtId);

        long maxNumber = districtSubmissions.stream()
                .flatMap(s -> s.getBorrowers().stream())
                .filter(b -> b.getArbitrationNumber() != null && b.getArbitrationNumber().contains(districtCode))
                .map(b -> {
                    String[] parts = b.getArbitrationNumber().split("/");
                    return parts.length == 4 ? Long.parseLong(parts[3]) : 0L;
                })
                .max(Long::compare)
                .orElse(0L);

        return maxNumber + 1;
    }

    // ⭐ UPDATE: updateArbitrationFee method (single borrower)
    @Transactional
    public Submission updateArbitrationFee(String submissionId, String borrowerId, boolean isPaid) {
        System.out.println("========================================");
        System.out.println("🔍 updateArbitrationFee CALLED (single)");
        System.out.println("🔍 Time: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss")));
        System.out.println("🔍 Submission ID: " + submissionId);
        System.out.println("🔍 Borrower ID: " + borrowerId);
        System.out.println("🔍 isPaid parameter: " + isPaid);

        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        Borrower borrower = submission.getBorrowers().stream()
                .filter(b -> b.getId().equals(borrowerId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Borrower not found"));

        System.out.println("🔍 Borrower Name: " + borrower.getBorrowerName());
        System.out.println("🔍 Current arbitrationFeePaid status: " + borrower.getArbitrationFeePaid());
        System.out.println("========================================");

        if (isPaid && !borrower.getArbitrationFeePaid()) {
            System.out.println("✅ Single borrower being marked as paid");

            District district = districtRepository.findById(submission.getDistrictId())
                    .orElseThrow(() -> new RuntimeException("District not found"));

            String arbitrationNumber = generateArbitrationNumber(district.getCode(), submission.getDistrictId());
            ArbitrationOfficer officer = getOrAssignOfficerForSubmission(submission);

            // ⭐ Get current timestamp
            LocalDateTime assignmentTime = LocalDateTime.now();

            borrower.setArbitrationFeePaid(true);
            borrower.setArbitrationNumber(arbitrationNumber);
            borrower.setAssignedOfficerId(officer.getId());
            borrower.setAssignedOfficerName(officer.getName());
            borrower.setAssignedDate(assignmentTime); // ⭐ NEW: Set assigned date
            borrower.setStatus("assigned");

            Submission savedSubmission = submissionRepository.save(submission);

            List<Borrower> newlyAssignedBorrowers = new ArrayList<>();
            newlyAssignedBorrowers.add(borrower);

            sendArbitrationAssignmentEmails(savedSubmission, newlyAssignedBorrowers, officer);

            return savedSubmission;
        } else if (!isPaid && borrower.getArbitrationFeePaid()) {
            // Unpaying a borrower - remove assignment
            System.out.println("⚠️ Unmarking borrower as paid");
            borrower.setArbitrationFeePaid(false);
            borrower.setArbitrationNumber(null);
            borrower.setAssignedOfficerId(null);
            borrower.setAssignedOfficerName(null);
            borrower.setAssignedDate(null); // ⭐ NEW: Clear assigned date
            borrower.setStatus("pending");

            return submissionRepository.save(submission);
        } else {
            System.out.println("ℹ️ No change needed");
            return submission;
        }
    }

    // ⭐ UPDATE: getBorrowersAssignedToOfficer to include assignedDate
//    public List<Map<String, Object>> getBorrowersAssignedToOfficer(String userEmail) {
//        User officer = userRepository.findByEmail(userEmail)
//                .orElseThrow(() -> new RuntimeException("Officer not found"));
//
//        if (officer.getOfficerId() == null) {
//            return new ArrayList<>();
//        }
//
//        List<Submission> allSubmissions = submissionRepository.findAll();
//        List<Map<String, Object>> assignedBorrowers = new ArrayList<>();
//
//        for (Submission submission : allSubmissions) {
//            for (Borrower borrower : submission.getBorrowers()) {
//                if (officer.getOfficerId().equals(borrower.getAssignedOfficerId())) {
//                    Map<String, Object> borrowerInfo = new HashMap<>();
//                    borrowerInfo.put("submissionId", submission.getId());
//                    borrowerInfo.put("borrowerId", borrower.getId());
//                    borrowerInfo.put("borrowerName", borrower.getBorrowerName());
//                    borrowerInfo.put("loanNumber", borrower.getLoanNumber());
//                    borrowerInfo.put("loanAmount", borrower.getLoanAmount());
//                    borrowerInfo.put("interest", borrower.getInterest());
//                    borrowerInfo.put("interestRate", borrower.getInterestRate());
//                    borrowerInfo.put("arbitrationNumber", borrower.getArbitrationNumber());
//                    borrowerInfo.put("status", borrower.getStatus());
//                    borrowerInfo.put("arbitrationFeePaid", borrower.getArbitrationFeePaid());
//                    borrowerInfo.put("borrowerAddress", borrower.getBorrowerAddress());
//                    borrowerInfo.put("membershipNo", borrower.getMembershipNo());
//                    borrowerInfo.put("guarantor1Name", borrower.getGuarantor1Name());
//                    borrowerInfo.put("guarantor2Name", borrower.getGuarantor2Name());
//                    borrowerInfo.put("assignedOfficerName", borrower.getAssignedOfficerName());
//                    borrowerInfo.put("assignedDate", borrower.getAssignedDate()); // ⭐ NEW: Include assigned date
//                    borrowerInfo.put("decisionDate", borrower.getDecisionDate());
//                    borrowerInfo.put("finalLoanAmount", borrower.getFinalLoanAmount());
//                    borrowerInfo.put("interestDeducted", borrower.getInterestDeducted());
//                    borrowerInfo.put("arbitrationDecision", borrower.getArbitrationDecision());
//                    borrowerInfo.put("districtId", submission.getDistrictId());
//                    borrowerInfo.put("districtName", submission.getDistrictName());
//                    borrowerInfo.put("societyId", submission.getSocietyId());
//                    borrowerInfo.put("societyName", submission.getSocietyName());
//                    borrowerInfo.put("submittedDate", submission.getSubmittedDate());
//
//                    assignedBorrowers.add(borrowerInfo);
//                }
//            }
//        }
//
//        return assignedBorrowers;
//    }
    public List<Map<String, Object>> getBorrowersAssignedToOfficer(String userEmail) {
        User officer = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Officer not found"));

        if (officer.getOfficerId() == null) {
            return new ArrayList<>();
        }

        List<Submission> allSubmissions = submissionRepository.findAll();
        List<Map<String, Object>> assignedBorrowers = new ArrayList<>();

        for (Submission submission : allSubmissions) {
            for (Borrower borrower : submission.getBorrowers()) {
                if (officer.getOfficerId().equals(borrower.getAssignedOfficerId())) {
                    Map<String, Object> borrowerInfo = new HashMap<>();
                    borrowerInfo.put("submissionId", submission.getId());
                    borrowerInfo.put("borrowerId", borrower.getId());
                    borrowerInfo.put("borrowerName", borrower.getBorrowerName());
                    borrowerInfo.put("borrowerNIC", borrower.getBorrowerNIC()); // ⭐ ADD THIS
                    borrowerInfo.put("loanType", borrower.getLoanType()); // ⭐ ADD THIS
                    borrowerInfo.put("loanNumber", borrower.getLoanNumber());
                    borrowerInfo.put("loanAmount", borrower.getLoanAmount());
                    borrowerInfo.put("outstandingLoanAmount", borrower.getOutstandingLoanAmount()); // ⭐ ADD THIS - NEW FIELD
                    borrowerInfo.put("interest", borrower.getInterest());
                    borrowerInfo.put("interestRate", borrower.getInterestRate());
                    borrowerInfo.put("arbitrationNumber", borrower.getArbitrationNumber());
                    borrowerInfo.put("status", borrower.getStatus());
                    borrowerInfo.put("arbitrationFeePaid", borrower.getArbitrationFeePaid());
                    borrowerInfo.put("borrowerAddress", borrower.getBorrowerAddress());
                    borrowerInfo.put("membershipNo", borrower.getMembershipNo());
                    borrowerInfo.put("guarantor1Name", borrower.getGuarantor1Name());
                    borrowerInfo.put("guarantor1NIC", borrower.getGuarantor1NIC()); // ⭐ ADD THIS
                    borrowerInfo.put("guarantor2Name", borrower.getGuarantor2Name());
                    borrowerInfo.put("guarantor2NIC", borrower.getGuarantor2NIC()); // ⭐ ADD THIS
                    borrowerInfo.put("assignedOfficerName", borrower.getAssignedOfficerName());
                    borrowerInfo.put("assignedDate", borrower.getAssignedDate());
                    borrowerInfo.put("decisionDate", borrower.getDecisionDate());

                    borrowerInfo.put("arbitrationDecision", borrower.getArbitrationDecision());
                    borrowerInfo.put("districtId", submission.getDistrictId());
                    borrowerInfo.put("districtName", submission.getDistrictName());
                    borrowerInfo.put("societyId", submission.getSocietyId());
                    borrowerInfo.put("societyName", submission.getSocietyName());
                    borrowerInfo.put("submittedDate", submission.getSubmittedDate());

                    assignedBorrowers.add(borrowerInfo);
                }
            }
        }

        return assignedBorrowers;
    }

    // ⭐ Email sending method (same as before)
    private void sendArbitrationAssignmentEmails(Submission submission,
                                                 List<Borrower> processedBorrowers,
                                                 ArbitrationOfficer officer) {
        try {
            LocalDateTime assignmentTime = LocalDateTime.now();

            System.out.println("📧 ========== EMAIL SENDING STARTED ==========");
            System.out.println("📧 Number of borrowers in this email: " + processedBorrowers.size());

            // 1. EMAIL TO SOCIETY (both admin and approval)
            Society society = societyRepository.findById(submission.getSocietyId()).orElse(null);
            if (society != null) {
                // Send to admin
                if (society.getAdminEmail() != null && !society.getAdminEmail().isEmpty()) {
                    User admin = userRepository.findByEmail(society.getAdminEmail()).orElse(null);
                    if (admin != null) {
                        System.out.println("📧 Sending to Society Admin: " + admin.getEmail());
                        emailService.sendArbitrationAssignmentNotification(
                                admin.getEmail(),
                                admin.getName(),
                                submission,
                                processedBorrowers,
                                officer.getName()
                        );
                    }
                }

                // Send to approval officer (if different)
                if (society.getApprovalEmail() != null &&
                        !society.getApprovalEmail().isEmpty() &&
                        !society.getApprovalEmail().equals(society.getAdminEmail())) {
                    User approval = userRepository.findByEmail(society.getApprovalEmail()).orElse(null);
                    if (approval != null) {
                        System.out.println("📧 Sending to Society Approval: " + approval.getEmail());
                        emailService.sendArbitrationAssignmentNotification(
                                approval.getEmail(),
                                approval.getName(),
                                submission,
                                processedBorrowers,
                                officer.getName()
                        );
                    }
                }
            }

            // 2. EMAIL TO ARBITRATION OFFICER
            if (officer.getUserEmail() != null && !officer.getUserEmail().isEmpty()) {
                User officerUser = userRepository.findByEmail(officer.getUserEmail()).orElse(null);
                if (officerUser != null) {
                    System.out.println("📧 Sending to Arbitration Officer: " + officerUser.getEmail());

                    List<Map<String, Object>> newlyAssignedBorrowers = getNewlyAssignedBorrowersFromSubmission(
                            submission,
                            processedBorrowers
                    );

                    if (!newlyAssignedBorrowers.isEmpty()) {
                        emailService.sendOfficerAssignmentNotification(
                                officerUser.getEmail(),
                                officerUser.getName(),
                                newlyAssignedBorrowers,
                                assignmentTime
                        );
                        System.out.println("✅ Email sent to officer with " + newlyAssignedBorrowers.size() + " cases");
                    }
                }
            }

            System.out.println("📧 ========== EMAIL SENDING COMPLETED ==========");

        } catch (Exception e) {
            System.err.println("❌ Failed to send emails: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private List<Map<String, Object>> getNewlyAssignedBorrowersFromSubmission(
            Submission submission,
            List<Borrower> processedBorrowers) {

        List<Map<String, Object>> borrowers = new ArrayList<>();

        for (Borrower borrower : processedBorrowers) {
            Map<String, Object> borrowerInfo = new HashMap<>();
            borrowerInfo.put("submissionId", submission.getId());
            borrowerInfo.put("borrowerId", borrower.getId());
            borrowerInfo.put("borrowerName", borrower.getBorrowerName());
            borrowerInfo.put("loanNumber", borrower.getLoanNumber());
            borrowerInfo.put("loanAmount", borrower.getLoanAmount());
            borrowerInfo.put("arbitrationNumber", borrower.getArbitrationNumber());
            borrowerInfo.put("status", borrower.getStatus());
            borrowerInfo.put("societyName", submission.getSocietyName());
            borrowerInfo.put("districtName", submission.getDistrictName());
            borrowers.add(borrowerInfo);
        }

        return borrowers;
    }
    // ⭐ KEEP this method for other purposes, but don't use it for email notifications
    private List<Map<String, Object>> getBorrowersForOfficer(String officerId) {
        List<Submission> allSubmissions = submissionRepository.findAll();
        List<Map<String, Object>> borrowers = new ArrayList<>();

        for (Submission submission : allSubmissions) {
            for (Borrower borrower : submission.getBorrowers()) {
                if (officerId.equals(borrower.getAssignedOfficerId())) {
                    Map<String, Object> borrowerInfo = new HashMap<>();
                    borrowerInfo.put("submissionId", submission.getId());
                    borrowerInfo.put("borrowerId", borrower.getId());
                    borrowerInfo.put("borrowerName", borrower.getBorrowerName());
                    borrowerInfo.put("loanNumber", borrower.getLoanNumber());
                    borrowerInfo.put("loanAmount", borrower.getLoanAmount());
                    borrowerInfo.put("arbitrationNumber", borrower.getArbitrationNumber());
                    borrowerInfo.put("status", borrower.getStatus());
                    borrowerInfo.put("societyName", submission.getSocietyName());
                    borrowerInfo.put("districtName", submission.getDistrictName());
                    borrowers.add(borrowerInfo);
                }
            }
        }

        return borrowers;
    }

    private ArbitrationOfficer getOrAssignOfficerForSubmission(Submission submission) {
        for (Borrower borrower : submission.getBorrowers()) {
            if (borrower.getAssignedOfficerId() != null) {
                return arbitrationOfficerRepository.findById(borrower.getAssignedOfficerId())
                        .orElseThrow(() -> new RuntimeException("Assigned officer not found"));
            }
        }

        ArbitrationOfficer officer = officerService.getAvailableOfficerOrReassign(submission.getDistrictId());
        officerService.assignOfficerToSociety(officer.getId(), submission.getSocietyId());

        return officer;
    }


    @Transactional
    public Submission addArbitrationDecision(String submissionId, String borrowerId,
                                             Borrower decisionData, String userEmail) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        Borrower borrower = submission.getBorrowers().stream()
                .filter(b -> b.getId().equals(borrowerId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Borrower not found"));

        User officer = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Officer not found"));

        if (officer.getOfficerId() == null ||
                !officer.getOfficerId().equals(borrower.getAssignedOfficerId())) {
            throw new RuntimeException("You are not authorized to add decision for this borrower. " +
                    "Only the assigned arbitration officer can add decisions.");
        }

        if (!"assigned".equals(borrower.getStatus())) {
            throw new RuntimeException("Cannot add decision. Borrower must be in 'assigned' status.");
        }

        borrower.setDecisionDate(decisionData.getDecisionDate());

        borrower.setArbitrationDecision(decisionData.getArbitrationDecision());
        borrower.setStatus("decision-given");
        borrower.setDecisionAddedBy(userEmail);
        borrower.setDecisionAddedAt(LocalDateTime.now());

        Submission savedSubmission = submissionRepository.save(submission);

        // ⭐ SEND EMAILS TO DISTRICT OFFICE AND SOCIETY
        sendDecisionNotificationEmails(savedSubmission, borrower, officer.getName());

        return savedSubmission;
    }

    // ⭐ NEW METHOD: Send decision emails to district and society
    private void sendDecisionNotificationEmails(Submission submission, Borrower borrower, String officerName) {
        try {
            // 1. EMAIL TO DISTRICT OFFICE
            List<User> districtAdmins = userRepository.findAll().stream()
                    .filter(user -> submission.getDistrictId().equals(user.getDistrict()))
                    .filter(user -> user.getRoles().contains(Role.DISTRICT_ADMIN) ||
                            user.getRoles().contains(Role.PROVINCIAL_ADMIN))
                    .collect(Collectors.toList());

            for (User admin : districtAdmins) {
                emailService.sendArbitrationDecisionNotification(
                        admin.getEmail(),
                        admin.getName(),
                        submission,
                        borrower,
                        officerName,
                        true  // isDistrictOffice = true
                );
            }

            // 2. EMAIL TO SOCIETY (both admin and approval officer)
            Society society = societyRepository.findById(submission.getSocietyId()).orElse(null);
            if (society != null) {
                // Send to admin
                if (society.getAdminEmail() != null) {
                    User admin = userRepository.findByEmail(society.getAdminEmail()).orElse(null);
                    if (admin != null) {
                        emailService.sendArbitrationDecisionNotification(
                                admin.getEmail(),
                                admin.getName(),
                                submission,
                                borrower,
                                officerName,
                                false  // isDistrictOffice = false
                        );
                    }
                }

                // Send to approval officer
                if (society.getApprovalEmail() != null &&
                        !society.getApprovalEmail().equals(society.getAdminEmail())) {
                    User approval = userRepository.findByEmail(society.getApprovalEmail()).orElse(null);
                    if (approval != null) {
                        emailService.sendArbitrationDecisionNotification(
                                approval.getEmail(),
                                approval.getName(),
                                submission,
                                borrower,
                                officerName,
                                false  // isDistrictOffice = false
                        );
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to send decision notification emails: " + e.getMessage());
        }
    }

    public List<Submission> getSubmissionsAssignedToOfficer(String userEmail) {
        User officer = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Officer not found"));

        if (officer.getOfficerId() == null) {
            return new ArrayList<>();
        }

        List<Submission> allSubmissions = submissionRepository.findAll();

        return allSubmissions.stream()
                .filter(submission -> submission.getBorrowers().stream()
                        .anyMatch(borrower -> officer.getOfficerId().equals(borrower.getAssignedOfficerId())))
                .collect(Collectors.toList());
    }

//
    public List<Submission> getSubmissionsBySociety(String societyId) {
        return submissionRepository.findBySocietyId(societyId);
    }

    public List<Submission> getPendingApprovalsBySociety(String societyId) {
        return submissionRepository.findBySocietyIdAndStatus(societyId, "pending-approval");
    }

    public List<Submission> getApprovedSubmissionsBySociety(String societyId) {
        return submissionRepository.findBySocietyIdAndStatus(societyId, "approved");
    }

    public List<Submission> getSubmissionsByDistrict(String districtId) {
        return submissionRepository.findByDistrictId(districtId);
    }

    public List<Submission> getApprovedSubmissionsByDistrict(String districtId) {
        return submissionRepository.findByDistrictIdAndStatus(districtId, "approved");
    }

    public Submission getSubmissionById(String id) {
        return submissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Submission not found with id: " + id));
    }

    private String generateArbitrationNumber(String districtCode, String districtId) {
        List<Submission> districtSubmissions = submissionRepository.findByDistrictId(districtId);

        long maxNumber = districtSubmissions.stream()
                .flatMap(s -> s.getBorrowers().stream())
                .filter(b -> b.getArbitrationNumber() != null && b.getArbitrationNumber().contains(districtCode))
                .map(b -> {
                    String[] parts = b.getArbitrationNumber().split("/");
                    return parts.length == 4 ? Long.parseLong(parts[3]) : 0L;
                })
                .max(Long::compare)
                .orElse(0L);

        int currentYear = LocalDate.now().getYear();
        return String.format("CDC/%s/%d/%04d", districtCode, currentYear, maxNumber + 1);
    }


    // ADD THESE METHODS TO YOUR EXISTING SubmissionService.java

    // ⭐ Method 1: Society marks borrower payment status after decision
    @Transactional
    public Submission updatePaymentStatusAfterDecision(String submissionId, String borrowerId,
                                                       boolean isPaid, String userEmail) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        Borrower borrower = submission.getBorrowers().stream()
                .filter(b -> b.getId().equals(borrowerId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Borrower not found"));

        // Verify that decision has been given
        if (!"decision-given".equals(borrower.getStatus())) {
            throw new RuntimeException("Cannot update payment status. Decision must be given first.");
        }

        borrower.setPaymentMadeAfterDecision(isPaid);

        if (isPaid) {
            borrower.setPaymentDate(LocalDate.now());
            borrower.setPaymentConfirmedBy(userEmail);
            borrower.setPaymentConfirmedAt(LocalDateTime.now());
            // Keep status as "decision-given" if paid
        } else {
            borrower.setPaymentDate(null);
            borrower.setPaymentConfirmedBy(null);
            borrower.setPaymentConfirmedAt(null);
            // Mark as payment-pending
            borrower.setStatus("payment-pending");
        }

        return submissionRepository.save(submission);
    }



    /// //***
    /**
     * Get borrowers with unpaid status after decision (for society)
     * Only shows cases not yet submitted to approval
     */
    public List<Map<String, Object>> getUnpaidBorrowersAfterDecision(String societyId) {
        List<Submission> submissions = submissionRepository.findBySocietyId(societyId);
        List<Map<String, Object>> unpaidBorrowers = new ArrayList<>();

        for (Submission submission : submissions) {
            for (Borrower borrower : submission.getBorrowers()) {
                // Show only cases with decision but not paid AND not yet submitted for approval
                if ("decision-given".equals(borrower.getStatus()) &&
                        !Boolean.TRUE.equals(borrower.getPaymentMadeAfterDecision()) &&
                        !Boolean.TRUE.equals(borrower.getSubmittedForApproval())) {

                    Map<String, Object> borrowerInfo = new HashMap<>();
                    borrowerInfo.put("submissionId", submission.getId());
                    borrowerInfo.put("borrowerId", borrower.getId());
                    borrowerInfo.put("borrowerName", borrower.getBorrowerName());
                    borrowerInfo.put("loanNumber", borrower.getLoanNumber());
                    borrowerInfo.put("loanAmount", borrower.getLoanAmount());
                    borrowerInfo.put("interest", borrower.getInterest());
                    borrowerInfo.put("arbitrationNumber", borrower.getArbitrationNumber());
                    borrowerInfo.put("decisionDate", borrower.getDecisionDate());

                    borrowerInfo.put("arbitrationDecision", borrower.getArbitrationDecision());
                    borrowerInfo.put("societyName", submission.getSocietyName());
                    borrowerInfo.put("districtName", submission.getDistrictName());
                    borrowerInfo.put("assignedOfficerName", borrower.getAssignedOfficerName());

                    unpaidBorrowers.add(borrowerInfo);
                }
            }
        }

        return unpaidBorrowers;
    }

    /**
     * Society Admin submits unpaid cases to approval officer
     */
    @Transactional
    public Map<String, Object> submitUnpaidCasesToApproval(List<Map<String, String>> cases, String userEmail) {
        int successCount = 0;
        int failCount = 0;
        List<String> errors = new ArrayList<>();

        LocalDateTime submissionTime = LocalDateTime.now();

        for (Map<String, String> caseData : cases) {
            try {
                String submissionId = caseData.get("submissionId");
                String borrowerId = caseData.get("borrowerId");

                Submission submission = submissionRepository.findById(submissionId)
                        .orElseThrow(() -> new RuntimeException("Submission not found"));

                Borrower borrower = submission.getBorrowers().stream()
                        .filter(b -> b.getId().equals(borrowerId))
                        .findFirst()
                        .orElseThrow(() -> new RuntimeException("Borrower not found"));

                // Verify status - must have decision and not paid
                if (!"decision-given".equals(borrower.getStatus())) {
                    throw new RuntimeException("Invalid status for submission to approval");
                }

                // Mark as submitted for approval
                borrower.setSubmittedForApproval(true);
                borrower.setSubmittedForApprovalDate(submissionTime);
                borrower.setSubmittedForApprovalBy(userEmail);

                submissionRepository.save(submission);
                successCount++;

            } catch (Exception e) {
                failCount++;
                errors.add("Failed for case: " + e.getMessage());
            }
        }

        // Send email notification to approval officer
        try {
            String societyId = cases.get(0).get("societyId");
            if (societyId != null) {
                Society society = societyRepository.findById(societyId).orElse(null);
                if (society != null && society.getApprovalEmail() != null) {
                    User approvalOfficer = userRepository.findByEmail(society.getApprovalEmail()).orElse(null);
                    if (approvalOfficer != null) {
                        emailService.sendUnpaidCasesForApprovalNotification(
                                approvalOfficer.getEmail(),
                                approvalOfficer.getName(),
                                successCount
                        );
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to send approval notification: " + e.getMessage());
        }

        Map<String, Object> result = new HashMap<>();
        result.put("message", "නඩු සාර්ථකව අනුමැතියට යවන ලදී!");
        result.put("successCount", successCount);
        result.put("failCount", failCount);
        result.put("errors", errors);

        return result;
    }

    /**
     * Get unpaid cases pending approval (Society Approval Officer)
     */
    public List<Map<String, Object>> getUnpaidCasesPendingApproval(String societyId) {
        List<Submission> submissions = submissionRepository.findBySocietyId(societyId);
        List<Map<String, Object>> pendingCases = new ArrayList<>();

        for (Submission submission : submissions) {
            for (Borrower borrower : submission.getBorrowers()) {
                // Show cases submitted for approval but not yet approved for district
                if (Boolean.TRUE.equals(borrower.getSubmittedForApproval()) &&
                        !Boolean.TRUE.equals(borrower.getApprovedForDistrict())) {

                    Map<String, Object> caseInfo = new HashMap<>();
                    caseInfo.put("submissionId", submission.getId());
                    caseInfo.put("borrowerId", borrower.getId());
                    caseInfo.put("borrowerName", borrower.getBorrowerName());
                    caseInfo.put("loanNumber", borrower.getLoanNumber());
                    caseInfo.put("loanAmount", borrower.getLoanAmount());
                    caseInfo.put("interest", borrower.getInterest());
                    caseInfo.put("arbitrationNumber", borrower.getArbitrationNumber());
                    caseInfo.put("decisionDate", borrower.getDecisionDate());

                    caseInfo.put("arbitrationDecision", borrower.getArbitrationDecision());
                    caseInfo.put("submittedForApprovalDate", borrower.getSubmittedForApprovalDate());
                    caseInfo.put("societyName", submission.getSocietyName());
                    caseInfo.put("districtName", submission.getDistrictName());
                    caseInfo.put("assignedOfficerName", borrower.getAssignedOfficerName());

                    pendingCases.add(caseInfo);
                }
            }
        }

        return pendingCases;
    }

    /**
     * Approve unpaid cases and send to district (Society Approval Officer)
     */
    @Transactional
    public Map<String, Object> approveUnpaidCasesAndSendToDistrict(List<Map<String, String>> cases, String userEmail) {
        int successCount = 0;
        int failCount = 0;
        List<String> errors = new ArrayList<>();

        LocalDateTime approvalTime = LocalDateTime.now();

        for (Map<String, String> caseData : cases) {
            try {
                String submissionId = caseData.get("submissionId");
                String borrowerId = caseData.get("borrowerId");

                Submission submission = submissionRepository.findById(submissionId)
                        .orElseThrow(() -> new RuntimeException("Submission not found"));

                Borrower borrower = submission.getBorrowers().stream()
                        .filter(b -> b.getId().equals(borrowerId))
                        .findFirst()
                        .orElseThrow(() -> new RuntimeException("Borrower not found"));

                // Verify it was submitted for approval
                if (!Boolean.TRUE.equals(borrower.getSubmittedForApproval())) {
                    throw new RuntimeException("Case was not submitted for approval");
                }

                // Update borrower - approve for district
                borrower.setApprovedForDistrict(true);
                borrower.setApprovedForDistrictDate(approvalTime);
                borrower.setApprovedForDistrictBy(userEmail);
                borrower.setStatus("payment-pending"); // Change status to payment-pending

                submissionRepository.save(submission);
                successCount++;

            } catch (Exception e) {
                failCount++;
                errors.add("Failed for case: " + e.getMessage());
            }
        }

        // Send email notification to district office
        try {
            String districtId = cases.get(0).get("districtId");
            if (districtId != null) {
                List<User> districtAdmins = userRepository.findAll().stream()
                        .filter(user -> districtId.equals(user.getDistrict()))
                        .filter(user -> user.getRoles().contains(Role.DISTRICT_ADMIN) ||
                                user.getRoles().contains(Role.PROVINCIAL_ADMIN))
                        .collect(Collectors.toList());

                for (User admin : districtAdmins) {
                    emailService.sendUnpaidCasesToDistrictNotification(
                            admin.getEmail(),
                            admin.getName(),
                            successCount
                    );
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to send district notification: " + e.getMessage());
        }

        Map<String, Object> result = new HashMap<>();
        result.put("message", "නඩු සාර්ථකව අනුමත කර දිස්ත්‍රික් කාර්යාලයට යවන ලදී!");
        result.put("successCount", successCount);
        result.put("failCount", failCount);
        result.put("errors", errors);

        return result;
    }

    /**
     * Get payment-pending cases for district office
     * Only shows cases approved by society approval officer
     */
    public List<Map<String, Object>> getPaymentPendingCases(String districtId) {
        List<Submission> submissions = submissionRepository.findByDistrictId(districtId);
        List<Map<String, Object>> paymentPendingCases = new ArrayList<>();

        for (Submission submission : submissions) {
            for (Borrower borrower : submission.getBorrowers()) {
                // Only show cases in payment-pending status AND approved for district
                if ("payment-pending".equals(borrower.getStatus()) &&
                        Boolean.TRUE.equals(borrower.getApprovedForDistrict())) {

                    Map<String, Object> caseInfo = new HashMap<>();
                    caseInfo.put("submissionId", submission.getId());
                    caseInfo.put("borrowerId", borrower.getId());
                    caseInfo.put("borrowerName", borrower.getBorrowerName());
                    caseInfo.put("borrowerAddress", borrower.getBorrowerAddress());
                    caseInfo.put("membershipNo", borrower.getMembershipNo());
                    caseInfo.put("loanNumber", borrower.getLoanNumber());
                    caseInfo.put("loanAmount", borrower.getLoanAmount());
                    caseInfo.put("interest", borrower.getInterest());
                    caseInfo.put("arbitrationNumber", borrower.getArbitrationNumber());
                    caseInfo.put("decisionDate", borrower.getDecisionDate());

                    caseInfo.put("arbitrationDecision", borrower.getArbitrationDecision());
                    caseInfo.put("assignedOfficerName", borrower.getAssignedOfficerName());
                    caseInfo.put("societyId", submission.getSocietyId());
                    caseInfo.put("societyName", submission.getSocietyName());
                    caseInfo.put("districtName", submission.getDistrictName());
                    caseInfo.put("guarantor1Name", borrower.getGuarantor1Name());
                    caseInfo.put("guarantor2Name", borrower.getGuarantor2Name());
                    caseInfo.put("approvedForDistrictDate", borrower.getApprovedForDistrictDate());

                    // Legal officer assignment details
                    caseInfo.put("sentToLegalOfficer", borrower.getSentToLegalOfficer());
                    caseInfo.put("legalOfficerId", borrower.getAssignedLegalOfficerId());
                    caseInfo.put("legalOfficerName", borrower.getAssignedLegalOfficerName());
                    caseInfo.put("courtId", borrower.getAssignedCourtId());
                    caseInfo.put("courtName", borrower.getAssignedCourtName());
                    caseInfo.put("assignedDate", borrower.getLegalAssignmentDate());
                    caseInfo.put("judgmentDate", borrower.getJudgmentDate());
                    caseInfo.put("judgmentNumber", borrower.getJudgmentNumber());
                    caseInfo.put("judgmentResult", borrower.getJudgmentResult());

                    paymentPendingCases.add(caseInfo);
                }
            }
        }

        return paymentPendingCases;
    }






    // ⭐ Method 4: Assign legal officer to borrower
    @Transactional
    public Submission assignLegalOfficerToBorrower(String submissionId, String borrowerId,
                                                   String legalOfficerId, String courtId,
                                                   String userEmail) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        Borrower borrower = submission.getBorrowers().stream()
                .filter(b -> b.getId().equals(borrowerId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Borrower not found"));

        // Verify status
        if (!"payment-pending".equals(borrower.getStatus())) {
            throw new RuntimeException("Cannot assign legal officer. Borrower must be in payment-pending status.");
        }

        // Get legal officer details
        LegalOfficer legalOfficer = legalOfficerRepository.findById(legalOfficerId)
                .orElseThrow(() -> new RuntimeException("Legal officer not found"));

        // Get court details
        Court court = courtRepository.findById(courtId)
                .orElseThrow(() -> new RuntimeException("Court not found"));

        // Update borrower with legal case information
        borrower.setSentToLegalOfficer(true);
        borrower.setSentToLegalDate(LocalDateTime.now());
        borrower.setAssignedLegalOfficerId(legalOfficerId);
        borrower.setAssignedLegalOfficerName(legalOfficer.getName());
        borrower.setAssignedCourtId(courtId);
        borrower.setAssignedCourtName(court.getName());
        borrower.setLegalAssignmentDate(LocalDateTime.now());
        borrower.setStatus("legal-case");
        borrower.setApprovedForDistrict(true);

        Submission savedSubmission = submissionRepository.save(submission);

        // Send email notifications
        sendLegalAssignmentNotifications(savedSubmission, borrower, legalOfficer, court);

        return savedSubmission;
    }

    // ⭐ Method 5: Batch assign legal officer to multiple borrowers
    @Transactional
    public Map<String, Object> batchAssignLegalOfficer(List<Map<String, String>> assignments,
                                                       String userEmail) {
        int successCount = 0;
        int failCount = 0;
        List<String> errors = new ArrayList<>();

        for (Map<String, String> assignment : assignments) {
            try {
                assignLegalOfficerToBorrower(
                        assignment.get("submissionId"),
                        assignment.get("borrowerId"),
                        assignment.get("legalOfficerId"),
                        assignment.get("courtId"),
                        userEmail
                );
                successCount++;
            } catch (Exception e) {
                failCount++;
                errors.add("Failed for borrower " + assignment.get("borrowerId") + ": " + e.getMessage());
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("successCount", successCount);
        result.put("failCount", failCount);
        result.put("errors", errors);

        return result;
    }

    // ⭐ Method 6: Legal officer adds judgment
    @Transactional
    public Submission addJudgment(String submissionId, String borrowerId,
                                  Borrower judgmentData, String userEmail) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        Borrower borrower = submission.getBorrowers().stream()
                .filter(b -> b.getId().equals(borrowerId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Borrower not found"));

        // Verify user is the assigned legal officer
        User legalOfficer = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Legal officer not found"));

        if (legalOfficer.getLegalOfficerId() == null ||
                !legalOfficer.getLegalOfficerId().equals(borrower.getAssignedLegalOfficerId())) {
            throw new RuntimeException("You are not authorized to add judgment for this case. " +
                    "Only the assigned legal officer can add judgments.");
        }

        if (!"legal-case".equals(borrower.getStatus())) {
            throw new RuntimeException("Cannot add judgment. Borrower must be in legal-case status.");
        }

        // Update judgment information
        borrower.setJudgmentDate(judgmentData.getJudgmentDate());
        borrower.setJudgmentNumber(judgmentData.getJudgmentNumber());
        borrower.setJudgmentResult(judgmentData.getJudgmentResult());
        borrower.setJudgmentAddedBy(userEmail);
        borrower.setJudgmentAddedAt(LocalDateTime.now());
        // Status remains "legal-case" but now has judgment

        Submission savedSubmission = submissionRepository.save(submission);

        // Send notifications
        sendJudgmentNotifications(savedSubmission, borrower, legalOfficer.getName());

        return savedSubmission;
    }

    // ⭐ Method 7: Get cases assigned to legal officer
//    ?
// ⭐ Method 7: Get cases assigned to legal officer
//    public List<Map<String, Object>> getLegalOfficerAssignedCases(String userEmail) {
//        User legalOfficer = userRepository.findByEmail(userEmail)
//                .orElseThrow(() -> new RuntimeException("Legal officer not found"));
//
//        if (legalOfficer.getLegalOfficerId() == null) {
//            return new ArrayList<>();
//        }
//
//        List<Submission> allSubmissions = submissionRepository.findAll();
//        List<Map<String, Object>> assignedCases = new ArrayList<>();
//
//        for (Submission submission : allSubmissions) {
//            for (Borrower borrower : submission.getBorrowers()) {
//                if (legalOfficer.getLegalOfficerId().equals(borrower.getAssignedLegalOfficerId())) {
//
//                    Map<String, Object> caseInfo = new HashMap<>();
//                    caseInfo.put("submissionId", submission.getId());
//                    caseInfo.put("borrowerId", borrower.getId());
//                    caseInfo.put("borrowerName", borrower.getBorrowerName());
//                    caseInfo.put("borrowerAddress", borrower.getBorrowerAddress());
//                    caseInfo.put("membershipNo", borrower.getMembershipNo());
//                    caseInfo.put("loanNumber", borrower.getLoanNumber());
//                    caseInfo.put("loanAmount", borrower.getLoanAmount());
//                    caseInfo.put("interest", borrower.getInterest());
//                    caseInfo.put("interestRate", borrower.getInterestRate());
//                    caseInfo.put("arbitrationNumber", borrower.getArbitrationNumber());
//                    caseInfo.put("decisionDate", borrower.getDecisionDate());
//                    caseInfo.put("finalLoanAmount", borrower.getFinalLoanAmount());
//                    caseInfo.put("interestDeducted", borrower.getInterestDeducted());
//                    caseInfo.put("arbitrationDecision", borrower.getArbitrationDecision());
//                    caseInfo.put("assignedOfficerName", borrower.getAssignedOfficerName());
//                    caseInfo.put("assignedCourtId", borrower.getAssignedCourtId());
//                    caseInfo.put("assignedCourtName", borrower.getAssignedCourtName());
//                    caseInfo.put("legalAssignmentDate", borrower.getLegalAssignmentDate());
//                    caseInfo.put("judgmentDate", borrower.getJudgmentDate());
//                    caseInfo.put("judgmentNumber", borrower.getJudgmentNumber());
//                    caseInfo.put("judgmentResult", borrower.getJudgmentResult());
//                    caseInfo.put("status", borrower.getStatus());
//                    caseInfo.put("societyName", submission.getSocietyName());
//                    caseInfo.put("districtName", submission.getDistrictName());
//                    caseInfo.put("guarantor1Name", borrower.getGuarantor1Name());
//                    caseInfo.put("guarantor2Name", borrower.getGuarantor2Name());
//
//                    // ⭐ ADD THIS LINE - This was missing!
//                    caseInfo.put("courtPayments", borrower.getCourtPayments());
//
//                    // ⭐ Also add these for completeness
//                    caseInfo.put("legalOfficerRemarks", borrower.getLegalOfficerRemarks());
//                    caseInfo.put("remarksAddedAt", borrower.getRemarksAddedAt());
//
//                    assignedCases.add(caseInfo);
//                }
//            }
//        }
//
//        return assignedCases;
//    }

//    public List<Map<String, Object>> getLegalOfficerAssignedCases(String userEmail) {
//        User legalOfficer = userRepository.findByEmail(userEmail)
//                .orElseThrow(() -> new RuntimeException("Legal officer not found"));
//
//        if (legalOfficer.getLegalOfficerId() == null) {
//            return new ArrayList<>();
//        }
//
//        List<Submission> allSubmissions = submissionRepository.findAll();
//        List<Map<String, Object>> assignedCases = new ArrayList<>();
//
//        for (Submission submission : allSubmissions) {
//            for (Borrower borrower : submission.getBorrowers()) {
//                if (legalOfficer.getLegalOfficerId().equals(borrower.getAssignedLegalOfficerId())) {
//
//                    Map<String, Object> caseInfo = new HashMap<>();
//                    caseInfo.put("submissionId", submission.getId());
//                    caseInfo.put("borrowerId", borrower.getId());
//                    caseInfo.put("borrowerName", borrower.getBorrowerName());
//                    caseInfo.put("borrowerNIC", borrower.getBorrowerNIC()); // ⭐ ADD THIS
//                    caseInfo.put("borrowerAddress", borrower.getBorrowerAddress());
//                    caseInfo.put("membershipNo", borrower.getMembershipNo());
//                    caseInfo.put("loanNumber", borrower.getLoanNumber());
//                    caseInfo.put("loanAmount", borrower.getLoanAmount());
//                    caseInfo.put("outstandingLoanAmount", borrower.getOutstandingLoanAmount()); // ⭐ ADD THIS
//                    caseInfo.put("interest", borrower.getInterest());
//                    caseInfo.put("interestRate", borrower.getInterestRate());
//                    caseInfo.put("loanType", borrower.getLoanType()); // ⭐ ADD THIS
//                    caseInfo.put("arbitrationNumber", borrower.getArbitrationNumber());
//                    caseInfo.put("decisionDate", borrower.getDecisionDate());
//
//                    caseInfo.put("arbitrationDecision", borrower.getArbitrationDecision());
//                    caseInfo.put("assignedOfficerName", borrower.getAssignedOfficerName());
//                    caseInfo.put("assignedCourtId", borrower.getAssignedCourtId());
//                    caseInfo.put("assignedCourtName", borrower.getAssignedCourtName());
//                    caseInfo.put("legalAssignmentDate", borrower.getLegalAssignmentDate());
//                    caseInfo.put("judgmentDate", borrower.getJudgmentDate());
//                    caseInfo.put("judgmentNumber", borrower.getJudgmentNumber());
//                    caseInfo.put("judgmentResult", borrower.getJudgmentResult());
//                    caseInfo.put("status", borrower.getStatus());
//                    caseInfo.put("societyName", submission.getSocietyName());
//                    caseInfo.put("districtName", submission.getDistrictName());
//                    caseInfo.put("guarantor1Name", borrower.getGuarantor1Name());
//                    caseInfo.put("guarantor1NIC", borrower.getGuarantor1NIC()); // ⭐ ADD THIS
//                    caseInfo.put("guarantor2Name", borrower.getGuarantor2Name());
//                    caseInfo.put("guarantor2NIC", borrower.getGuarantor2NIC()); // ⭐ ADD THIS
//                    caseInfo.put("courtPayments", borrower.getCourtPayments());
//                    caseInfo.put("legalOfficerRemarks", borrower.getLegalOfficerRemarks());
//                    caseInfo.put("remarksAddedAt", borrower.getRemarksAddedAt());
//
//                    assignedCases.add(caseInfo);
//                }
//            }
//        }
//
//        return assignedCases;
//    }

    // ⭐ Email notification for legal assignment
    private void sendLegalAssignmentNotifications(Submission submission, Borrower borrower,
                                                  LegalOfficer legalOfficer, Court court) {
        try {
            // 1. Email to legal officer
            if (legalOfficer.getUserEmail() != null) {
                User officerUser = userRepository.findByEmail(legalOfficer.getUserEmail()).orElse(null);
                if (officerUser != null) {
                    emailService.sendLegalCaseAssignmentNotification(
                            officerUser.getEmail(),
                            officerUser.getName(),
                            submission,
                            borrower,
                            court.getName()
                    );
                }
            }

            // 2. Email to society
            Society society = societyRepository.findById(submission.getSocietyId()).orElse(null);
            if (society != null) {
                if (society.getAdminEmail() != null) {
                    User admin = userRepository.findByEmail(society.getAdminEmail()).orElse(null);
                    if (admin != null) {
                        emailService.sendLegalCaseNotificationToSociety(
                                admin.getEmail(),
                                admin.getName(),
                                submission,
                                borrower,
                                legalOfficer.getName(),
                                court.getName()
                        );
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to send legal assignment notifications: " + e.getMessage());
        }
    }

    // ⭐ Email notification for judgment
    private void sendJudgmentNotifications(Submission submission, Borrower borrower, String legalOfficerName) {
        try {
            // 1. Email to district office
            List<User> districtAdmins = userRepository.findAll().stream()
                    .filter(user -> submission.getDistrictId().equals(user.getDistrict()))
                    .filter(user -> user.getRoles().contains(Role.DISTRICT_ADMIN) ||
                            user.getRoles().contains(Role.PROVINCIAL_ADMIN))
                    .collect(Collectors.toList());

            for (User admin : districtAdmins) {
                emailService.sendJudgmentNotification(
                        admin.getEmail(),
                        admin.getName(),
                        submission,
                        borrower,
                        legalOfficerName
                );
            }

            // 2. Email to society
            Society society = societyRepository.findById(submission.getSocietyId()).orElse(null);
            if (society != null) {
                if (society.getAdminEmail() != null) {
                    User admin = userRepository.findByEmail(society.getAdminEmail()).orElse(null);
                    if (admin != null) {
                        emailService.sendJudgmentNotification(
                                admin.getEmail(),
                                admin.getName(),
                                submission,
                                borrower,
                                legalOfficerName
                        );
                    }
                }

                if (society.getApprovalEmail() != null &&
                        !society.getApprovalEmail().equals(society.getAdminEmail())) {
                    User approval = userRepository.findByEmail(society.getApprovalEmail()).orElse(null);
                    if (approval != null) {
                        emailService.sendJudgmentNotification(
                                approval.getEmail(),
                                approval.getName(),
                                submission,
                                borrower,
                                legalOfficerName
                        );
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to send judgment notifications: " + e.getMessage());
        }
    }

    ///
    // ADD THESE METHODS TO YOUR EXISTING SubmissionService.java



    /**
     * Legal officer adds a court payment
     */
    @Transactional
    public Submission addCourtPayment(String submissionId, String borrowerId,
                                      BigDecimal amount, LocalDate paymentDate,
                                      String userEmail) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        Borrower borrower = submission.getBorrowers().stream()
                .filter(b -> b.getId().equals(borrowerId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Borrower not found"));

        // Verify user is the assigned legal officer
        User legalOfficer = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Legal officer not found"));

        if (legalOfficer.getLegalOfficerId() == null ||
                !legalOfficer.getLegalOfficerId().equals(borrower.getAssignedLegalOfficerId())) {
            throw new RuntimeException("You are not authorized to add payment for this case");
        }

        if (!"legal-case".equals(borrower.getStatus())) {
            throw new RuntimeException("Case must be in legal-case status");
        }

//        if (borrower.getJudgmentResult() == null) {
//            throw new RuntimeException("Cannot add payment before adding judgment");
//        }

        // ✅ NEW: Check if at least one judgment has BOTH date and result
        if (borrower.getJudgments() == null || borrower.getJudgments().isEmpty()) {
            throw new RuntimeException("Cannot add payment before adding judgment");
        }

// ⭐ NEW: Verify at least one complete judgment exists
        boolean hasCompleteJudgment = borrower.getJudgments().stream()
                .anyMatch(j -> j.getJudgmentDate() != null &&
                        j.getJudgmentResult() != null &&
                        !j.getJudgmentResult().trim().isEmpty());

        if (!hasCompleteJudgment) {
            throw new RuntimeException("Cannot add payment before adding complete judgment (both date and result required)");
        }

        // Initialize payments list if null
        if (borrower.getCourtPayments() == null) {
            borrower.setCourtPayments(new ArrayList<>());
        }

        // Create new payment record
        CourtPayment payment = CourtPayment.builder()
                .id(UUID.randomUUID().toString())
                .amount(amount)
                .paymentDate(paymentDate != null ? paymentDate : LocalDate.now())
                .addedBy(userEmail)
                .addedAt(LocalDateTime.now())
                .build();

        borrower.getCourtPayments().add(payment);

        Submission savedSubmission = submissionRepository.save(submission);

        // Send notifications
        sendCourtPaymentNotifications(savedSubmission, borrower, legalOfficer.getName(), payment);

        return savedSubmission;
    }

    /**
     * Legal officer deletes a court payment
     */
    @Transactional
    public Submission deleteCourtPayment(String submissionId, String borrowerId,
                                         String paymentId, String userEmail) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        Borrower borrower = submission.getBorrowers().stream()
                .filter(b -> b.getId().equals(borrowerId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Borrower not found"));

        // Verify user is the assigned legal officer
        User legalOfficer = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Legal officer not found"));

        if (legalOfficer.getLegalOfficerId() == null ||
                !legalOfficer.getLegalOfficerId().equals(borrower.getAssignedLegalOfficerId())) {
            throw new RuntimeException("You are not authorized to delete payment for this case");
        }

        // Remove the payment
        borrower.getCourtPayments().removeIf(p -> p.getId().equals(paymentId));

        return submissionRepository.save(submission);
    }

    /**
     * Legal officer adds/updates special remarks (UNCHANGED)
     */
    @Transactional
    public Submission updateLegalRemarks(String submissionId, String borrowerId,
                                         String remarks, String userEmail) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        Borrower borrower = submission.getBorrowers().stream()
                .filter(b -> b.getId().equals(borrowerId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Borrower not found"));

        // Verify user is the assigned legal officer
        User legalOfficer = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Legal officer not found"));

        if (legalOfficer.getLegalOfficerId() == null ||
                !legalOfficer.getLegalOfficerId().equals(borrower.getAssignedLegalOfficerId())) {
            throw new RuntimeException("You are not authorized to add remarks for this case");
        }

        borrower.setLegalOfficerRemarks(remarks);
        borrower.setRemarksAddedAt(LocalDateTime.now());

        return submissionRepository.save(submission);
    }

    /**
     * Get cases with court decisions for society
     */
    public List<Map<String, Object>> getCasesWithCourtDecisions(String societyId) {
        List<Submission> submissions = submissionRepository.findBySocietyId(societyId);
        List<Map<String, Object>> cases = new ArrayList<>();

        for (Submission submission : submissions) {
            for (Borrower borrower : submission.getBorrowers()) {
                if (borrower.getJudgmentResult() != null) {
                    Map<String, Object> caseInfo = createCourtDecisionMap(submission, borrower);
                    cases.add(caseInfo);
                }
            }
        }

        cases.sort((a, b) -> {
            LocalDate dateA = (LocalDate) a.get("judgmentDate");
            LocalDate dateB = (LocalDate) b.get("judgmentDate");
            if (dateA == null) return 1;
            if (dateB == null) return -1;
            return dateB.compareTo(dateA);
        });

        return cases;
    }

    /**
     * Get cases with court decisions for district
     */
    public List<Map<String, Object>> getDistrictCourtDecisions(String districtId) {
        List<Submission> submissions = submissionRepository.findByDistrictId(districtId);
        List<Map<String, Object>> cases = new ArrayList<>();

        for (Submission submission : submissions) {
            for (Borrower borrower : submission.getBorrowers()) {
                if (borrower.getJudgmentResult() != null) {
                    Map<String, Object> caseInfo = createCourtDecisionMap(submission, borrower);
                    cases.add(caseInfo);
                }
            }
        }

        cases.sort((a, b) -> {
            LocalDate dateA = (LocalDate) a.get("judgmentDate");
            LocalDate dateB = (LocalDate) b.get("judgmentDate");
            if (dateA == null) return 1;
            if (dateB == null) return -1;
            return dateB.compareTo(dateA);
        });

        return cases;
    }

    /**
     * Get all cases with court decisions (Provincial Admin)
     */
    public List<Map<String, Object>> getAllCourtDecisions() {
        List<Submission> allSubmissions = submissionRepository.findAll();
        List<Map<String, Object>> cases = new ArrayList<>();

        for (Submission submission : allSubmissions) {
            for (Borrower borrower : submission.getBorrowers()) {
                if (borrower.getJudgmentResult() != null) {
                    Map<String, Object> caseInfo = createCourtDecisionMap(submission, borrower);
                    cases.add(caseInfo);
                }
            }
        }

        cases.sort((a, b) -> {
            LocalDate dateA = (LocalDate) a.get("judgmentDate");
            LocalDate dateB = (LocalDate) b.get("judgmentDate");
            if (dateA == null) return 1;
            if (dateB == null) return -1;
            return dateB.compareTo(dateA);
        });

        return cases;
    }

//    private Map<String, Object> createCourtDecisionMap(Submission submission, Borrower borrower) {
//        Map<String, Object> caseInfo = new HashMap<>();
//        caseInfo.put("submissionId", submission.getId());
//        caseInfo.put("borrowerId", borrower.getId());
//        caseInfo.put("borrowerName", borrower.getBorrowerName());
//        caseInfo.put("borrowerAddress", borrower.getBorrowerAddress());
//        caseInfo.put("loanNumber", borrower.getLoanNumber());
//        caseInfo.put("loanAmount", borrower.getLoanAmount());
//        caseInfo.put("arbitrationNumber", borrower.getArbitrationNumber());
//        caseInfo.put("assignedCourtName", borrower.getAssignedCourtName());
//        caseInfo.put("assignedLegalOfficerName", borrower.getAssignedLegalOfficerName());
//        caseInfo.put("judgmentDate", borrower.getJudgmentDate());
//        caseInfo.put("judgmentNumber", borrower.getJudgmentNumber());
//        caseInfo.put("judgmentResult", borrower.getJudgmentResult());
//
//        // ⭐ NEW: Payment information (simple list)
//        caseInfo.put("courtPayments", borrower.getCourtPayments());
//
//        caseInfo.put("legalOfficerRemarks", borrower.getLegalOfficerRemarks());
//        caseInfo.put("remarksAddedAt", borrower.getRemarksAddedAt());
//        caseInfo.put("societyName", submission.getSocietyName());
//        caseInfo.put("districtName", submission.getDistrictName());
//        caseInfo.put("districtId", submission.getDistrictId());
//        return caseInfo;
//    }

    private Map<String, Object> createCourtDecisionMap(Submission submission, Borrower borrower) {
        Map<String, Object> caseInfo = new HashMap<>();
        caseInfo.put("submissionId", submission.getId());
        caseInfo.put("borrowerId", borrower.getId());
        caseInfo.put("borrowerName", borrower.getBorrowerName());
        caseInfo.put("borrowerNIC", borrower.getBorrowerNIC()); // ⭐ ADD THIS
        caseInfo.put("borrowerAddress", borrower.getBorrowerAddress());
        caseInfo.put("loanNumber", borrower.getLoanNumber());
        caseInfo.put("loanAmount", borrower.getLoanAmount());
        caseInfo.put("outstandingLoanAmount", borrower.getOutstandingLoanAmount()); // ⭐ ADD THIS
        caseInfo.put("loanType", borrower.getLoanType()); // ⭐ ADD THIS
        caseInfo.put("arbitrationNumber", borrower.getArbitrationNumber());
        caseInfo.put("assignedCourtName", borrower.getAssignedCourtName());
        caseInfo.put("assignedLegalOfficerName", borrower.getAssignedLegalOfficerName());
        caseInfo.put("judgmentDate", borrower.getJudgmentDate());
        caseInfo.put("judgmentNumber", borrower.getJudgmentNumber());
        caseInfo.put("judgmentResult", borrower.getJudgmentResult());
        caseInfo.put("courtPayments", borrower.getCourtPayments());
        caseInfo.put("legalOfficerRemarks", borrower.getLegalOfficerRemarks());
        caseInfo.put("remarksAddedAt", borrower.getRemarksAddedAt());
        caseInfo.put("societyName", submission.getSocietyName());
        caseInfo.put("districtName", submission.getDistrictName());
        caseInfo.put("districtId", submission.getDistrictId());
        return caseInfo;
    }
    /**
     * Send notifications when court payment is added
     */
    private void sendCourtPaymentNotifications(Submission submission, Borrower borrower,
                                               String legalOfficerName, CourtPayment payment) {
        try {
            // Notify District Office
            List<User> districtAdmins = userRepository.findAll().stream()
                    .filter(user -> submission.getDistrictId().equals(user.getDistrict()))
                    .filter(user -> user.getRoles().contains(Role.DISTRICT_ADMIN) ||
                            user.getRoles().contains(Role.PROVINCIAL_ADMIN))
                    .collect(Collectors.toList());

            for (User admin : districtAdmins) {
                emailService.sendCourtPaymentUpdateNotification(
                        admin.getEmail(),
                        admin.getName(),
                        submission,
                        borrower,
                        legalOfficerName,
                        payment
                );
            }

            // Notify Society
            Society society = societyRepository.findById(submission.getSocietyId()).orElse(null);
            if (society != null) {
                if (society.getAdminEmail() != null) {
                    User admin = userRepository.findByEmail(society.getAdminEmail()).orElse(null);
                    if (admin != null) {
                        emailService.sendCourtPaymentUpdateNotification(
                                admin.getEmail(),
                                admin.getName(),
                                submission,
                                borrower,
                                legalOfficerName,
                                payment
                        );
                    }
                }

                if (society.getApprovalEmail() != null &&
                        !society.getApprovalEmail().equals(society.getAdminEmail())) {
                    User approval = userRepository.findByEmail(society.getApprovalEmail()).orElse(null);
                    if (approval != null) {
                        emailService.sendCourtPaymentUpdateNotification(
                                approval.getEmail(),
                                approval.getName(),
                                submission,
                                borrower,
                                legalOfficerName,
                                payment
                        );
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to send court payment notifications: " + e.getMessage());
        }
    }



    /**
     * Mark arbitration fee paid with manual officer selection
     */
    @Transactional
    public Submission markArbitrationFeePaidWithOfficer(String submissionId, String borrowerId,
                                                        String assignedOfficerId, String userEmail) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        Borrower borrower = submission.getBorrowers().stream()
                .filter(b -> b.getId().equals(borrowerId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Borrower not found"));

        // Check if deficiencies were checked and none found
        if (!Boolean.TRUE.equals(borrower.getDocumentDeficienciesChecked())) {
            throw new RuntimeException("ලිපිගොනු අඩුපාඩු පරීක්ෂා කරන්න ඕනේ");
        }

        if (borrower.getDocumentDeficiencies() != null &&
                !borrower.getDocumentDeficiencies().isEmpty() &&
                !"NONE".equals(borrower.getDocumentDeficiencies())) {
            throw new RuntimeException("ලිපිගොනු අඩුපාඩු තිබේ. කරුණාකර ඒවා ඉවත් කරන්න.");
        }

        // Verify officer exists
        ArbitrationOfficer officer = arbitrationOfficerRepository.findById(assignedOfficerId)
                .orElseThrow(() -> new RuntimeException("Officer not found"));

        // Get district and generate new format arbitration number
        District district = districtRepository.findById(submission.getDistrictId())
                .orElseThrow(() -> new RuntimeException("District not found"));

        String arbitrationNumber = generateNewFormatArbitrationNumber(
                district.getCode(),
                borrower.getLoanType(),
                submission.getDistrictId()
        );

        // Mark as paid and assign officer
        borrower.setArbitrationFeePaid(true);
        borrower.setArbitrationNumber(arbitrationNumber);
        borrower.setAssignedOfficerId(assignedOfficerId);
        borrower.setAssignedOfficerName(officer.getName());
        borrower.setAssignedDate(LocalDateTime.now());
        borrower.setStatus("assigned");

        return submissionRepository.save(submission);
    }

    /**
     * Generate new format arbitration number: YYYY/DISTRICT/LOANTYPE/####
     */
    private String generateNewFormatArbitrationNumber(String districtCode, String loanType, String districtId) {
        List<Submission> districtSubmissions = submissionRepository.findByDistrictId(districtId);

        int currentYear = LocalDate.now().getYear();

        // Count existing numbers for this year, district, and loan type
        long count = districtSubmissions.stream()
                .flatMap(s -> s.getBorrowers().stream())
                .filter(b -> b.getArbitrationNumber() != null)
                .filter(b -> b.getArbitrationNumber().startsWith(currentYear + "/" + districtCode + "/" + (loanType != null ? loanType : "")))
                .count();

        String loanTypeStr = loanType != null ? loanType : "ධර්ම";
        return String.format("%d/%s/%s/%05d", currentYear, districtCode, loanTypeStr, count + 1);
    }




    /**
     * STEP 1: Check and mark document deficiencies
     */
    @Transactional
    public Submission checkAndMarkDeficiencies(String submissionId, String borrowerId,
                                               String deficiencies, String userEmail) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("ඉදිරිපත් කිරීම සොයා ගත නොහැක"));

        Borrower borrower = submission.getBorrowers().stream()
                .filter(b -> b.getId().equals(borrowerId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("ණයකරු සොයා ගත නොහැක"));

        // Mark as checked
        borrower.setDocumentDeficienciesChecked(true);
        borrower.setDocumentDeficiencies(
                (deficiencies == null || deficiencies.trim().isEmpty()) ? "NONE" : deficiencies
        );
        borrower.setDeficiencyCheckDate(LocalDateTime.now());
        borrower.setDeficiencyCheckedBy(userEmail);

        return submissionRepository.save(submission);
    }



//CODE GENERATE NUMBER  WITHOUT CONSIDERING  LOAN CODE
    /**
     * STEP 2: Mark fee paid + Assign officer + Generate arbitration number
     * This combines all three actions in one transaction
     */
    @Transactional
    public Submission markFeePaidAndAssignOfficer(String submissionId, String borrowerId,
                                                  String assignedOfficerId, String userEmail) {

        // Find submission
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("ඉදිරිපත් කිරීම සොයා ගත නොහැක"));

        // Find borrower
        Borrower borrower = submission.getBorrowers().stream()
                .filter(b -> b.getId().equals(borrowerId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("ණයකරු සොයා ගත නොහැක"));

        // ✅ Validation 1: Check if deficiencies were checked
        if (!Boolean.TRUE.equals(borrower.getDocumentDeficienciesChecked())) {
            throw new RuntimeException("කරුණාකර ලිපිගොනු අඩුපාඩු පරීක්ෂා කරන්න");
        }

        // ✅ Validation 2: Check if deficiencies found
        if (borrower.getDocumentDeficiencies() != null &&
                !borrower.getDocumentDeficiencies().equals("NONE")) {
            throw new RuntimeException("ලිපිගොනු අඩුපාඩු තිබේ. ඒවා නිවැරදි කර නැවත ඉදිරිපත් කරන්න");
        }

        // ✅ Validation 3: Verify officer exists
        ArbitrationOfficer officer = arbitrationOfficerRepository.findById(assignedOfficerId)
                .orElseThrow(() -> new RuntimeException("තෝරාගත් නිලධාරියා හමු නොවීය"));

        // ✅ Validation 4: Get district for arbitration number generation
        District district = districtRepository.findById(submission.getDistrictId())
                .orElseThrow(() -> new RuntimeException("දිස්ත්‍රික්කය හමු නොවීය"));

        try {
            // Get loanType from borrower - if null, use default value
            String loanType = borrower.getLoanType();
            if (loanType == null || loanType.trim().isEmpty()) {
                // Default to "ණය" (Loans) if not set
                loanType = "ණය";
                borrower.setLoanType(loanType);
            }

            // ⭐ STEP 2A: Generate arbitration number
            // Format: CDC/districtCode/loanCode/year/#####
            // Example: CDC/N/L/2025/00001
            // Note: Count is based on district + year only (ignores loan code)
            String arbitrationNumber = generateArbitrationNumber(
                    district.getCode(),
                    loanType,
                    submission.getDistrictId()
            );

            // ⭐ STEP 2B: Mark fee as paid
            borrower.setArbitrationFeePaid(true);

            // ⭐ STEP 2C: Set arbitration number
            borrower.setArbitrationNumber(arbitrationNumber);

            // ⭐ STEP 2D: Assign officer
            borrower.setAssignedOfficerId(assignedOfficerId);
            borrower.setAssignedOfficerName(officer.getName());
            borrower.setAssignedDate(LocalDateTime.now());

            // ⭐ STEP 2E: Update status
            borrower.setStatus("assigned");

            Submission savedSubmission = submissionRepository.save(submission);

            // Send email notifications
            sendAssignmentNotifications(savedSubmission, borrower, officer);

            return savedSubmission;

        } catch (Exception e) {
            throw new RuntimeException("ක්‍රියාව අසාර්ථක: " + e.getMessage());
        }
    }

    /**
     * Convert Sinhala loan type to loan code
     * ණය = L (Loans)
     * විවිධ = M (Miscellaneous)
     * තැන්පතු = D (Deposits)
     */
    private String convertLoanTypeToCode(String loanType) {
        if (loanType == null || loanType.trim().isEmpty()) {
            return "X"; // Unknown fallback
        }

        switch (loanType.trim()) {
            case "ණය":
                return "L"; // Loans
            case "විවිධ":
                return "M"; // Miscellaneous
            case "තැන්පතු":
                return "D"; // Deposits
            default:
                return "X"; // Unknown fallback
        }
    }

    /**
     * Generate arbitration number with format: CDC/DISTRICTCODE/LOANCODE/YEAR/#####
     * Example: CDC/N/L/2025/00001
     *
     * NOTE: The sequence number (#####) is based ONLY on district + year.
     * Loan code is included in the format but NOT used for counting.
     * This means all loan types in the same district share the same sequence.
     */
    private String generateArbitrationNumber(String districtCode, String loanType, String districtId) {

        // Validate inputs
        if (districtCode == null || districtCode.trim().isEmpty()) {
            throw new RuntimeException("දිස්ත්‍රික්කේ කේතය අඩුවී ඇත");
        }

        // Convert Sinhala loan type to code
        String loanCode = convertLoanTypeToCode(loanType);

        // Create final variables for lambda expression
        final String finalDistrictCode = districtCode;

        List<Submission> districtSubmissions = submissionRepository.findByDistrictId(districtId);
        int currentYear = LocalDate.now().getYear();
        final int finalYear = currentYear;

        // Count existing numbers for this year and district ONLY
        // ⚠️ LOAN CODE IS NOT CONSIDERED IN THE COUNT
        // This means: CDC/N/L/2025/00001, CDC/N/M/2025/00002, CDC/N/D/2025/00003
        // All share the same sequence counter per district per year
        long count = districtSubmissions.stream()
                .flatMap(s -> s.getBorrowers().stream())
                .filter(b -> b.getArbitrationNumber() != null && !b.getArbitrationNumber().isEmpty())
                .filter(b -> {
                    String[] parts = b.getArbitrationNumber().split("/");
                    // Expected format: CDC/districtCode/loanCode/year/sequence
                    if (parts.length < 5) return false;
                    // Only check CDC, district code, and year (NOT loan code)
                    return parts[0].equals("CDC") &&
                            parts[1].equals(finalDistrictCode) &&
                            parts[3].equals(String.valueOf(finalYear));
                })
                .count();

        // Format: CDC/districtCode/loanCode/year/#####
        return String.format("CDC/%s/%s/%d/%05d", districtCode, loanCode, currentYear, count + 1);
    }

    /**
     * STEP 3: Add detailed arbitration decision
     * Can be added by: 1) Assigned Officer, 2) District Admin, 3) Provincial Admin
     */
    @Transactional
    public Submission addDetailedArbitrationDecision(String submissionId, String borrowerId,
                                                     Map<String, Object> decisionPayload, String userEmail) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("ඉදිරිපත් කිරීම සොයා ගත නොහැක"));

        Borrower borrower = submission.getBorrowers().stream()
                .filter(b -> b.getId().equals(borrowerId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("ණයකරු සොයා ගත නොහැක"));

        // ✅ Validation 1: Check user authorization
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("පරිශීලක සොයා ගත නොහැක"));

        boolean isAssignedOfficer = user.getRoles().contains(Role.OFFICER) &&
                user.getOfficerId() != null &&
                user.getOfficerId().equals(borrower.getAssignedOfficerId());

        boolean isDistrictAdmin = user.getRoles().contains(Role.DISTRICT_ADMIN) ||
                user.getRoles().contains(Role.PROVINCIAL_ADMIN);

        if (!isAssignedOfficer && !isDistrictAdmin) {
            throw new RuntimeException("ඔබට මෙම තීරණය එකතු කිරීමට අවසර නැත");
        }

        // ✅ Validation 2: Check borrower status
        if (!"assigned".equals(borrower.getStatus())) {
            throw new RuntimeException("ණයකරුවා 'assigned' තත්වයේ විය යුතුය");
        }

        // ⭐ Parse and set decision data
        LocalDate decisionDate = LocalDate.parse(decisionPayload.get("decisionDate").toString());
        LocalDate appealDueDate = calculateAppealDueDate(decisionDate);

        borrower.setDecisionDate(decisionDate);
        borrower.setAppealDueDate(appealDueDate);

        // Set financial details
        if (decisionPayload.get("proposedLoanBalance") != null) {
            borrower.setProposedLoanBalance(new BigDecimal(decisionPayload.get("proposedLoanBalance").toString()));
        }
        if (decisionPayload.get("proposedLoanInterest") != null) {
            borrower.setProposedLoanInterest(new BigDecimal(decisionPayload.get("proposedLoanInterest").toString()));
        }
        if (decisionPayload.get("caseFees") != null) {
            borrower.setCaseFees(new BigDecimal(decisionPayload.get("caseFees").toString()));
        }
        if (decisionPayload.get("proposedTotalAmount") != null) {
            borrower.setProposedTotalAmount(new BigDecimal(decisionPayload.get("proposedTotalAmount").toString()));
        }
        if (decisionPayload.get("forwardInterest") != null) {
            borrower.setForwardInterest(new BigDecimal(decisionPayload.get("forwardInterest").toString()));
        }
        if (decisionPayload.get("forwardInterestRate") != null) {
            borrower.setForwardInterestRate(new BigDecimal(decisionPayload.get("forwardInterestRate").toString()));
        }
        if (decisionPayload.get("deductionsFromLoanAmount") != null) {
            borrower.setDeductionsFromLoanAmount(new BigDecimal(decisionPayload.get("deductionsFromLoanAmount").toString()));
        }
        if (decisionPayload.get("deductionsFromInterestAmount") != null) {
            borrower.setDeductionsFromInterestAmount(new BigDecimal(decisionPayload.get("deductionsFromInterestAmount").toString()));
        }

        borrower.setArbitrationDecision(decisionPayload.get("arbitrationDecision").toString());
        borrower.setStatus("decision-given");
        borrower.setDecisionAddedBy(userEmail);
        borrower.setDecisionAddedAt(LocalDateTime.now());

        Submission savedSubmission = submissionRepository.save(submission);

        // Send notification emails
        sendDecisionNotifications(savedSubmission, borrower, borrower.getAssignedOfficerName());

        return savedSubmission;
    }

    /**
     * Calculate appeal due date: 30 days from decision, adjusted for weekends
     */
    private LocalDate calculateAppealDueDate(LocalDate decisionDate) {
        LocalDate dueDate = decisionDate.plusDays(30);
        DayOfWeek dayOfWeek = dueDate.getDayOfWeek();

        if (dayOfWeek == DayOfWeek.SATURDAY) {
            dueDate = dueDate.plusDays(2);
        } else if (dayOfWeek == DayOfWeek.SUNDAY) {
            dueDate = dueDate.plusDays(1);
        }

        return dueDate;
    }

    /**
     * Get officers by district (for dropdown selection)
     */
    public List<ArbitrationOfficer> getOfficersByDistrict(String districtId) {
        return arbitrationOfficerRepository.findByDistrictId(districtId);
    }

    /**
     * Email notification methods
     */
    private void sendAssignmentNotifications(Submission submission, Borrower borrower,
                                             ArbitrationOfficer officer) {
        try {
            // TODO: Implement email sending logic
            // Example: emailService.sendOfficerAssignmentEmail(officer, borrower, submission);
            //System.out.println("Assignment notification sent to: " + officer.getEmail());
        } catch (Exception e) {
            System.err.println("Failed to send assignment notification: " + e.getMessage());
        }
    }

    private void sendDecisionNotifications(Submission submission, Borrower borrower,
                                           String officerName) {
        try {
            // TODO: Implement email sending logic
            // Example: emailService.sendDecisionNotificationEmail(borrower, submission);
            System.out.println("Decision notification sent for borrower: " + borrower.getBorrowerName());
        } catch (Exception e) {
            System.err.println("Failed to send decision notification: " + e.getMessage());
        }
    }

    // Add this method to SubmissionService.java

    /**
     * Submit cases to legal action with deduction validation
     * ALL deduction fields must be filled before submission
     */
    @Transactional
    public Map<String, Object> submitCasesToLegalAction(List<Map<String, Object>> cases, String userEmail) {
        int successCount = 0;
        int failCount = 0;
        List<String> errors = new ArrayList<>();
        LocalDateTime submissionTime = LocalDateTime.now();

        for (Map<String, Object> caseData : cases) {
            try {
                String submissionId = (String) caseData.get("submissionId");
                String borrowerId = (String) caseData.get("borrowerId");

                Submission submission = submissionRepository.findById(submissionId)
                        .orElseThrow(() -> new RuntimeException("Submission not found"));

                Borrower borrower = submission.getBorrowers().stream()
                        .filter(b -> b.getId().equals(borrowerId))
                        .findFirst()
                        .orElseThrow(() -> new RuntimeException("Borrower not found"));

                // Validate status
                if (!"decision-given".equals(borrower.getStatus())) {
                    throw new RuntimeException("Invalid status for legal action submission");
                }

                // Extract and validate ALL deduction fields
                BigDecimal deductionsFromLoanAmount = parseBigDecimal(caseData.get("deductionsFromLoanAmount"));
                BigDecimal deductionsFromInterestAmount = parseBigDecimal(caseData.get("deductionsFromInterestAmount"));
                BigDecimal courtCharges = parseBigDecimal(caseData.get("courtCharges"));
                BigDecimal rebateDeductions = parseBigDecimal(caseData.get("rebateDeductions"));
                BigDecimal bondAndInterest = parseBigDecimal(caseData.get("bondAndInterest"));
                BigDecimal otherRebateDeductions = parseBigDecimal(caseData.get("otherRebateDeductions"));
                BigDecimal totalDeductions = parseBigDecimal(caseData.get("totalDeductions"));

                // ✅ VALIDATION: All fields must be provided and non-negative
                if (deductionsFromLoanAmount == null || deductionsFromInterestAmount == null ||
                        courtCharges == null || rebateDeductions == null ||
                        bondAndInterest == null || otherRebateDeductions == null ||
                        totalDeductions == null) {
                    throw new RuntimeException("සියලුම අඩු කිරීම් විස්තර පුරවන්න අවශ්‍යයි");
                }

                // Check for negative values
                if (deductionsFromLoanAmount.compareTo(BigDecimal.ZERO) < 0 ||
                        deductionsFromInterestAmount.compareTo(BigDecimal.ZERO) < 0 ||
                        courtCharges.compareTo(BigDecimal.ZERO) < 0 ||
                        rebateDeductions.compareTo(BigDecimal.ZERO) < 0 ||
                        bondAndInterest.compareTo(BigDecimal.ZERO) < 0 ||
                        otherRebateDeductions.compareTo(BigDecimal.ZERO) < 0 ||
                        totalDeductions.compareTo(BigDecimal.ZERO) < 0) {
                    throw new RuntimeException("අඩු කිරීම් ඍණ අගයක් විය නොහැක");
                }

                // Set ALL deduction fields
                borrower.setDeductionsFromLoanAmount(deductionsFromLoanAmount);
                borrower.setDeductionsFromInterestAmount(deductionsFromInterestAmount);
                borrower.setCourtCharges(courtCharges);
                borrower.setRebateDeductions(rebateDeductions);
                borrower.setBondAndInterest(bondAndInterest);
                borrower.setOtherRebateDeductions(otherRebateDeductions);
                borrower.setTotalDeductions(totalDeductions);

                // Mark as submitted for approval
                borrower.setSubmittedForApproval(true);
                borrower.setSubmittedForApprovalDate(submissionTime);
                borrower.setSubmittedForApprovalBy(userEmail);

                submissionRepository.save(submission);
                successCount++;

            } catch (Exception e) {
                failCount++;
                errors.add("Failed for case: " + e.getMessage());
            }
        }

        // Send email notification to approval officer
        if (successCount > 0) {
            sendLegalActionSubmissionNotification(cases, userEmail, successCount);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("message", "නඩු සාර්ථකව නීතිමය ක්‍රියාමාර්ගයට යවන ලදී!");
        result.put("successCount", successCount);
        result.put("failCount", failCount);
        result.put("errors", errors);

        return result;
    }

    /**
     * Helper method to parse BigDecimal from various input types
     */
    private BigDecimal parseBigDecimal(Object value) {
        if (value == null) return null;
        if (value instanceof BigDecimal) return (BigDecimal) value;
        if (value instanceof Number) return new BigDecimal(value.toString());
        try {
            String strValue = value.toString().trim();
            if (strValue.isEmpty()) return null;
            return new BigDecimal(strValue);
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Send notification to society approval officer
     */
    private void sendLegalActionSubmissionNotification(List<Map<String, Object>> cases,
                                                       String userEmail, int count) {
        try {
            if (cases.isEmpty()) return;

            String societyId = (String) cases.get(0).get("societyId");
            if (societyId != null) {
                Society society = societyRepository.findById(societyId).orElse(null);
                if (society != null && society.getApprovalEmail() != null) {
                    User approvalOfficer = userRepository.findByEmail(society.getApprovalEmail()).orElse(null);
                    if (approvalOfficer != null) {
                        // You can implement this in EmailService
                        emailService.sendLegalActionSubmissionNotification(
                                approvalOfficer.getEmail(),
                                approvalOfficer.getName(),
                                count
                        );
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to send legal action notification: " + e.getMessage());
        }
    }


    /////
    /**
     * Add a judgment entry (can be called multiple times)
     */
//    @Transactional
//    public Submission addJudgmentEntry(String submissionId, String borrowerId,
//                                       LocalDate judgmentDate, String judgmentNumber,
//                                       String judgmentResult, String userEmail) {
//        Submission submission = submissionRepository.findById(submissionId)
//                .orElseThrow(() -> new RuntimeException("Submission not found"));
//
//        Borrower borrower = submission.getBorrowers().stream()
//                .filter(b -> b.getId().equals(borrowerId))
//                .findFirst()
//                .orElseThrow(() -> new RuntimeException("Borrower not found"));
//
//        // Verify user is the assigned legal officer
//        User legalOfficer = userRepository.findByEmail(userEmail)
//                .orElseThrow(() -> new RuntimeException("Legal officer not found"));
//
//        if (legalOfficer.getLegalOfficerId() == null ||
//                !legalOfficer.getLegalOfficerId().equals(borrower.getAssignedLegalOfficerId())) {
//            throw new RuntimeException("You are not authorized to add judgment for this case");
//        }
//
//        if (!"legal-case".equals(borrower.getStatus())) {
//            throw new RuntimeException("Case must be in legal-case status");
//        }
//
//        // Initialize judgments list if null
//        if (borrower.getJudgments() == null) {
//            borrower.setJudgments(new ArrayList<>());
//        }
//
//        // Create new judgment entry
//        Judgment judgment = Judgment.builder()
//                .id(UUID.randomUUID().toString())
//                .judgmentDate(judgmentDate)
//                .judgmentNumber(judgmentNumber)
//                .judgmentResult(judgmentResult)
//                .addedBy(userEmail)
//                .addedAt(LocalDateTime.now())
//                .build();
//
//        borrower.getJudgments().add(judgment);
//
//        Submission savedSubmission = submissionRepository.save(submission);
//
//        // Send notifications
//        sendJudgmentUpdateNotifications(savedSubmission, borrower, legalOfficer.getName(), judgment);
//
//        return savedSubmission;
//    }

    /**
     * Add a judgment entry (can be called multiple times)
     * ⭐ Now supports adding date and result separately
     */
    @Transactional
    public Submission addJudgmentEntry(String submissionId, String borrowerId,
                                       LocalDate judgmentDate, String judgmentNumber,
                                       String judgmentResult, String userEmail) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        Borrower borrower = submission.getBorrowers().stream()
                .filter(b -> b.getId().equals(borrowerId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Borrower not found"));

        // Verify user is the assigned legal officer
        User legalOfficer = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Legal officer not found"));

        if (legalOfficer.getLegalOfficerId() == null ||
                !legalOfficer.getLegalOfficerId().equals(borrower.getAssignedLegalOfficerId())) {
            throw new RuntimeException("You are not authorized to add judgment for this case");
        }

        if (!"legal-case".equals(borrower.getStatus())) {
            throw new RuntimeException("Case must be in legal-case status");
        }

        // Initialize judgments list if null
        if (borrower.getJudgments() == null) {
            borrower.setJudgments(new ArrayList<>());
        }

        // ⭐ CHANGED: Allow either date OR result to be added separately
        // Create new judgment entry with whatever data is provided
        Judgment judgment = Judgment.builder()
                .id(UUID.randomUUID().toString())
                .judgmentDate(judgmentDate) // Can be null
                .judgmentNumber(judgmentNumber)
                .judgmentResult(judgmentResult) // Can be null or empty
                .addedBy(userEmail)
                .addedAt(LocalDateTime.now())
                .build();

        borrower.getJudgments().add(judgment);

        Submission savedSubmission = submissionRepository.save(submission);

        // Send notifications
        sendJudgmentUpdateNotifications(savedSubmission, borrower, legalOfficer.getName(), judgment);

        return savedSubmission;
    }
    /**
     * Update judgment number for a borrower
     * Can be called independently to update just the judgment number
     */
    public Submission updateJudgmentNumber(String submissionId, String borrowerId,
                                           String judgmentNumber, String userEmail) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        Borrower borrower = submission.getBorrowers().stream()
                .filter(b -> b.getId().equals(borrowerId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Borrower not found in this submission"));

        // Update only the judgment number
        borrower.setJudgmentNumber(judgmentNumber);

        // Save and return
        return submissionRepository.save(submission);
    }
    /**
     * Delete a judgment entry
     */
    @Transactional
    public Submission deleteJudgmentEntry(String submissionId, String borrowerId,
                                          String judgmentId, String userEmail) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        Borrower borrower = submission.getBorrowers().stream()
                .filter(b -> b.getId().equals(borrowerId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Borrower not found"));

        // Verify user is the assigned legal officer
        User legalOfficer = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Legal officer not found"));

        if (legalOfficer.getLegalOfficerId() == null ||
                !legalOfficer.getLegalOfficerId().equals(borrower.getAssignedLegalOfficerId())) {
            throw new RuntimeException("You are not authorized to delete judgment for this case");
        }

        // Remove the judgment
        borrower.getJudgments().removeIf(j -> j.getId().equals(judgmentId));

        return submissionRepository.save(submission);
    }

    /**
     * Send notifications when judgment is updated
     */
    private void sendJudgmentUpdateNotifications(Submission submission, Borrower borrower,
                                                 String legalOfficerName, Judgment judgment) {
        try {
            // Similar to existing notification logic
            List<User> districtAdmins = userRepository.findAll().stream()
                    .filter(user -> submission.getDistrictId().equals(user.getDistrict()))
                    .filter(user -> user.getRoles().contains(Role.DISTRICT_ADMIN) ||
                            user.getRoles().contains(Role.PROVINCIAL_ADMIN))
                    .collect(Collectors.toList());

            for (User admin : districtAdmins) {
                emailService.sendJudgmentUpdateNotification(
                        admin.getEmail(),
                        admin.getName(),
                        submission,
                        borrower,
                        legalOfficerName,
                        judgment
                );
            }
        } catch (Exception e) {
            System.err.println("Failed to send judgment update notifications: " + e.getMessage());
        }
    }

    /**
     * Generate monthly payment report for legal officer
     */
    public byte[] generateMonthlyPaymentReport(String userEmail, int year, int month) throws IOException {
        User legalOfficer = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Legal officer not found"));

        if (legalOfficer.getLegalOfficerId() == null) {
            throw new RuntimeException("User is not a legal officer");
        }

        // Get all cases assigned to this legal officer
        List<Submission> allSubmissions = submissionRepository.findAll();
        List<Map<String, Object>> reportData = new ArrayList<>();

        int rowNumber = 1;
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);

        for (Submission submission : allSubmissions) {
            for (Borrower borrower : submission.getBorrowers()) {
                if (legalOfficer.getLegalOfficerId().equals(borrower.getAssignedLegalOfficerId())) {

                    // Filter payments for this month
                    if (borrower.getCourtPayments() != null) {
                        for (CourtPayment payment : borrower.getCourtPayments()) {
                            LocalDate paymentDate = payment.getPaymentDate();

                            if (paymentDate.isAfter(startDate.minusDays(1)) &&
                                    paymentDate.isBefore(endDate.plusDays(1))) {

                                Map<String, Object> row = new HashMap<>();
                                row.put("rowNumber", rowNumber++);
                                row.put("paymentDate", paymentDate.format(DateTimeFormatter.ofPattern("yyyy.MM.dd")));
                                row.put("arbitrationNumber", borrower.getArbitrationNumber());
                                row.put("societyName", submission.getSocietyName());
                                row.put("amount", payment.getAmount());

                                reportData.add(row);
                            }
                        }
                    }
                }
            }
        }

        // Generate CSV
        return generateCSV(reportData, year, month);
    }

    /**
     * Generate CSV file from report data
     */
    private byte[] generateCSV(List<Map<String, Object>> data, int year, int month) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PrintWriter writer = new PrintWriter(new OutputStreamWriter(outputStream, StandardCharsets.UTF_8));

        // Write BOM for UTF-8
        outputStream.write(0xEF);
        outputStream.write(0xBB);
        outputStream.write(0xBF);

        // Write header with Sinhala text
        writer.println(String.format("මාසික ගෙවීම් වාර්තාව - %d.%02d", year, month));
        writer.println();
        writer.println("අංකය,දිනය,තීරක අංකය,සමිතිය,මුදල");

        // Write data rows
        for (Map<String, Object> row : data) {
            writer.println(String.format("%d,%s,%s,%s,%.2f",
                    row.get("rowNumber"),
                    row.get("paymentDate"),
                    row.get("arbitrationNumber"),
                    row.get("societyName"),
                    ((BigDecimal) row.get("amount")).doubleValue()
            ));
        }

        writer.flush();
        writer.close();

        return outputStream.toByteArray();
    }

    /**
     * Update getLegalOfficerAssignedCases to include judgments list
     */
    public List<Map<String, Object>> getLegalOfficerAssignedCases(String userEmail) {
        User legalOfficer = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Legal officer not found"));

        if (legalOfficer.getLegalOfficerId() == null) {
            return new ArrayList<>();
        }

        List<Submission> allSubmissions = submissionRepository.findAll();
        List<Map<String, Object>> assignedCases = new ArrayList<>();

        for (Submission submission : allSubmissions) {
            for (Borrower borrower : submission.getBorrowers()) {
                if (legalOfficer.getLegalOfficerId().equals(borrower.getAssignedLegalOfficerId())) {

                    Map<String, Object> caseInfo = new HashMap<>();
                    caseInfo.put("submissionId", submission.getId());
                    caseInfo.put("borrowerId", borrower.getId());
                    caseInfo.put("borrowerName", borrower.getBorrowerName());
                    caseInfo.put("borrowerNIC", borrower.getBorrowerNIC()); // ⭐ ADD THIS
                    caseInfo.put("borrowerAddress", borrower.getBorrowerAddress());
                    caseInfo.put("membershipNo", borrower.getMembershipNo());
                    caseInfo.put("loanNumber", borrower.getLoanNumber());
                    caseInfo.put("loanAmount", borrower.getLoanAmount());
                    caseInfo.put("outstandingLoanAmount", borrower.getOutstandingLoanAmount()); // ⭐ ADD THIS
                    caseInfo.put("interest", borrower.getInterest());
                    caseInfo.put("interestRate", borrower.getInterestRate());
                    caseInfo.put("loanType", borrower.getLoanType()); // ⭐ ADD THIS
                    caseInfo.put("arbitrationNumber", borrower.getArbitrationNumber());
                    caseInfo.put("decisionDate", borrower.getDecisionDate());

                    caseInfo.put("arbitrationDecision", borrower.getArbitrationDecision());
                    caseInfo.put("assignedOfficerName", borrower.getAssignedOfficerName());
                    caseInfo.put("assignedCourtId", borrower.getAssignedCourtId());
                    caseInfo.put("assignedCourtName", borrower.getAssignedCourtName());
                    caseInfo.put("legalAssignmentDate", borrower.getLegalAssignmentDate());
                    caseInfo.put("judgmentDate", borrower.getJudgmentDate());
                    caseInfo.put("judgmentNumber", borrower.getJudgmentNumber());
                    caseInfo.put("judgmentResult", borrower.getJudgmentResult());
                    caseInfo.put("status", borrower.getStatus());
                    caseInfo.put("societyName", submission.getSocietyName());
                    caseInfo.put("districtName", submission.getDistrictName());
                    caseInfo.put("guarantor1Name", borrower.getGuarantor1Name());
                    caseInfo.put("guarantor1NIC", borrower.getGuarantor1NIC()); // ⭐ ADD THIS
                    caseInfo.put("guarantor2Name", borrower.getGuarantor2Name());
                    caseInfo.put("guarantor2NIC", borrower.getGuarantor2NIC()); // ⭐ ADD THIS
                    caseInfo.put("courtPayments", borrower.getCourtPayments());
                    caseInfo.put("legalOfficerRemarks", borrower.getLegalOfficerRemarks());
                    caseInfo.put("remarksAddedAt", borrower.getRemarksAddedAt());
                    caseInfo.put("judgments", borrower.getJudgments()); // ⭐ ADD THIS
                    //caseInfo.put("courtPayments", borrower.getCourtPayments());


                    assignedCases.add(caseInfo);
                }
            }
        }

        return assignedCases;
    }

}
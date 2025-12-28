package com.CooperativeDevelopmentManagementSystem.DCDSystem.service;

import com.CooperativeDevelopmentManagementSystem.DCDSystem.model.Borrower;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.model.CourtPayment;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.model.Judgment;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.model.Submission;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.base-url:http://localhost:5173}")
    private String baseUrl;

    @Value("${app.company-name:DCD}")
    private String companyName;

    @Value("${spring.mail.username}")
    private String fromEmail;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd-MMM-yyyy hh:mm a");

    // ========================================
    // 1. SUBMISSION TO APPROVAL OFFICER
    // ========================================
    @Async
    public void sendSubmissionToApprovalNotification(String toEmail, String approverName,
                                                     Submission submission, String submitterName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            // Set From with custom name
            helper.setFrom(new InternetAddress(fromEmail, companyName + " Arbitration Management System"));
            helper.setTo(toEmail);
            helper.setSubject(String.format("[%s] New Borrowers List Awaiting Approval - %s",
                    companyName, submission.getSocietyName()));

            String emailContent = buildSubmissionToApprovalEmail(approverName, submission, submitterName);
            helper.setText(emailContent, true);

            mailSender.send(message);
            System.out.println("✅ Approval notification sent to: " + toEmail);
        } catch (Exception e) {
            System.err.println("❌ Failed to send email to " + toEmail + ": " + e.getMessage());
        }
    }

    private String buildSubmissionToApprovalEmail(String approverName, Submission submission,
                                                  String submitterName) {
        StringBuilder content = new StringBuilder();

        content.append(buildEmailHeader("New Borrowers List Awaiting Your Approval"));

        content.append("<div class='content'>");
        content.append("<p>Dear ").append(approverName).append(",</p>");
        content.append("<p>A new borrowers list has been submitted and requires your approval.</p>");

        content.append("<div class='info-box'>");
        content.append("<h3>Submission Details</h3>");
        content.append("<p><strong>Submitted By:</strong> ").append(submitterName).append("</p>");
        content.append("<p><strong>Society:</strong> ").append(submission.getSocietyName()).append("</p>");
        content.append("<p><strong>District:</strong> ").append(submission.getDistrictName()).append("</p>");
        content.append("<p><strong>Submitted Date:</strong> ").append(submission.getSubmittedDate().format(DATE_FORMATTER)).append("</p>");
        content.append("<p><strong>Number of Borrowers:</strong> ").append(submission.getBorrowers().size()).append("</p>");
        content.append("</div>");

        // Borrowers table
        content.append("<h3>Borrowers List</h3>");
        content.append("<table>");
        content.append("<tr><th>#</th><th>Borrower Name</th><th>Loan Number</th><th>Loan Amount (Rs.)</th><th>Interest (%)</th></tr>");

        int index = 1;
        for (Borrower borrower : submission.getBorrowers()) {
            content.append("<tr>");
            content.append("<td>").append(index++).append("</td>");
            content.append("<td>").append(borrower.getBorrowerName()).append("</td>");
            content.append("<td>").append(borrower.getLoanNumber()).append("</td>");
            content.append("<td>").append(String.format("%,.2f", borrower.getLoanAmount())).append("</td>");
            content.append("<td>").append(String.format("%.2f", borrower.getInterest())).append("</td>");
            content.append("</tr>");
        }
        content.append("</table>");

        content.append("<div class='action-required'>");
        content.append("<p><strong>⚠️ Action Required:</strong> Please review this submission and approve or reject it.</p>");
        content.append("</div>");

        content.append("<div style='text-align: center; margin: 30px 0;'>");
        content.append("<a href='").append(baseUrl).append("/dashboard' class='button'>Review & Approve</a>");
        content.append("</div>");

        content.append("<p>Best regards,<br>").append(companyName).append(" Arbitration Management System</p>");
        content.append("</div>");

        content.append(buildEmailFooter());

        return content.toString();
    }

    // ========================================
    // 2. APPROVAL TO DISTRICT OFFICE
    // ========================================
    @Async
    public void sendSubmissionToDistrictNotification(String toEmail, String adminName,
                                                     Submission submission, String approverName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(new InternetAddress(fromEmail, companyName + " Arbitration Management System"));
            helper.setTo(toEmail);
            helper.setSubject(String.format("[%s] Approved Borrowers List from %s - Action Required",
                    companyName, submission.getSocietyName()));

            String emailContent = buildSubmissionToDistrictEmail(adminName, submission, approverName);
            helper.setText(emailContent, true);

            mailSender.send(message);
            System.out.println("✅ District notification sent to: " + toEmail);
        } catch (Exception e) {
            System.err.println("❌ Failed to send email to " + toEmail + ": " + e.getMessage());
        }
    }

    private String buildSubmissionToDistrictEmail(String adminName, Submission submission,
                                                  String approverName) {
        StringBuilder content = new StringBuilder();

        content.append(buildEmailHeader("Approved Borrowers List - Action Required"));

        content.append("<div class='content'>");
        content.append("<p>Dear ").append(adminName).append(",</p>");
        content.append("<p>A borrowers list has been approved and forwarded to your office for processing.</p>");

        content.append("<div class='info-box'>");
        content.append("<h3>Submission Details</h3>");
        content.append("<p><strong>Society:</strong> ").append(submission.getSocietyName()).append("</p>");
        content.append("<p><strong>District:</strong> ").append(submission.getDistrictName()).append("</p>");
        content.append("<p><strong>Approved By:</strong> ").append(approverName).append("</p>");
        content.append("<p><strong>Approved Date:</strong> ").append(submission.getApprovedDate().format(DATE_FORMATTER)).append("</p>");
        content.append("<p><strong>Number of Borrowers:</strong> ").append(submission.getBorrowers().size()).append("</p>");
        content.append("</div>");

        content.append("<div class='info-box' style='background: #fff3cd; border-left: 4px solid #ffc107;'>");
        content.append("<h3>Next Steps</h3>");
        content.append("<ol style='margin: 10px 0; padding-left: 20px;'>");
        content.append("<li>Verify arbitration fee payment for each borrower</li>");
        content.append("<li>Generate arbitration numbers</li>");
        content.append("<li>Assign cases to arbitration officers</li>");
        content.append("</ol>");
        content.append("</div>");

        // Borrowers table
        content.append("<h3>Borrowers List</h3>");
        content.append("<table>");
        content.append("<tr><th>#</th><th>Borrower Name</th><th>Loan Number</th><th>Loan Amount (Rs.)</th><th>Interest (%)</th><th>Membership No</th></tr>");

        int index = 1;
        for (Borrower borrower : submission.getBorrowers()) {
            content.append("<tr>");
            content.append("<td>").append(index++).append("</td>");
            content.append("<td>").append(borrower.getBorrowerName()).append("</td>");
            content.append("<td>").append(borrower.getLoanNumber()).append("</td>");
            content.append("<td>").append(String.format("%,.2f", borrower.getLoanAmount())).append("</td>");
            content.append("<td>").append(String.format("%.2f", borrower.getInterest())).append("</td>");
            content.append("<td>").append(borrower.getMembershipNo()).append("</td>");
            content.append("</tr>");
        }
        content.append("</table>");

        content.append("<div style='text-align: center; margin: 30px 0;'>");
        content.append("<a href='").append(baseUrl).append("/dashboard' class='button'>Process Submission</a>");
        content.append("</div>");

        content.append("<p>Best regards,<br>").append(companyName).append(" Arbitration Management System</p>");
        content.append("</div>");

        content.append(buildEmailFooter());

        return content.toString();
    }

    // ========================================
    // 3. ARBITRATION ASSIGNMENT TO SOCIETY
    // ========================================
    @Async
    public void sendArbitrationAssignmentNotification(String toEmail, String recipientName,
                                                      Submission submission, List<Borrower> borrowers,
                                                      String officerName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(new InternetAddress(fromEmail, companyName + " Arbitration Management System"));
            helper.setTo(toEmail);
            helper.setSubject(String.format("[%s] Arbitration Numbers Generated & Officer Assigned - %s",
                    companyName, submission.getSocietyName()));

            String emailContent = buildArbitrationAssignmentEmail(recipientName, submission, borrowers, officerName);
            helper.setText(emailContent, true);

            mailSender.send(message);
            System.out.println("✅ Arbitration assignment notification sent to: " + toEmail);
        } catch (Exception e) {
            System.err.println("❌ Failed to send email to " + toEmail + ": " + e.getMessage());
        }
    }

    private String buildArbitrationAssignmentEmail(String recipientName, Submission submission,
                                                   List<Borrower> borrowers, String officerName) {
        StringBuilder content = new StringBuilder();

        content.append(buildEmailHeader("Arbitration Numbers Generated & Officer Assigned"));

        content.append("<div class='content'>");
        content.append("<p>Dear ").append(recipientName).append(",</p>");
        content.append("<p>Good news! Arbitration numbers have been generated and an arbitration officer has been assigned for your submission.</p>");

        content.append("<div class='info-box' style='background: #d4edda; border-left: 4px solid #28a745;'>");
        content.append("<h3>Assignment Details</h3>");
        content.append("<p><strong>Society:</strong> ").append(submission.getSocietyName()).append("</p>");
        content.append("<p><strong>District:</strong> ").append(submission.getDistrictName()).append("</p>");
        content.append("<p><strong>Assigned Officer:</strong> ").append(officerName).append("</p>");
        content.append("<p><strong>Number of Borrowers:</strong> ").append(borrowers.size()).append("</p>");
        content.append("</div>");

        // Borrowers with arbitration numbers
        content.append("<h3>Arbitration Numbers</h3>");
        content.append("<table>");
        content.append("<tr><th>#</th><th>Borrower Name</th><th>Loan Number</th><th>Arbitration Number</th><th>Status</th></tr>");

        int index = 1;
        for (Borrower borrower : borrowers) {
            content.append("<tr>");
            content.append("<td>").append(index++).append("</td>");
            content.append("<td>").append(borrower.getBorrowerName()).append("</td>");
            content.append("<td>").append(borrower.getLoanNumber()).append("</td>");
            content.append("<td><strong>").append(borrower.getArbitrationNumber()).append("</strong></td>");
            content.append("<td><span class='status-badge status-").append(borrower.getStatus()).append("'>")
                    .append(borrower.getStatus().toUpperCase()).append("</span></td>");
            content.append("</tr>");
        }
        content.append("</table>");

        content.append("<div class='info-box'>");
        content.append("<h3>What Happens Next?</h3>");
        content.append("<p>The assigned arbitration officer will review each case and provide decisions. You will be notified once decisions are made.</p>");
        content.append("</div>");

        content.append("<div style='text-align: center; margin: 30px 0;'>");
        content.append("<a href='").append(baseUrl).append("/dashboard' class='button'>View Details</a>");
        content.append("</div>");

        content.append("<p>Best regards,<br>").append(companyName).append(" Arbitration Management System</p>");
        content.append("</div>");

        content.append(buildEmailFooter());

        return content.toString();
    }


    // Update the officer assignment email method signature and implementation
    @Async
    public void sendOfficerAssignmentNotification(String toEmail, String officerName,
                                                  List<Map<String, Object>> borrowers,
                                                  LocalDateTime assignmentTime) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(new InternetAddress(fromEmail, companyName + " Arbitration Management System"));
            helper.setTo(toEmail);
            helper.setSubject(String.format("[%s] You Have Been Assigned New Arbitration Cases - Action Required", companyName));

            String emailContent = buildOfficerAssignmentEmail(officerName, borrowers, assignmentTime);
            helper.setText(emailContent, true);

            mailSender.send(message);
            System.out.println("✅ Officer assignment notification sent to: " + toEmail);
        } catch (Exception e) {
            System.err.println("❌ Failed to send email to " + toEmail + ": " + e.getMessage());
        }
    }

    private String buildOfficerAssignmentEmail(String officerName, List<Map<String, Object>> borrowers,
                                               LocalDateTime assignmentTime) {
        StringBuilder content = new StringBuilder();

        content.append(buildEmailHeader("You Have Been Assigned New Arbitration Cases"));

        content.append("<div class='content'>");
        content.append("<p>Dear ").append(officerName).append(",</p>");
        content.append("<p>You have been assigned as the <strong>Arbitration Officer</strong> for the following cases. Please review each borrower's details and provide your arbitration decisions.</p>");

        content.append("<div class='info-box' style='background: #fff3cd; border-left: 4px solid #ffc107;'>");
        content.append("<h3>⚠️ Action Required</h3>");
        content.append("<p><strong>Cases Assigned to You:</strong> ").append(borrowers.size()).append("</p>");
        content.append("<p><strong>Assignment Date & Time:</strong> ").append(assignmentTime.format(DATE_FORMATTER)).append("</p>");
        content.append("<p><strong>Status:</strong> Awaiting Your Arbitration Decision</p>");
        content.append("<p style='color: #856404; font-weight: bold; margin-top: 10px;'>Please log in to the system to review and provide your decisions for these cases.</p>");
        content.append("</div>");

        // Your newly assigned cases
        content.append("<h3>Your Newly Assigned Cases</h3>");
        content.append("<table>");
        content.append("<tr><th>#</th><th>Arbitration No.</th><th>Borrower Name</th><th>Loan No.</th><th>Society</th><th>District</th><th>Loan Amount (Rs.)</th></tr>");

        int index = 1;
        for (Map<String, Object> borrower : borrowers) {
            content.append("<tr>");
            content.append("<td>").append(index++).append("</td>");
            content.append("<td><strong style='color: #667eea;'>").append(borrower.get("arbitrationNumber")).append("</strong></td>");
            content.append("<td>").append(borrower.get("borrowerName")).append("</td>");
            content.append("<td>").append(borrower.get("loanNumber")).append("</td>");
            content.append("<td>").append(borrower.get("societyName")).append("</td>");
            content.append("<td>").append(borrower.get("districtName")).append("</td>");
            content.append("<td>").append(String.format("%,.2f", borrower.get("loanAmount"))).append("</td>");
            content.append("</tr>");
        }
        content.append("</table>");

        content.append("<div class='info-box' style='background: #e7f3ff; border-left: 4px solid #007bff;'>");
        content.append("<h3>📋 Your Responsibilities</h3>");
        content.append("<ol style='margin: 10px 0; padding-left: 20px;'>");
        content.append("<li><strong>Review Case Details:</strong> Examine each borrower's loan information, membership details, and guarantor information</li>");
        content.append("<li><strong>Calculate Final Amount:</strong> Determine the final loan amount after considering all factors</li>");
        content.append("<li><strong>Interest Deduction:</strong> Calculate and specify any interest deductions</li>");
        content.append("<li><strong>Provide Decision:</strong> Submit your arbitration decision through the system</li>");
        content.append("<li><strong>Document Everything:</strong> Ensure all decisions are properly documented with decision dates</li>");
        content.append("</ol>");
        content.append("</div>");

        content.append("<div class='info-box' style='background: #d4edda; border-left: 4px solid #28a745;'>");
        content.append("<h3>💡 What You Need to Do</h3>");
        content.append("<p>For each borrower assigned to you, you need to provide:</p>");
        content.append("<ul style='margin: 10px 0; padding-left: 20px;'>");
        content.append("<li><strong>Decision Date:</strong> When you make the arbitration decision</li>");
        content.append("<li><strong>Final Loan Amount:</strong> The final amount after your review</li>");
        content.append("<li><strong>Interest Deducted:</strong> Amount of interest to be deducted (if any)</li>");
        content.append("<li><strong>Arbitration Decision:</strong> Your detailed decision and reasoning</li>");
        content.append("</ul>");
        content.append("</div>");

        content.append("<div style='background: #f8d7da; border: 2px solid #f5c6cb; border-radius: 5px; padding: 15px; margin: 20px 0; text-align: center;'>");
        content.append("<p style='margin: 0; color: #721c24; font-size: 16px; font-weight: bold;'>");
        content.append("⏰ These cases are now pending your arbitration decision. Please prioritize reviewing and submitting your decisions.");
        content.append("</p>");
        content.append("</div>");

        content.append("<div style='text-align: center; margin: 30px 0;'>");
        content.append("<a href='").append(baseUrl).append("/dashboard' class='button' style='font-size: 16px; padding: 15px 40px;'>View My Assigned Cases & Provide Decisions</a>");
        content.append("</div>");

        content.append("<p>If you have any questions or need assistance, please contact the district office.</p>");
        content.append("<p>Best regards,<br>").append(companyName).append(" Arbitration Management System</p>");
        content.append("</div>");

        content.append(buildEmailFooter());

        return content.toString();
    }

    // ========================================
    // 5. ARBITRATION DECISION TO DISTRICT & SOCIETY
    // ========================================
    @Async
    public void sendArbitrationDecisionNotification(String toEmail, String recipientName,
                                                    Submission submission, Borrower borrower,
                                                    String officerName, boolean isDistrictOffice) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(new InternetAddress(fromEmail, companyName + " Arbitration Management System"));
            helper.setTo(toEmail);
            helper.setSubject(String.format("[%s] Arbitration Decision Submitted - %s (%s)",
                    companyName, borrower.getBorrowerName(), borrower.getArbitrationNumber()));

            String emailContent = buildArbitrationDecisionEmail(recipientName, submission, borrower,
                    officerName, isDistrictOffice);
            helper.setText(emailContent, true);

            mailSender.send(message);
            System.out.println("✅ Arbitration decision notification sent to: " + toEmail);
        } catch (Exception e) {
            System.err.println("❌ Failed to send email to " + toEmail + ": " + e.getMessage());
        }
    }

    private String buildArbitrationDecisionEmail(String recipientName, Submission submission,
                                                 Borrower borrower, String officerName,
                                                 boolean isDistrictOffice) {
        StringBuilder content = new StringBuilder();

        content.append(buildEmailHeader("Arbitration Decision Submitted"));

        content.append("<div class='content'>");
        content.append("<p>Dear ").append(recipientName).append(",</p>");

        if (isDistrictOffice) {
            content.append("<p>An arbitration officer has submitted their decision for a case in your district. Please review the decision details below.</p>");
        } else {
            content.append("<p>Good news! The arbitration officer has submitted their decision for one of your society's borrowers. Please review the decision details below.</p>");
        }

        content.append("<div class='info-box' style='background: #d4edda; border-left: 4px solid #28a745;'>");
        content.append("<h3>✅ Decision Submitted</h3>");
        content.append("<p><strong>Arbitration Officer:</strong> ").append(officerName).append("</p>");
        content.append("<p><strong>Decision Date:</strong> ");
        if (borrower.getDecisionDate() != null) {
            try {
                content.append(borrower.getDecisionDate().format(DateTimeFormatter.ofPattern("dd-MMM-yyyy")));
            } catch (Exception e) {
                content.append(borrower.getDecisionDate().toString());
            }
        } else {
            content.append("N/A");
        }
        content.append("</p>");
        content.append("<p><strong>Status:</strong> <span class='status-badge' style='background: #28a745; color: white;'>DECISION GIVEN</span></p>");
        content.append("</div>");

        // Case Information
        content.append("<div class='info-box'>");
        content.append("<h3>Case Information</h3>");
        content.append("<p><strong>Arbitration Number:</strong> <span style='color: #667eea; font-weight: bold;'>")
                .append(borrower.getArbitrationNumber()).append("</span></p>");
        content.append("<p><strong>Borrower Name:</strong> ").append(borrower.getBorrowerName()).append("</p>");
        content.append("<p><strong>Loan Number:</strong> ").append(borrower.getLoanNumber()).append("</p>");
        content.append("<p><strong>Membership No:</strong> ").append(borrower.getMembershipNo()).append("</p>");
        content.append("<p><strong>Society:</strong> ").append(submission.getSocietyName()).append("</p>");
        content.append("<p><strong>District:</strong> ").append(submission.getDistrictName()).append("</p>");
        content.append("</div>");

        // Financial Details
        content.append("<h3>Financial Details & Decision</h3>");
        content.append("<table>");
        content.append("<tr><th>Description</th><th>Amount (Rs.)</th></tr>");
        content.append("<tr><td><strong>Original Loan Amount</strong></td><td>")
                .append(String.format("%,.2f", borrower.getLoanAmount())).append("</td></tr>");
        content.append("<tr><td><strong>Original Interest Rate</strong></td><td>")
                .append(String.format("%.2f", borrower.getInterest())).append("%</td></tr>");
//        content.append("<tr style='background: #fff3cd;'><td><strong>Interest Deducted</strong></td><td>")
//                .append(String.format("%,.2f", borrower.getInterestDeducted())).append("</td></tr>");
//        content.append("<tr style='background: #d4edda;'><td><strong>Final Loan Amount</strong></td><td style='font-weight: bold; font-size: 16px; color: #28a745;'>")
//                .append(String.format("%,.2f", borrower.getFinalLoanAmount())).append("</td></tr>");
        content.append("</table>");

        // Arbitration Decision
        content.append("<div class='info-box' style='background: #e7f3ff; border-left: 4px solid #007bff;'>");
        content.append("<h3>📋 Arbitration Decision</h3>");
        content.append("<p style='white-space: pre-wrap; line-height: 1.8;'>")
                .append(borrower.getArbitrationDecision()).append("</p>");
        content.append("</div>");

        // Borrower Additional Details
        content.append("<div class='info-box'>");
        content.append("<h3>Additional Borrower Details</h3>");
        content.append("<p><strong>Address:</strong> ").append(borrower.getBorrowerAddress()).append("</p>");
        content.append("<p><strong>Guarantor 1:</strong> ").append(borrower.getGuarantor1Name()).append("</p>");
        content.append("<p><strong>Guarantor 2:</strong> ").append(borrower.getGuarantor2Name()).append("</p>");
        content.append("</div>");

        if (isDistrictOffice) {
            content.append("<div class='info-box' style='background: #fff3cd; border-left: 4px solid #ffc107;'>");
            content.append("<h3>⚠️ Next Steps</h3>");
            content.append("<p>Please review this decision and take any necessary follow-up actions as per your district procedures.</p>");
            content.append("</div>");
        } else {
            content.append("<div class='info-box' style='background: #d4edda; border-left: 4px solid #28a745;'>");
            content.append("<h3>✅ What This Means</h3>");
            content.append("<p>The arbitration process for this borrower has been completed. The final loan amount and decision have been determined by the arbitration officer.</p>");
            content.append("<p>If you have any questions about this decision, please contact the district office.</p>");
            content.append("</div>");
        }

        content.append("<div style='text-align: center; margin: 30px 0;'>");
        content.append("<a href='").append(baseUrl).append("/dashboard' class='button'>View Full Details</a>");
        content.append("</div>");

        content.append("<p>Best regards,<br>").append(companyName).append(" Arbitration Management System</p>");
        content.append("</div>");

        content.append(buildEmailFooter());

        return content.toString();
    }

    // ========================================
// 6. LEGAL CASE ASSIGNMENT TO LEGAL OFFICER
// ========================================
    @Async
    public void sendLegalCaseAssignmentNotification(String toEmail, String officerName,
                                                    Submission submission, Borrower borrower,
                                                    String courtName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(new InternetAddress(fromEmail, companyName + " Arbitration Management System"));
            helper.setTo(toEmail);
            helper.setSubject(String.format("[%s] New Legal Case Assigned - %s",
                    companyName, borrower.getArbitrationNumber()));

            String emailContent = buildLegalCaseAssignmentEmail(officerName, submission, borrower, courtName);
            helper.setText(emailContent, true);

            mailSender.send(message);
            System.out.println("✅ Legal case assignment notification sent to: " + toEmail);
        } catch (Exception e) {
            System.err.println("❌ Failed to send email to " + toEmail + ": " + e.getMessage());
        }
    }

    private String buildLegalCaseAssignmentEmail(String officerName, Submission submission,
                                                 Borrower borrower, String courtName) {
        StringBuilder content = new StringBuilder();

        content.append(buildEmailHeader("New Legal Case Assigned to You"));

        content.append("<div class='content'>");
        content.append("<p>Dear ").append(officerName).append(",</p>");
        content.append("<p>A new legal case has been assigned to you for court proceedings. Please review the case details below.</p>");

        content.append("<div class='info-box' style='background: #fff3cd; border-left: 4px solid #ffc107;'>");
        content.append("<h3>⚠️ New Case Assignment</h3>");
        content.append("<p><strong>Arbitration Number:</strong> <span style='color: #667eea; font-weight: bold;'>")
                .append(borrower.getArbitrationNumber()).append("</span></p>");
        content.append("<p><strong>Court:</strong> ").append(courtName).append("</p>");
        content.append("<p><strong>Assignment Date:</strong> ").append(borrower.getLegalAssignmentDate().format(DATE_FORMATTER)).append("</p>");
        content.append("</div>");

        // Case Details
        content.append("<div class='info-box'>");
        content.append("<h3>Case Information</h3>");
        content.append("<p><strong>Borrower Name:</strong> ").append(borrower.getBorrowerName()).append("</p>");
        content.append("<p><strong>Borrower Address:</strong> ").append(borrower.getBorrowerAddress()).append("</p>");
        content.append("<p><strong>Membership No:</strong> ").append(borrower.getMembershipNo()).append("</p>");
        content.append("<p><strong>Loan Number:</strong> ").append(borrower.getLoanNumber()).append("</p>");
        content.append("<p><strong>Society:</strong> ").append(submission.getSocietyName()).append("</p>");
        content.append("<p><strong>District:</strong> ").append(submission.getDistrictName()).append("</p>");
        content.append("</div>");

        // Financial Information
        content.append("<h3>Financial Details</h3>");
        content.append("<table>");
        content.append("<tr><th>Description</th><th>Amount (Rs.)</th></tr>");
        content.append("<tr><td>Original Loan Amount</td><td>").append(String.format("%,.2f", borrower.getLoanAmount())).append("</td></tr>");
        content.append("<tr><td>Interest Rate</td><td>").append(String.format("%.2f", borrower.getInterest())).append("%</td></tr>");
//        content.append("<tr><td>Final Loan Amount (After Arbitration)</td><td><strong>")
//                .append(String.format("%,.2f", borrower.getFinalLoanAmount())).append("</strong></td></tr>");
//        content.append("<tr><td>Interest Deducted</td><td>").append(String.format("%,.2f", borrower.getInterestDeducted())).append("</td></tr>");
        content.append("</table>");

        // Arbitration Decision
        content.append("<div class='info-box' style='background: #e7f3ff; border-left: 4px solid #007bff;'>");
        content.append("<h3>Previous Arbitration Decision</h3>");
        content.append("<p><strong>Decision Date:</strong> ").append(borrower.getDecisionDate().format(DateTimeFormatter.ofPattern("dd-MMM-yyyy"))).append("</p>");
        content.append("<p><strong>Arbitration Officer:</strong> ").append(borrower.getAssignedOfficerName()).append("</p>");
        content.append("<p style='white-space: pre-wrap; margin-top: 10px;'>").append(borrower.getArbitrationDecision()).append("</p>");
        content.append("</div>");

        // Guarantor Information
        content.append("<div class='info-box'>");
        content.append("<h3>Guarantor Information</h3>");
        content.append("<p><strong>Guarantor 1:</strong> ").append(borrower.getGuarantor1Name()).append("</p>");
        content.append("<p><strong>Guarantor 2:</strong> ").append(borrower.getGuarantor2Name()).append("</p>");
        content.append("</div>");

        content.append("<div class='info-box' style='background: #d4edda; border-left: 4px solid #28a745;'>");
        content.append("<h3>💡 Next Steps</h3>");
        content.append("<p>Please prepare the case for court proceedings. Once the judgment is received, you can update the system with:</p>");
        content.append("<ul style='margin: 10px 0; padding-left: 20px;'>");
        content.append("<li>Judgment Date</li>");
        content.append("<li>Judgment Number</li>");
        content.append("<li>Judgment Result</li>");
        content.append("</ul>");
        content.append("</div>");

        content.append("<div style='text-align: center; margin: 30px 0;'>");
        content.append("<a href='").append(baseUrl).append("/dashboard' class='button'>View Case Details</a>");
        content.append("</div>");

        content.append("<p>Best regards,<br>").append(companyName).append(" Arbitration Management System</p>");
        content.append("</div>");

        content.append(buildEmailFooter());

        return content.toString();
    }

    // ========================================
// 7. LEGAL CASE NOTIFICATION TO SOCIETY
// ========================================
    @Async
    public void sendLegalCaseNotificationToSociety(String toEmail, String recipientName,
                                                   Submission submission, Borrower borrower,
                                                   String legalOfficerName, String courtName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(new InternetAddress(fromEmail, companyName + " Arbitration Management System"));
            helper.setTo(toEmail);
            helper.setSubject(String.format("[%s] Case Forwarded to Legal Proceedings - %s",
                    companyName, borrower.getBorrowerName()));

            String emailContent = buildLegalCaseNotificationToSocietyEmail(recipientName, submission, borrower,
                    legalOfficerName, courtName);
            helper.setText(emailContent, true);

            mailSender.send(message);
            System.out.println("✅ Legal case notification sent to society: " + toEmail);
        } catch (Exception e) {
            System.err.println("❌ Failed to send email to " + toEmail + ": " + e.getMessage());
        }
    }

    private String buildLegalCaseNotificationToSocietyEmail(String recipientName, Submission submission,
                                                            Borrower borrower, String legalOfficerName,
                                                            String courtName) {
        StringBuilder content = new StringBuilder();

        content.append(buildEmailHeader("Case Forwarded to Legal Proceedings"));

        content.append("<div class='content'>");
        content.append("<p>Dear ").append(recipientName).append(",</p>");
        content.append("<p>This is to inform you that one of your society's borrower cases has been forwarded to legal proceedings due to non-payment after arbitration decision.</p>");

        content.append("<div class='info-box' style='background: #fff3cd; border-left: 4px solid #ffc107;'>");
        content.append("<h3>⚖️ Legal Case Information</h3>");
        content.append("<p><strong>Arbitration Number:</strong> <span style='color: #667eea; font-weight: bold;'>")
                .append(borrower.getArbitrationNumber()).append("</span></p>");
        content.append("<p><strong>Legal Officer:</strong> ").append(legalOfficerName).append("</p>");
        content.append("<p><strong>Court:</strong> ").append(courtName).append("</p>");
        content.append("<p><strong>Legal Assignment Date:</strong> ").append(borrower.getLegalAssignmentDate().format(DATE_FORMATTER)).append("</p>");
        content.append("</div>");

        // Borrower Details
        content.append("<div class='info-box'>");
        content.append("<h3>Borrower Details</h3>");
        content.append("<p><strong>Name:</strong> ").append(borrower.getBorrowerName()).append("</p>");
        content.append("<p><strong>Membership No:</strong> ").append(borrower.getMembershipNo()).append("</p>");
        content.append("<p><strong>Loan Number:</strong> ").append(borrower.getLoanNumber()).append("</p>");
        content.append("<p><strong>Address:</strong> ").append(borrower.getBorrowerAddress()).append("</p>");
        content.append("</div>");

        // Financial Summary
        content.append("<h3>Financial Summary</h3>");
        content.append("<table>");
        content.append("<tr><th>Description</th><th>Amount (Rs.)</th></tr>");
        content.append("<tr><td>Original Loan Amount</td><td>").append(String.format("%,.2f", borrower.getLoanAmount())).append("</td></tr>");
//        content.append("<tr><td>Final Amount (After Arbitration)</td><td><strong>")
//                .append(String.format("%,.2f", borrower.getFinalLoanAmount())).append("</strong></td></tr>");
        content.append("</table>");

        content.append("<div class='info-box' style='background: #f8d7da; border-left: 4px solid #dc3545;'>");
        content.append("<h3>Why Legal Action?</h3>");
        content.append("<p>This case was forwarded to legal proceedings because the borrower did not make payment within the required timeframe after the arbitration decision.</p>");
        content.append("</div>");

        content.append("<div style='text-align: center; margin: 30px 0;'>");
        content.append("<a href='").append(baseUrl).append("/dashboard' class='button'>View Case Details</a>");
        content.append("</div>");

        content.append("<p>Best regards,<br>").append(companyName).append(" Arbitration Management System</p>");
        content.append("</div>");

        content.append(buildEmailFooter());

        return content.toString();
    }

    // ========================================
// 8. JUDGMENT NOTIFICATION
// ========================================
    @Async
    public void sendJudgmentNotification(String toEmail, String recipientName,
                                         Submission submission, Borrower borrower,
                                         String legalOfficerName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(new InternetAddress(fromEmail, companyName + " Arbitration Management System"));
            helper.setTo(toEmail);
            helper.setSubject(String.format("[%s] Court Judgment Received - %s",
                    companyName, borrower.getArbitrationNumber()));

            String emailContent = buildJudgmentNotificationEmail(recipientName, submission, borrower, legalOfficerName);
            helper.setText(emailContent, true);

            mailSender.send(message);
            System.out.println("✅ Judgment notification sent to: " + toEmail);
        } catch (Exception e) {
            System.err.println("❌ Failed to send email to " + toEmail + ": " + e.getMessage());
        }
    }

    private String buildJudgmentNotificationEmail(String recipientName, Submission submission,
                                                  Borrower borrower, String legalOfficerName) {
        StringBuilder content = new StringBuilder();

        content.append(buildEmailHeader("Court Judgment Received"));

        content.append("<div class='content'>");
        content.append("<p>Dear ").append(recipientName).append(",</p>");
        content.append("<p>A court judgment has been received for the following case. Please review the judgment details below.</p>");

        content.append("<div class='info-box' style='background: #d4edda; border-left: 4px solid #28a745;'>");
        content.append("<h3>⚖️ Judgment Received</h3>");
        content.append("<p><strong>Arbitration Number:</strong> <span style='color: #667eea; font-weight: bold;'>")
                .append(borrower.getArbitrationNumber()).append("</span></p>");
        content.append("<p><strong>Judgment Date:</strong> ").append(borrower.getJudgmentDate().format(DateTimeFormatter.ofPattern("dd-MMM-yyyy"))).append("</p>");
        content.append("<p><strong>Judgment Number:</strong> ").append(borrower.getJudgmentNumber()).append("</p>");
        content.append("<p><strong>Legal Officer:</strong> ").append(legalOfficerName).append("</p>");
        content.append("</div>");

        // Case Information
        content.append("<div class='info-box'>");
        content.append("<h3>Case Information</h3>");
        content.append("<p><strong>Borrower Name:</strong> ").append(borrower.getBorrowerName()).append("</p>");
        content.append("<p><strong>Membership No:</strong> ").append(borrower.getMembershipNo()).append("</p>");
        content.append("<p><strong>Loan Number:</strong> ").append(borrower.getLoanNumber()).append("</p>");
        content.append("<p><strong>Court:</strong> ").append(borrower.getAssignedCourtName()).append("</p>");
        content.append("<p><strong>Society:</strong> ").append(submission.getSocietyName()).append("</p>");
        content.append("<p><strong>District:</strong> ").append(submission.getDistrictName()).append("</p>");
        content.append("</div>");

        // Judgment Result
        content.append("<div class='info-box' style='background: #e7f3ff; border-left: 4px solid #007bff;'>");
        content.append("<h3>📋 Judgment Result</h3>");
        content.append("<p style='white-space: pre-wrap; line-height: 1.8; font-size: 15px;'>")
                .append(borrower.getJudgmentResult()).append("</p>");
        content.append("</div>");

        // Financial Details
        content.append("<h3>Financial Summary</h3>");
        content.append("<table>");
        content.append("<tr><th>Description</th><th>Amount (Rs.)</th></tr>");
        content.append("<tr><td>Original Loan Amount</td><td>").append(String.format("%,.2f", borrower.getLoanAmount())).append("</td></tr>");
//        content.append("<tr><td>Final Amount (After Arbitration)</td><td>")
//                .append(String.format("%,.2f", borrower.getFinalLoanAmount())).append("</td></tr>");
        content.append("</table>");

        content.append("<div style='text-align: center; margin: 30px 0;'>");
        content.append("<a href='").append(baseUrl).append("/dashboard' class='button'>View Full Case Details</a>");
        content.append("</div>");

        content.append("<p>Best regards,<br>").append(companyName).append(" Arbitration Management System</p>");
        content.append("</div>");

        content.append(buildEmailFooter());

        return content.toString();
    }

    // ========================================
    // EMAIL TEMPLATE HELPERS
    // ========================================
    private String buildEmailHeader(String title) {
        StringBuilder header = new StringBuilder();

        header.append("<!DOCTYPE html>");
        header.append("<html><head>");
        header.append("<meta charset='UTF-8'>");
        header.append("<style>");
        header.append("body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f4f4f4; }");
        header.append(".container { max-width: 650px; margin: 20px auto; background: #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }");
        header.append(".header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }");
        header.append(".header h1 { margin: 0; font-size: 24px; font-weight: bold; }");
        header.append(".content { padding: 30px; }");
        header.append(".info-box { background: #f8f9fa; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px; }");
        header.append(".info-box h3 { margin-top: 0; color: #667eea; font-size: 18px; }");
        header.append(".info-box p { margin: 8px 0; }");
        header.append("table { width: 100%; border-collapse: collapse; margin: 20px 0; }");
        header.append("th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; font-size: 14px; }");
        header.append("th { background: #667eea; color: white; font-weight: bold; }");
        header.append("tr:nth-child(even) { background: #f8f9fa; }");
        header.append("tr:hover { background: #e9ecef; }");
        header.append(".button { display: inline-block; background: #667eea; color: white !important; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; }");
        header.append(".button:hover { background: #764ba2; }");
        header.append(".footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; border-top: 1px solid #dee2e6; }");
        header.append(".action-required { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }");
        header.append(".status-badge { padding: 4px 8px; border-radius: 3px; font-size: 11px; font-weight: bold; }");
        header.append(".status-assigned { background: #d4edda; color: #155724; }");
        header.append(".status-pending { background: #fff3cd; color: #856404; }");
        header.append(".status-decision-given { background: #cce5ff; color: #004085; }");
        header.append("ol, ul { line-height: 1.8; }");
        header.append("</style>");
        header.append("</head><body>");
        header.append("<div class='container'>");
        header.append("<div class='header'>");
        header.append("<h1>").append(title).append("</h1>");
        header.append("</div>");

        return header.toString();
    }

    private String buildEmailFooter() {
        StringBuilder footer = new StringBuilder();

        footer.append("<div class='footer'>");
        footer.append("<p><strong>").append(companyName).append(" Cooperative Development & Arbitration Management System</strong></p>");
        footer.append("<p>This is an automated notification. Please do not reply to this email.</p>");
        footer.append("<p>For support or questions, contact your system administrator.</p>");
        footer.append("<p style='margin-top: 15px;'>&copy; 2025 ").append(companyName).append(". All rights reserved.</p>");
        footer.append("</div>");
        footer.append("</div></body></html>");

        return footer.toString();
    }

    // ========================================
// 9. UNPAID CASES TO APPROVAL OFFICER
// ========================================
    @Async
    public void sendUnpaidCasesForApprovalNotification(String toEmail, String approverName,
                                                       int casesCount) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(new InternetAddress(fromEmail, companyName + " Arbitration Management System"));
            helper.setTo(toEmail);
            helper.setSubject(String.format("[%s] Unpaid Cases Awaiting Your Approval - %d Cases",
                    companyName, casesCount));

            String emailContent = buildUnpaidCasesForApprovalEmail(approverName, casesCount);
            helper.setText(emailContent, true);

            mailSender.send(message);
            System.out.println("✅ Unpaid cases approval notification sent to: " + toEmail);
        } catch (Exception e) {
            System.err.println("❌ Failed to send email to " + toEmail + ": " + e.getMessage());
        }
    }

    private String buildUnpaidCasesForApprovalEmail(String approverName, int casesCount) {
        StringBuilder content = new StringBuilder();

        content.append(buildEmailHeader("Unpaid Cases Awaiting Your Approval"));

        content.append("<div class='content'>");
        content.append("<p>Dear ").append(approverName).append(",</p>");
        content.append("<p>The Society Admin has submitted <strong>").append(casesCount)
                .append("</strong> unpaid borrower case(s) that require your approval before being forwarded to the District Office.</p>");

        content.append("<div class='info-box' style='background: #fff3cd; border-left: 4px solid #ffc107;'>");
        content.append("<h3>⚠️ Action Required</h3>");
        content.append("<p><strong>Number of Cases:</strong> ").append(casesCount).append("</p>");
        content.append("<p><strong>Status:</strong> Awaiting Your Approval</p>");
        content.append("<p><strong>Submission Date:</strong> ").append(LocalDateTime.now().format(DATE_FORMATTER)).append("</p>");
        content.append("</div>");

        content.append("<div class='info-box' style='background: #f8d7da; border-left: 4px solid #dc3545;'>");
        content.append("<h3>📋 About These Cases</h3>");
        content.append("<p>These are borrowers who:</p>");
        content.append("<ul style='margin: 10px 0; padding-left: 20px;'>");
        content.append("<li>Have received arbitration decisions</li>");
        content.append("<li>Have <strong>NOT</strong> made payment after the arbitration decision</li>");
        content.append("<li>Need to be forwarded to the District Office for legal proceedings</li>");
        content.append("</ul>");
        content.append("</div>");

        content.append("<div class='info-box' style='background: #e7f3ff; border-left: 4px solid #007bff;'>");
        content.append("<h3>💡 What You Need to Do</h3>");
        content.append("<ol style='margin: 10px 0; padding-left: 20px;'>");
        content.append("<li><strong>Review Each Case:</strong> Check the arbitration decision and payment status</li>");
        content.append("<li><strong>Verify Information:</strong> Ensure all case details are accurate</li>");
        content.append("<li><strong>Approve Cases:</strong> Approve the cases to forward them to the District Office</li>");
        content.append("<li><strong>District Will Handle:</strong> Once approved, the District Office will assign legal officers</li>");
        content.append("</ol>");
        content.append("</div>");

        content.append("<div style='background: #d4edda; border: 2px solid #c3e6cb; border-radius: 5px; padding: 15px; margin: 20px 0; text-align: center;'>");
        content.append("<p style='margin: 0; color: #155724; font-size: 16px; font-weight: bold;'>");
        content.append("⏰ These cases are pending your review and approval to proceed to legal action.");
        content.append("</p>");
        content.append("</div>");

        content.append("<div style='text-align: center; margin: 30px 0;'>");
        content.append("<a href='").append(baseUrl).append("/dashboard' class='button' style='font-size: 16px; padding: 15px 40px;'>Review & Approve Cases</a>");
        content.append("</div>");

        content.append("<p>If you have any questions about these cases, please contact the Society Admin or District Office.</p>");
        content.append("<p>Best regards,<br>").append(companyName).append(" Arbitration Management System</p>");
        content.append("</div>");

        content.append(buildEmailFooter());

        return content.toString();
    }

    // ========================================
// 10. APPROVED UNPAID CASES TO DISTRICT
// ========================================
    @Async
    public void sendUnpaidCasesToDistrictNotification(String toEmail, String adminName,
                                                      int casesCount) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(new InternetAddress(fromEmail, companyName + " Arbitration Management System"));
            helper.setTo(toEmail);
            helper.setSubject(String.format("[%s] Approved Unpaid Cases for Legal Action - %d Cases",
                    companyName, casesCount));

            String emailContent = buildUnpaidCasesToDistrictEmail(adminName, casesCount);
            helper.setText(emailContent, true);

            mailSender.send(message);
            System.out.println("✅ Unpaid cases district notification sent to: " + toEmail);
        } catch (Exception e) {
            System.err.println("❌ Failed to send email to " + toEmail + ": " + e.getMessage());
        }
    }

    private String buildUnpaidCasesToDistrictEmail(String adminName, int casesCount) {
        StringBuilder content = new StringBuilder();

        content.append(buildEmailHeader("Approved Unpaid Cases - Legal Action Required"));

        content.append("<div class='content'>");
        content.append("<p>Dear ").append(adminName).append(",</p>");
        content.append("<p>A society has submitted <strong>").append(casesCount)
                .append("</strong> approved unpaid borrower case(s) that require legal action. These cases need to be assigned to legal officers for court proceedings.</p>");

        content.append("<div class='info-box' style='background: #f8d7da; border-left: 4px solid #dc3545;'>");
        content.append("<h3>⚖️ Legal Action Required</h3>");
        content.append("<p><strong>Number of Cases:</strong> ").append(casesCount).append("</p>");
        content.append("<p><strong>Status:</strong> Payment Pending - Legal Action Required</p>");
        content.append("<p><strong>Approval Date:</strong> ").append(LocalDateTime.now().format(DATE_FORMATTER)).append("</p>");
        content.append("</div>");

        content.append("<div class='info-box' style='background: #fff3cd; border-left: 4px solid #ffc107;'>");
        content.append("<h3>📋 Case Background</h3>");
        content.append("<p>These borrowers have:</p>");
        content.append("<ul style='margin: 10px 0; padding-left: 20px;'>");
        content.append("<li>✅ Received arbitration decisions from assigned officers</li>");
        content.append("<li>❌ <strong>Failed to make payment</strong> after the arbitration decision</li>");
        content.append("<li>✅ Been reviewed and approved by the Society Approval Officer</li>");
        content.append("<li>⚖️ <strong>Ready for legal proceedings</strong></li>");
        content.append("</ul>");
        content.append("</div>");

        content.append("<div class='info-box' style='background: #e7f3ff; border-left: 4px solid #007bff;'>");
        content.append("<h3>💡 Next Steps - Your Action Required</h3>");
        content.append("<ol style='margin: 10px 0; padding-left: 20px;'>");
        content.append("<li><strong>Review Cases:</strong> Check each borrower's arbitration decision and payment status</li>");
        content.append("<li><strong>Assign Legal Officers:</strong> Assign appropriate legal officers to handle these cases</li>");
        content.append("<li><strong>Select Courts:</strong> Determine which court will handle each case</li>");
        content.append("<li><strong>Initiate Legal Action:</strong> Legal officers will prepare cases for court proceedings</li>");
        content.append("</ol>");
        content.append("</div>");

        content.append("<div class='info-box' style='background: #d4edda; border-left: 4px solid #28a745;'>");
        content.append("<h3>🎯 What These Cases Include</h3>");
        content.append("<p>Each case will have:</p>");
        content.append("<ul style='margin: 10px 0; padding-left: 20px;'>");
        content.append("<li><strong>Arbitration Number:</strong> Unique case identifier</li>");
        content.append("<li><strong>Arbitration Decision:</strong> Officer's decision and final loan amount</li>");
        content.append("<li><strong>Borrower Details:</strong> Full borrower and guarantor information</li>");
        content.append("<li><strong>Payment History:</strong> Documentation of non-payment</li>");
        content.append("<li><strong>Financial Details:</strong> Original loan amount and final arbitrated amount</li>");
        content.append("</ul>");
        content.append("</div>");

        content.append("<div style='background: #fff3cd; border: 2px solid #ffc107; border-radius: 5px; padding: 15px; margin: 20px 0; text-align: center;'>");
        content.append("<p style='margin: 0; color: #856404; font-size: 16px; font-weight: bold;'>");
        content.append("⚠️ URGENT: These cases are now in your jurisdiction for legal proceedings.");
        content.append("</p>");
        content.append("</div>");

        content.append("<div style='text-align: center; margin: 30px 0;'>");
        content.append("<a href='").append(baseUrl).append("/dashboard' class='button' style='font-size: 16px; padding: 15px 40px;'>View Cases & Assign Legal Officers</a>");
        content.append("</div>");

        content.append("<p>Please process these cases at your earliest convenience to initiate the legal proceedings.</p>");
        content.append("<p>Best regards,<br>").append(companyName).append(" Arbitration Management System</p>");
        content.append("</div>");

        content.append(buildEmailFooter());

        return content.toString();
    }

// ========================================
// 11. COURT PAYMENT NOTIFICATION (UPDATED)
// ========================================
@Async
public void sendCourtPaymentUpdateNotification(String toEmail, String recipientName,
                                               Submission submission, Borrower borrower,
                                               String legalOfficerName, CourtPayment payment) {
    try {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(new InternetAddress(fromEmail, companyName + " Arbitration Management System"));
        helper.setTo(toEmail);
        helper.setSubject(String.format("[%s] Court Payment Added - %s",
                companyName, borrower.getArbitrationNumber()));

        String emailContent = buildCourtPaymentUpdateEmail(recipientName, submission, borrower,
                legalOfficerName, payment);
        helper.setText(emailContent, true);

        mailSender.send(message);
        System.out.println("✅ Court payment notification sent to: " + toEmail);
    } catch (Exception e) {
        System.err.println("❌ Failed to send email to " + toEmail + ": " + e.getMessage());
    }
}


    private String buildCourtPaymentUpdateEmail(String recipientName, Submission submission,
                                                Borrower borrower, String legalOfficerName,
                                                CourtPayment payment) {
        StringBuilder content = new StringBuilder();

        content.append(buildEmailHeader("Court Payment Added"));

        content.append("<div class='content'>");
        content.append("<p>Dear ").append(recipientName).append(",</p>");
        content.append("<p>A new payment has been recorded by the legal officer for the following case after court decision.</p>");

        // Payment Details Box
        content.append("<div class='info-box' style='background: #d4edda; border-left: 4px solid #28a745;'>");
        content.append("<h3>💰 Payment Details</h3>");
        content.append("<p><strong>Amount:</strong> <span style='font-size: 18px; font-weight: bold; color: #28a745;'>Rs. ")
                .append(String.format("%,.2f", payment.getAmount())).append("</span></p>");
        content.append("<p><strong>Payment Date:</strong> ")
                .append(payment.getPaymentDate().format(DateTimeFormatter.ofPattern("dd-MMM-yyyy")))
                .append("</p>");
        content.append("<p><strong>Added By:</strong> ").append(legalOfficerName)
                .append(" (Legal Officer)</p>");
        content.append("<p><strong>Added On:</strong> ")
                .append(payment.getAddedAt().format(DATE_FORMATTER))
                .append("</p>");
        content.append("</div>");

        // Case Information
        content.append("<div class='info-box'>");
        content.append("<h3>Case Information</h3>");
        content.append("<p><strong>Arbitration Number:</strong> <span style='color: #667eea; font-weight: bold;'>")
                .append(borrower.getArbitrationNumber()).append("</span></p>");
        content.append("<p><strong>Borrower Name:</strong> ").append(borrower.getBorrowerName()).append("</p>");
        content.append("<p><strong>Loan Number:</strong> ").append(borrower.getLoanNumber()).append("</p>");
        content.append("<p><strong>Society:</strong> ").append(submission.getSocietyName()).append("</p>");
        content.append("<p><strong>District:</strong> ").append(submission.getDistrictName()).append("</p>");
        content.append("</div>");

        // Court Details
        content.append("<div class='info-box' style='background: #e7f3ff; border-left: 4px solid #007bff;'>");
        content.append("<h3>⚖️ Court Details</h3>");
        content.append("<p><strong>Court:</strong> ").append(borrower.getAssignedCourtName()).append("</p>");
        content.append("<p><strong>Judgment Number:</strong> ").append(borrower.getJudgmentNumber()).append("</p>");
        content.append("<p><strong>Judgment Date:</strong> ")
                .append(borrower.getJudgmentDate().format(DateTimeFormatter.ofPattern("dd-MMM-yyyy")))
                .append("</p>");
        content.append("<p><strong>Judgment Result:</strong> <span style='color: ")
                .append("in-favor".equals(borrower.getJudgmentResult()) ? "#28a745" : "#dc3545")
                .append("; font-weight: bold;'>")
                .append("in-favor".equals(borrower.getJudgmentResult()) ? "IN FAVOR" : "NOT IN FAVOR")
                .append("</span></p>");
        content.append("</div>");

        // Payment History (if multiple payments exist)
        if (borrower.getCourtPayments() != null && borrower.getCourtPayments().size() > 1) {
            content.append("<div class='info-box'>");
            content.append("<h3>Payment History</h3>");
            content.append("<table>");
            content.append("<tr><th>Date</th><th>Amount (Rs.)</th><th>Added By</th></tr>");

            BigDecimal totalPaid = BigDecimal.ZERO;
            for (CourtPayment p : borrower.getCourtPayments()) {
                content.append("<tr");
                if (p.getId().equals(payment.getId())) {
                    content.append(" style='background: #d4edda; font-weight: bold;'");
                }
                content.append("><td>")
                        .append(p.getPaymentDate().format(DateTimeFormatter.ofPattern("dd-MMM-yyyy")))
                        .append("</td><td>")
                        .append(String.format("%,.2f", p.getAmount()))
                        .append("</td><td>")
                        .append(p.getAddedBy())
                        .append("</td></tr>");
                totalPaid = totalPaid.add(p.getAmount());
            }

            content.append("<tr style='background: #f8f9fa; font-weight: bold;'>");
            content.append("<td>Total Paid</td><td colspan='2'>")
                    .append(String.format("%,.2f", totalPaid))
                    .append("</td></tr>");
            content.append("</table>");
            content.append("</div>");
        }

        // Financial Summary
        content.append("<h3>Financial Summary</h3>");
        content.append("<table>");
        content.append("<tr><th>Description</th><th>Amount (Rs.)</th></tr>");
        content.append("<tr><td>Original Loan Amount</td><td>")
                .append(String.format("%,.2f", borrower.getLoanAmount())).append("</td></tr>");

//        if (borrower.getFinalLoanAmount() != null) {
//            content.append("<tr><td>Final Amount (After Arbitration)</td><td>")
//                    .append(String.format("%,.2f", borrower.getFinalLoanAmount())).append("</td></tr>");
//        }

        // Calculate total paid
        BigDecimal totalPaid = BigDecimal.ZERO;
        if (borrower.getCourtPayments() != null) {
            for (CourtPayment p : borrower.getCourtPayments()) {
                totalPaid = totalPaid.add(p.getAmount());
            }
        }

        content.append("<tr style='background: #d4edda;'><td><strong>Total Paid</strong></td><td><strong>")
                .append(String.format("%,.2f", totalPaid)).append("</strong></td></tr>");

        // Show remaining amount if final loan amount exists
//        if (borrower.getFinalLoanAmount() != null) {
//            BigDecimal remaining = borrower.getFinalLoanAmount().subtract(totalPaid);
//            String rowColor = remaining.compareTo(BigDecimal.ZERO) <= 0 ? "#d4edda" : "#fff3cd";
//            content.append("<tr style='background: ").append(rowColor).append(";'><td><strong>Remaining Amount</strong></td><td><strong>")
//                    .append(String.format("%,.2f", remaining)).append("</strong></td></tr>");
//        }

        content.append("</table>");

        // Special remarks if any
        if (borrower.getLegalOfficerRemarks() != null && !borrower.getLegalOfficerRemarks().isEmpty()) {
            content.append("<div class='info-box' style='background: #fff3cd; border-left: 4px solid #ffc107;'>");
            content.append("<h3>📝 Legal Officer Remarks</h3>");
            content.append("<p style='white-space: pre-wrap; line-height: 1.8;'>")
                    .append(borrower.getLegalOfficerRemarks()).append("</p>");
            content.append("</div>");
        }

        content.append("<div style='text-align: center; margin: 30px 0;'>");
        content.append("<a href='").append(baseUrl).append("/dashboard' class='button'>View Full Case Details</a>");
        content.append("</div>");

        content.append("<p>Best regards,<br>").append(companyName).append(" Arbitration Management System</p>");
        content.append("</div>");

        content.append(buildEmailFooter());

        return content.toString();
    }
    // ========================================
// 12. LEGAL OFFICER REMARKS NOTIFICATION (UNCHANGED)
// ========================================
    @Async
    public void sendLegalRemarksUpdateNotification(String toEmail, String recipientName,
                                                   Submission submission, Borrower borrower,
                                                   String legalOfficerName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(new InternetAddress(fromEmail, companyName + " Arbitration Management System"));
            helper.setTo(toEmail);
            helper.setSubject(String.format("[%s] Legal Officer Added Remarks - %s",
                    companyName, borrower.getArbitrationNumber()));

            String emailContent = buildLegalRemarksUpdateEmail(recipientName, submission, borrower,
                    legalOfficerName);
            helper.setText(emailContent, true);

            mailSender.send(message);
            System.out.println("✅ Legal remarks update notification sent to: " + toEmail);
        } catch (Exception e) {
            System.err.println("❌ Failed to send email to " + toEmail + ": " + e.getMessage());
        }
    }

    private String buildLegalRemarksUpdateEmail(String recipientName, Submission submission,
                                                Borrower borrower, String legalOfficerName) {
        StringBuilder content = new StringBuilder();

        content.append(buildEmailHeader("Legal Officer Added Special Remarks"));

        content.append("<div class='content'>");
        content.append("<p>Dear ").append(recipientName).append(",</p>");
        content.append("<p>The legal officer has added special remarks for the following case. These remarks may contain important information about the case proceedings.</p>");

        content.append("<div class='info-box' style='background: #e7f3ff; border-left: 4px solid #007bff;'>");
        content.append("<h3>📝 Remarks Added</h3>");
        content.append("<p><strong>Added By:</strong> ").append(legalOfficerName)
                .append(" (Legal Officer)</p>");
        content.append("<p><strong>Date:</strong> ").append(LocalDateTime.now().format(DATE_FORMATTER))
                .append("</p>");
        content.append("</div>");

        // Case Information
        content.append("<div class='info-box'>");
        content.append("<h3>Case Information</h3>");
        content.append("<p><strong>Arbitration Number:</strong> <span style='color: #667eea; font-weight: bold;'>")
                .append(borrower.getArbitrationNumber()).append("</span></p>");
        content.append("<p><strong>Borrower Name:</strong> ").append(borrower.getBorrowerName()).append("</p>");
        content.append("<p><strong>Court:</strong> ").append(borrower.getAssignedCourtName()).append("</p>");
        content.append("<p><strong>Society:</strong> ").append(submission.getSocietyName()).append("</p>");
        content.append("<p><strong>District:</strong> ").append(submission.getDistrictName()).append("</p>");
        content.append("</div>");

        // Remarks Content
        if (borrower.getLegalOfficerRemarks() != null && !borrower.getLegalOfficerRemarks().isEmpty()) {
            content.append("<div class='info-box' style='background: #fff3cd; border-left: 4px solid #ffc107;'>");
            content.append("<h3>💬 Special Remarks</h3>");
            content.append("<p style='white-space: pre-wrap; line-height: 1.8; font-size: 14px;'>")
                    .append(borrower.getLegalOfficerRemarks()).append("</p>");
            content.append("</div>");
        }

        content.append("<div style='text-align: center; margin: 30px 0;'>");
        content.append("<a href='").append(baseUrl).append("/dashboard' class='button'>View Full Case Details</a>");
        content.append("</div>");

        content.append("<p>Best regards,<br>").append(companyName).append(" Arbitration Management System</p>");
        content.append("</div>");

        content.append(buildEmailFooter());

        return content.toString();
    }

    public void sendLegalActionSubmissionNotification(String email, String name, int count) {
    }

    public void sendJudgmentUpdateNotification(String email, String name, Submission submission, Borrower borrower, String legalOfficerName, Judgment judgment) {
    }
}
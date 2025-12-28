package com.CooperativeDevelopmentManagementSystem.DCDSystem.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.ArrayList;  // ⭐ ADD THIS
import java.util.List;        // ⭐ ADD THIS

import java.math.BigDecimal;
import java.time.LocalDate;
//
//@Data
//@Builder
//@NoArgsConstructor
//@AllArgsConstructor
//public class Borrower {
//    private String id;
//
//    private String registrationNo;
//
//    private String registeredAddress;
//
//    private LocalDate registrationDate;
//
//    private String loanNumber;
//
//    private String borrowerName;
//
//    private String borrowerAddress;
//
//    private String membershipNo;
//
//    private String guarantor1Name;
//
//    private String guarantor1Address;
//
//    private String guarantor1MembershipNo;
//
//    private String guarantor2Name;
//
//    private String guarantor2Address;
//
//    private String guarantor2MembershipNo;
//
//    private BigDecimal loanAmount;
//
//    private BigDecimal interest;
//
//    private BigDecimal interestRate;
//
//    private BigDecimal stationeryFees;
//
//    private Boolean arbitrationFeePaid;
//
//    private String arbitrationNumber;
//
//    private String assignedOfficerId;
//
//    private String assignedOfficerName;
//
//    private String status; // pending, assigned, decision-given
//
//    private LocalDate decisionDate;
//
//    private BigDecimal finalLoanAmount;
//
//    private BigDecimal interestDeducted;
//
//    private String arbitrationDecision;
//
//    public String getId() {
//        return id;
//    }
//
//    public void setId(String id) {
//        this.id = id;
//    }
//
//    public String getRegistrationNo() {
//        return registrationNo;
//    }
//
//    public void setRegistrationNo(String registrationNo) {
//        this.registrationNo = registrationNo;
//    }
//
//    public String getRegisteredAddress() {
//        return registeredAddress;
//    }
//
//    public void setRegisteredAddress(String registeredAddress) {
//        this.registeredAddress = registeredAddress;
//    }
//
//    public LocalDate getRegistrationDate() {
//        return registrationDate;
//    }
//
//    public void setRegistrationDate(LocalDate registrationDate) {
//        this.registrationDate = registrationDate;
//    }
//
//    public String getLoanNumber() {
//        return loanNumber;
//    }
//
//    public void setLoanNumber(String loanNumber) {
//        this.loanNumber = loanNumber;
//    }
//
//    public String getBorrowerName() {
//        return borrowerName;
//    }
//
//    public void setBorrowerName(String borrowerName) {
//        this.borrowerName = borrowerName;
//    }
//
//    public String getBorrowerAddress() {
//        return borrowerAddress;
//    }
//
//    public void setBorrowerAddress(String borrowerAddress) {
//        this.borrowerAddress = borrowerAddress;
//    }
//
//    public String getMembershipNo() {
//        return membershipNo;
//    }
//
//    public void setMembershipNo(String membershipNo) {
//        this.membershipNo = membershipNo;
//    }
//
//    public String getGuarantor1Name() {
//        return guarantor1Name;
//    }
//
//    public void setGuarantor1Name(String guarantor1Name) {
//        this.guarantor1Name = guarantor1Name;
//    }
//
//    public String getGuarantor1Address() {
//        return guarantor1Address;
//    }
//
//    public void setGuarantor1Address(String guarantor1Address) {
//        this.guarantor1Address = guarantor1Address;
//    }
//
//    public String getGuarantor1MembershipNo() {
//        return guarantor1MembershipNo;
//    }
//
//    public void setGuarantor1MembershipNo(String guarantor1MembershipNo) {
//        this.guarantor1MembershipNo = guarantor1MembershipNo;
//    }
//
//    public String getGuarantor2Name() {
//        return guarantor2Name;
//    }
//
//    public void setGuarantor2Name(String guarantor2Name) {
//        this.guarantor2Name = guarantor2Name;
//    }
//
//    public String getGuarantor2Address() {
//        return guarantor2Address;
//    }
//
//    public void setGuarantor2Address(String guarantor2Address) {
//        this.guarantor2Address = guarantor2Address;
//    }
//
//    public String getGuarantor2MembershipNo() {
//        return guarantor2MembershipNo;
//    }
//
//    public void setGuarantor2MembershipNo(String guarantor2MembershipNo) {
//        this.guarantor2MembershipNo = guarantor2MembershipNo;
//    }
//
//    public BigDecimal getLoanAmount() {
//        return loanAmount;
//    }
//
//    public void setLoanAmount(BigDecimal loanAmount) {
//        this.loanAmount = loanAmount;
//    }
//
//    public BigDecimal getInterest() {
//        return interest;
//    }
//
//    public void setInterest(BigDecimal interest) {
//        this.interest = interest;
//    }
//
//    public BigDecimal getInterestRate() {
//        return interestRate;
//    }
//
//    public void setInterestRate(BigDecimal interestRate) {
//        this.interestRate = interestRate;
//    }
//
//    public BigDecimal getStationeryFees() {
//        return stationeryFees;
//    }
//
//    public void setStationeryFees(BigDecimal stationeryFees) {
//        this.stationeryFees = stationeryFees;
//    }
//
//    public Boolean getArbitrationFeePaid() {
//        return arbitrationFeePaid;
//    }
//
//    public void setArbitrationFeePaid(Boolean arbitrationFeePaid) {
//        this.arbitrationFeePaid = arbitrationFeePaid;
//    }
//
//    public String getArbitrationNumber() {
//        return arbitrationNumber;
//    }
//
//    public void setArbitrationNumber(String arbitrationNumber) {
//        this.arbitrationNumber = arbitrationNumber;
//    }
//
//    public String getAssignedOfficerId() {
//        return assignedOfficerId;
//    }
//
//    public void setAssignedOfficerId(String assignedOfficerId) {
//        this.assignedOfficerId = assignedOfficerId;
//    }
//
//    public String getAssignedOfficerName() {
//        return assignedOfficerName;
//    }
//
//    public void setAssignedOfficerName(String assignedOfficerName) {
//        this.assignedOfficerName = assignedOfficerName;
//    }
//
//    public String getStatus() {
//        return status;
//    }
//
//    public void setStatus(String status) {
//        this.status = status;
//    }
//
//    public LocalDate getDecisionDate() {
//        return decisionDate;
//    }
//
//    public void setDecisionDate(LocalDate decisionDate) {
//        this.decisionDate = decisionDate;
//    }
//
//    public BigDecimal getFinalLoanAmount() {
//        return finalLoanAmount;
//    }
//
//    public void setFinalLoanAmount(BigDecimal finalLoanAmount) {
//        this.finalLoanAmount = finalLoanAmount;
//    }
//
//    public BigDecimal getInterestDeducted() {
//        return interestDeducted;
//    }
//
//    public void setInterestDeducted(BigDecimal interestDeducted) {
//        this.interestDeducted = interestDeducted;
//    }
//
//    public String getArbitrationDecision() {
//        return arbitrationDecision;
//    }
//
//    public void setArbitrationDecision(String arbitrationDecision) {
//        this.arbitrationDecision = arbitrationDecision;
//    }
//}




import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor





public class Borrower {
    private String id;

    // Basic Information
    private String borrowerName;
    private String borrowerNIC;
    private String borrowerAddress;
    private String membershipNo;

    // Registration Details
    private String registrationNo;
    private String registeredAddress;
    private LocalDate registrationDate;

    // Loan Information
    private String loanNumber;
    private String loanType; // ණය, විවිධ, තැන්පතු
    private BigDecimal loanAmount;
    private BigDecimal outstandingLoanAmount; // හිග ණය ශේෂය
    private BigDecimal interest;
    private BigDecimal interestRate;
    private BigDecimal stationeryFees;

    // Guarantor 1
    private String guarantor1Name;
    private String guarantor1NIC;
    private String guarantor1Address;
    private String guarantor1MembershipNo;

    // Guarantor 2
    private String guarantor2Name;
    private String guarantor2NIC;
    private String guarantor2Address;
    private String guarantor2MembershipNo;

    // Document Deficiency Check
    private Boolean documentDeficienciesChecked = false;
    private String documentDeficiencies;
    private LocalDateTime deficiencyCheckDate;
    private String deficiencyCheckedBy;

    // Arbitration Fee & Assignment
    private Boolean arbitrationFeePaid = false;
    private String arbitrationNumber;
    private String assignedOfficerId;
    private String assignedOfficerName;
    private LocalDateTime assignedDate;
    private String status;

    // ⭐ ENHANCED DECISION FIELDS
    private LocalDate decisionDate;
    private LocalDate appealDueDate;
    // Financial Decision Details
    private BigDecimal proposedLoanBalance;
    private BigDecimal proposedLoanInterest;
    private BigDecimal caseFees;
    private BigDecimal proposedTotalAmount;

    // Forward Interest
    private BigDecimal forwardInterest;
    private BigDecimal forwardInterestRate;

    // Deductions
    private BigDecimal deductionsFromLoanAmount;
    private BigDecimal deductionsFromInterestAmount;

    private BigDecimal courtCharges;
    private BigDecimal rebateDeductions;
    private BigDecimal bondAndInterest;
    private BigDecimal otherRebateDeductions;
    private BigDecimal totalDeductions;

    // Decision Text
    private String arbitrationDecision;
    private String decisionAddedBy;
    private LocalDateTime decisionAddedAt;

    // Payment Status After Decision
    private Boolean paymentMadeAfterDecision = false;
    private LocalDate paymentDate;
    private String paymentConfirmedBy;
    private LocalDateTime paymentConfirmedAt;

    // Unpaid Workflow
    private Boolean submittedForApproval = false;
    private LocalDateTime submittedForApprovalDate;
    private String submittedForApprovalBy;

    private Boolean approvedForDistrict = false;
    private LocalDateTime approvedForDistrictDate;
    private String approvedForDistrictBy;

    // Legal Case Information
    private Boolean sentToLegalOfficer = false;
    private LocalDateTime sentToLegalDate;
    private String assignedLegalOfficerId;
    private String assignedLegalOfficerName;
    private String assignedCourtId;
    private String assignedCourtName;
    private LocalDateTime legalAssignmentDate;

    // Judgment
    private LocalDate judgmentDate;
    private String judgmentNumber;
    private String judgmentResult;
    private String judgmentAddedBy;
    private LocalDateTime judgmentAddedAt;

    // Legal Officer Remarks
    private String legalOfficerRemarks;
    private LocalDateTime remarksAddedAt;

    // Court Payments
    @Builder.Default
    private List<CourtPayment> courtPayments = new ArrayList<>();

    @Builder.Default
    private List<Judgment> judgments = new ArrayList<>();

    public List<Judgment> getJudgments() {
        return judgments;
    }

    public void setJudgments(List<Judgment> judgments) {
        this.judgments = judgments;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getBorrowerName() {
        return borrowerName;
    }

    public void setBorrowerName(String borrowerName) {
        this.borrowerName = borrowerName;
    }

    public String getBorrowerNIC() {
        return borrowerNIC;
    }

    public void setBorrowerNIC(String borrowerNIC) {
        this.borrowerNIC = borrowerNIC;
    }

    public String getBorrowerAddress() {
        return borrowerAddress;
    }

    public void setBorrowerAddress(String borrowerAddress) {
        this.borrowerAddress = borrowerAddress;
    }

    public String getMembershipNo() {
        return membershipNo;
    }

    public void setMembershipNo(String membershipNo) {
        this.membershipNo = membershipNo;
    }

    public String getRegistrationNo() {
        return registrationNo;
    }

    public void setRegistrationNo(String registrationNo) {
        this.registrationNo = registrationNo;
    }

    public String getRegisteredAddress() {
        return registeredAddress;
    }

    public void setRegisteredAddress(String registeredAddress) {
        this.registeredAddress = registeredAddress;
    }

    public LocalDate getRegistrationDate() {
        return registrationDate;
    }

    public void setRegistrationDate(LocalDate registrationDate) {
        this.registrationDate = registrationDate;
    }

    public String getLoanNumber() {
        return loanNumber;
    }

    public void setLoanNumber(String loanNumber) {
        this.loanNumber = loanNumber;
    }

    public String getLoanType() {
        return loanType;
    }

    public void setLoanType(String loanType) {
        this.loanType = loanType;
    }

    public BigDecimal getLoanAmount() {
        return loanAmount;
    }

    public void setLoanAmount(BigDecimal loanAmount) {
        this.loanAmount = loanAmount;
    }

    public BigDecimal getOutstandingLoanAmount() {
        return outstandingLoanAmount;
    }

    public void setOutstandingLoanAmount(BigDecimal outstandingLoanAmount) {
        this.outstandingLoanAmount = outstandingLoanAmount;
    }

    public BigDecimal getInterest() {
        return interest;
    }

    public void setInterest(BigDecimal interest) {
        this.interest = interest;
    }

    public BigDecimal getInterestRate() {
        return interestRate;
    }

    public void setInterestRate(BigDecimal interestRate) {
        this.interestRate = interestRate;
    }

    public BigDecimal getStationeryFees() {
        return stationeryFees;
    }

    public void setStationeryFees(BigDecimal stationeryFees) {
        this.stationeryFees = stationeryFees;
    }

    public String getGuarantor1Name() {
        return guarantor1Name;
    }

    public void setGuarantor1Name(String guarantor1Name) {
        this.guarantor1Name = guarantor1Name;
    }

    public String getGuarantor1NIC() {
        return guarantor1NIC;
    }

    public void setGuarantor1NIC(String guarantor1NIC) {
        this.guarantor1NIC = guarantor1NIC;
    }

    public String getGuarantor1Address() {
        return guarantor1Address;
    }

    public void setGuarantor1Address(String guarantor1Address) {
        this.guarantor1Address = guarantor1Address;
    }

    public String getGuarantor1MembershipNo() {
        return guarantor1MembershipNo;
    }

    public void setGuarantor1MembershipNo(String guarantor1MembershipNo) {
        this.guarantor1MembershipNo = guarantor1MembershipNo;
    }

    public String getGuarantor2Name() {
        return guarantor2Name;
    }

    public void setGuarantor2Name(String guarantor2Name) {
        this.guarantor2Name = guarantor2Name;
    }

    public String getGuarantor2NIC() {
        return guarantor2NIC;
    }

    public void setGuarantor2NIC(String guarantor2NIC) {
        this.guarantor2NIC = guarantor2NIC;
    }

    public String getGuarantor2Address() {
        return guarantor2Address;
    }

    public void setGuarantor2Address(String guarantor2Address) {
        this.guarantor2Address = guarantor2Address;
    }

    public String getGuarantor2MembershipNo() {
        return guarantor2MembershipNo;
    }

    public void setGuarantor2MembershipNo(String guarantor2MembershipNo) {
        this.guarantor2MembershipNo = guarantor2MembershipNo;
    }

    public Boolean getDocumentDeficienciesChecked() {
        return documentDeficienciesChecked;
    }

    public void setDocumentDeficienciesChecked(Boolean documentDeficienciesChecked) {
        this.documentDeficienciesChecked = documentDeficienciesChecked;
    }

    public String getDocumentDeficiencies() {
        return documentDeficiencies;
    }

    public void setDocumentDeficiencies(String documentDeficiencies) {
        this.documentDeficiencies = documentDeficiencies;
    }

    public LocalDateTime getDeficiencyCheckDate() {
        return deficiencyCheckDate;
    }

    public void setDeficiencyCheckDate(LocalDateTime deficiencyCheckDate) {
        this.deficiencyCheckDate = deficiencyCheckDate;
    }

    public String getDeficiencyCheckedBy() {
        return deficiencyCheckedBy;
    }

    public void setDeficiencyCheckedBy(String deficiencyCheckedBy) {
        this.deficiencyCheckedBy = deficiencyCheckedBy;
    }

    public Boolean getArbitrationFeePaid() {
        return arbitrationFeePaid;
    }

    public void setArbitrationFeePaid(Boolean arbitrationFeePaid) {
        this.arbitrationFeePaid = arbitrationFeePaid;
    }

    public String getArbitrationNumber() {
        return arbitrationNumber;
    }

    public void setArbitrationNumber(String arbitrationNumber) {
        this.arbitrationNumber = arbitrationNumber;
    }

    public String getAssignedOfficerId() {
        return assignedOfficerId;
    }

    public void setAssignedOfficerId(String assignedOfficerId) {
        this.assignedOfficerId = assignedOfficerId;
    }

    public String getAssignedOfficerName() {
        return assignedOfficerName;
    }

    public void setAssignedOfficerName(String assignedOfficerName) {
        this.assignedOfficerName = assignedOfficerName;
    }

    public LocalDateTime getAssignedDate() {
        return assignedDate;
    }

    public void setAssignedDate(LocalDateTime assignedDate) {
        this.assignedDate = assignedDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDate getDecisionDate() {
        return decisionDate;
    }

    public void setDecisionDate(LocalDate decisionDate) {
        this.decisionDate = decisionDate;
    }

    public LocalDate getAppealDueDate() {
        return appealDueDate;
    }

    public void setAppealDueDate(LocalDate appealDueDate) {
        this.appealDueDate = appealDueDate;
    }

    public BigDecimal getProposedLoanBalance() {
        return proposedLoanBalance;
    }

    public void setProposedLoanBalance(BigDecimal proposedLoanBalance) {
        this.proposedLoanBalance = proposedLoanBalance;
    }

    public BigDecimal getProposedLoanInterest() {
        return proposedLoanInterest;
    }

    public void setProposedLoanInterest(BigDecimal proposedLoanInterest) {
        this.proposedLoanInterest = proposedLoanInterest;
    }

    public BigDecimal getCaseFees() {
        return caseFees;
    }

    public void setCaseFees(BigDecimal caseFees) {
        this.caseFees = caseFees;
    }

    public BigDecimal getProposedTotalAmount() {
        return proposedTotalAmount;
    }

    public void setProposedTotalAmount(BigDecimal proposedTotalAmount) {
        this.proposedTotalAmount = proposedTotalAmount;
    }

    public BigDecimal getForwardInterest() {
        return forwardInterest;
    }

    public void setForwardInterest(BigDecimal forwardInterest) {
        this.forwardInterest = forwardInterest;
    }

    public BigDecimal getForwardInterestRate() {
        return forwardInterestRate;
    }

    public void setForwardInterestRate(BigDecimal forwardInterestRate) {
        this.forwardInterestRate = forwardInterestRate;
    }

    public BigDecimal getDeductionsFromLoanAmount() {
        return deductionsFromLoanAmount;
    }

    public void setDeductionsFromLoanAmount(BigDecimal deductionsFromLoanAmount) {
        this.deductionsFromLoanAmount = deductionsFromLoanAmount;
    }

    public BigDecimal getDeductionsFromInterestAmount() {
        return deductionsFromInterestAmount;
    }

    public void setDeductionsFromInterestAmount(BigDecimal deductionsFromInterestAmount) {
        this.deductionsFromInterestAmount = deductionsFromInterestAmount;
    }

    public BigDecimal getCourtCharges() {
        return courtCharges;
    }

    public void setCourtCharges(BigDecimal courtCharges) {
        this.courtCharges = courtCharges;
    }

    public BigDecimal getRebateDeductions() {
        return rebateDeductions;
    }

    public void setRebateDeductions(BigDecimal rebateDeductions) {
        this.rebateDeductions = rebateDeductions;
    }

    public BigDecimal getBondAndInterest() {
        return bondAndInterest;
    }

    public void setBondAndInterest(BigDecimal bondAndInterest) {
        this.bondAndInterest = bondAndInterest;
    }

    public BigDecimal getOtherRebateDeductions() {
        return otherRebateDeductions;
    }

    public void setOtherRebateDeductions(BigDecimal otherRebateDeductions) {
        this.otherRebateDeductions = otherRebateDeductions;
    }

    public BigDecimal getTotalDeductions() {
        return totalDeductions;
    }

    public void setTotalDeductions(BigDecimal totalDeductions) {
        this.totalDeductions = totalDeductions;
    }

    public String getArbitrationDecision() {
        return arbitrationDecision;
    }

    public void setArbitrationDecision(String arbitrationDecision) {
        this.arbitrationDecision = arbitrationDecision;
    }

    public String getDecisionAddedBy() {
        return decisionAddedBy;
    }

    public void setDecisionAddedBy(String decisionAddedBy) {
        this.decisionAddedBy = decisionAddedBy;
    }

    public LocalDateTime getDecisionAddedAt() {
        return decisionAddedAt;
    }

    public void setDecisionAddedAt(LocalDateTime decisionAddedAt) {
        this.decisionAddedAt = decisionAddedAt;
    }

    public Boolean getPaymentMadeAfterDecision() {
        return paymentMadeAfterDecision;
    }

    public void setPaymentMadeAfterDecision(Boolean paymentMadeAfterDecision) {
        this.paymentMadeAfterDecision = paymentMadeAfterDecision;
    }

    public LocalDate getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDate paymentDate) {
        this.paymentDate = paymentDate;
    }

    public String getPaymentConfirmedBy() {
        return paymentConfirmedBy;
    }

    public void setPaymentConfirmedBy(String paymentConfirmedBy) {
        this.paymentConfirmedBy = paymentConfirmedBy;
    }

    public LocalDateTime getPaymentConfirmedAt() {
        return paymentConfirmedAt;
    }

    public void setPaymentConfirmedAt(LocalDateTime paymentConfirmedAt) {
        this.paymentConfirmedAt = paymentConfirmedAt;
    }

    public Boolean getSubmittedForApproval() {
        return submittedForApproval;
    }

    public void setSubmittedForApproval(Boolean submittedForApproval) {
        this.submittedForApproval = submittedForApproval;
    }

    public LocalDateTime getSubmittedForApprovalDate() {
        return submittedForApprovalDate;
    }

    public void setSubmittedForApprovalDate(LocalDateTime submittedForApprovalDate) {
        this.submittedForApprovalDate = submittedForApprovalDate;
    }

    public String getSubmittedForApprovalBy() {
        return submittedForApprovalBy;
    }

    public void setSubmittedForApprovalBy(String submittedForApprovalBy) {
        this.submittedForApprovalBy = submittedForApprovalBy;
    }

    public Boolean getApprovedForDistrict() {
        return approvedForDistrict;
    }

    public void setApprovedForDistrict(Boolean approvedForDistrict) {
        this.approvedForDistrict = approvedForDistrict;
    }

    public LocalDateTime getApprovedForDistrictDate() {
        return approvedForDistrictDate;
    }

    public void setApprovedForDistrictDate(LocalDateTime approvedForDistrictDate) {
        this.approvedForDistrictDate = approvedForDistrictDate;
    }

    public String getApprovedForDistrictBy() {
        return approvedForDistrictBy;
    }

    public void setApprovedForDistrictBy(String approvedForDistrictBy) {
        this.approvedForDistrictBy = approvedForDistrictBy;
    }

    public Boolean getSentToLegalOfficer() {
        return sentToLegalOfficer;
    }

    public void setSentToLegalOfficer(Boolean sentToLegalOfficer) {
        this.sentToLegalOfficer = sentToLegalOfficer;
    }

    public LocalDateTime getSentToLegalDate() {
        return sentToLegalDate;
    }

    public void setSentToLegalDate(LocalDateTime sentToLegalDate) {
        this.sentToLegalDate = sentToLegalDate;
    }

    public String getAssignedLegalOfficerId() {
        return assignedLegalOfficerId;
    }

    public void setAssignedLegalOfficerId(String assignedLegalOfficerId) {
        this.assignedLegalOfficerId = assignedLegalOfficerId;
    }

    public String getAssignedLegalOfficerName() {
        return assignedLegalOfficerName;
    }

    public void setAssignedLegalOfficerName(String assignedLegalOfficerName) {
        this.assignedLegalOfficerName = assignedLegalOfficerName;
    }

    public String getAssignedCourtId() {
        return assignedCourtId;
    }

    public void setAssignedCourtId(String assignedCourtId) {
        this.assignedCourtId = assignedCourtId;
    }

    public String getAssignedCourtName() {
        return assignedCourtName;
    }

    public void setAssignedCourtName(String assignedCourtName) {
        this.assignedCourtName = assignedCourtName;
    }

    public LocalDateTime getLegalAssignmentDate() {
        return legalAssignmentDate;
    }

    public void setLegalAssignmentDate(LocalDateTime legalAssignmentDate) {
        this.legalAssignmentDate = legalAssignmentDate;
    }

    public LocalDate getJudgmentDate() {
        return judgmentDate;
    }

    public void setJudgmentDate(LocalDate judgmentDate) {
        this.judgmentDate = judgmentDate;
    }

    public String getJudgmentNumber() {
        return judgmentNumber;
    }

    public void setJudgmentNumber(String judgmentNumber) {
        this.judgmentNumber = judgmentNumber;
    }

    public String getJudgmentResult() {
        return judgmentResult;
    }

    public void setJudgmentResult(String judgmentResult) {
        this.judgmentResult = judgmentResult;
    }

    public String getJudgmentAddedBy() {
        return judgmentAddedBy;
    }

    public void setJudgmentAddedBy(String judgmentAddedBy) {
        this.judgmentAddedBy = judgmentAddedBy;
    }

    public LocalDateTime getJudgmentAddedAt() {
        return judgmentAddedAt;
    }

    public void setJudgmentAddedAt(LocalDateTime judgmentAddedAt) {
        this.judgmentAddedAt = judgmentAddedAt;
    }

    public String getLegalOfficerRemarks() {
        return legalOfficerRemarks;
    }

    public void setLegalOfficerRemarks(String legalOfficerRemarks) {
        this.legalOfficerRemarks = legalOfficerRemarks;
    }

    public LocalDateTime getRemarksAddedAt() {
        return remarksAddedAt;
    }

    public void setRemarksAddedAt(LocalDateTime remarksAddedAt) {
        this.remarksAddedAt = remarksAddedAt;
    }

    public List<CourtPayment> getCourtPayments() {
        return courtPayments;
    }

    public void setCourtPayments(List<CourtPayment> courtPayments) {
        this.courtPayments = courtPayments;
    }

}
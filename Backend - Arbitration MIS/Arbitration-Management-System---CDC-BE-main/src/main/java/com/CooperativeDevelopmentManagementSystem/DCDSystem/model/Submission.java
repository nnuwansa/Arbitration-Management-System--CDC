package com.CooperativeDevelopmentManagementSystem.DCDSystem.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;
//
//@Data
//@Builder
//@NoArgsConstructor
//@AllArgsConstructor
//@Document(collection = "submissions")
//public class Submission {
//    @Id
//    private String id;
//
//    private String districtId;
//
//    private String societyId;
//
//    private List<Borrower> borrowers;
//
//    private LocalDateTime submittedDate;
//
//    private String status; // pending-approval, approved, rejected
//
//    private LocalDateTime approvedDate;
//
//    private String approvedBy;
//
//    private LocalDateTime rejectedDate;
//
//    private String rejectedBy;
//
//    private String rejectionReason;
//
//    private String submittedBy;
//
//    public String getId() {
//        return id;
//    }
//
//    public void setId(String id) {
//        this.id = id;
//    }
//
//    public String getDistrictId() {
//        return districtId;
//    }
//
//    public void setDistrictId(String districtId) {
//        this.districtId = districtId;
//    }
//
//    public String getSocietyId() {
//        return societyId;
//    }
//
//    public void setSocietyId(String societyId) {
//        this.societyId = societyId;
//    }
//
//    public List<Borrower> getBorrowers() {
//        return borrowers;
//    }
//
//    public void setBorrowers(List<Borrower> borrowers) {
//        this.borrowers = borrowers;
//    }
//
//    public LocalDateTime getSubmittedDate() {
//        return submittedDate;
//    }
//
//    public void setSubmittedDate(LocalDateTime submittedDate) {
//        this.submittedDate = submittedDate;
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
//    public LocalDateTime getApprovedDate() {
//        return approvedDate;
//    }
//
//    public void setApprovedDate(LocalDateTime approvedDate) {
//        this.approvedDate = approvedDate;
//    }
//
//    public String getApprovedBy() {
//        return approvedBy;
//    }
//
//    public void setApprovedBy(String approvedBy) {
//        this.approvedBy = approvedBy;
//    }
//
//    public LocalDateTime getRejectedDate() {
//        return rejectedDate;
//    }
//
//    public void setRejectedDate(LocalDateTime rejectedDate) {
//        this.rejectedDate = rejectedDate;
//    }
//
//    public String getRejectedBy() {
//        return rejectedBy;
//    }
//
//    public void setRejectedBy(String rejectedBy) {
//        this.rejectedBy = rejectedBy;
//    }
//
//    public String getRejectionReason() {
//        return rejectionReason;
//    }
//
//    public void setRejectionReason(String rejectionReason) {
//        this.rejectionReason = rejectionReason;
//    }
//
//    public String getSubmittedBy() {
//        return submittedBy;
//    }
//
//    public void setSubmittedBy(String submittedBy) {
//        this.submittedBy = submittedBy;
//    }
//}





import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "submissions")
public class Submission {
    @Id
    private String id;

    private String districtId;

    private String societyId;

    private List<Borrower> borrowers;

    private LocalDateTime submittedDate;

    private String status;

    private LocalDateTime approvedDate;

    private String approvedBy;

    private LocalDateTime rejectedDate;

    private String rejectedBy;

    private String rejectionReason;

    private String submittedBy;



    private String districtName;


    private String societyName;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getDistrictId() {
        return districtId;
    }

    public void setDistrictId(String districtId) {
        this.districtId = districtId;
    }

    public String getSocietyId() {
        return societyId;
    }

    public void setSocietyId(String societyId) {
        this.societyId = societyId;
    }

    public List<Borrower> getBorrowers() {
        return borrowers;
    }

    public void setBorrowers(List<Borrower> borrowers) {
        this.borrowers = borrowers;
    }

    public LocalDateTime getSubmittedDate() {
        return submittedDate;
    }

    public void setSubmittedDate(LocalDateTime submittedDate) {
        this.submittedDate = submittedDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getApprovedDate() {
        return approvedDate;
    }

    public void setApprovedDate(LocalDateTime approvedDate) {
        this.approvedDate = approvedDate;
    }

    public String getApprovedBy() {
        return approvedBy;
    }

    public void setApprovedBy(String approvedBy) {
        this.approvedBy = approvedBy;
    }

    public LocalDateTime getRejectedDate() {
        return rejectedDate;
    }

    public void setRejectedDate(LocalDateTime rejectedDate) {
        this.rejectedDate = rejectedDate;
    }

    public String getRejectedBy() {
        return rejectedBy;
    }

    public void setRejectedBy(String rejectedBy) {
        this.rejectedBy = rejectedBy;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public String getSubmittedBy() {
        return submittedBy;
    }

    public void setSubmittedBy(String submittedBy) {
        this.submittedBy = submittedBy;
    }

    public String getDistrictName() {
        return districtName;
    }

    public void setDistrictName(String districtName) {
        this.districtName = districtName;
    }

    public String getSocietyName() {
        return societyName;
    }

    public void setSocietyName(String societyName) {
        this.societyName = societyName;
    }
}
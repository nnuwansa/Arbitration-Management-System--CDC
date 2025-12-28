package com.CooperativeDevelopmentManagementSystem.DCDSystem.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Judgment {
    private String id;

    // ⭐ Make these nullable - can be added separately
    private LocalDate judgmentDate;  // Can be null
    private String judgmentNumber;
    private String judgmentResult;   // Can be null or empty

    private String addedBy;
    private LocalDateTime addedAt;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public String getAddedBy() {
        return addedBy;
    }

    public void setAddedBy(String addedBy) {
        this.addedBy = addedBy;
    }

    public LocalDateTime getAddedAt() {
        return addedAt;
    }

    public void setAddedAt(LocalDateTime addedAt) {
        this.addedAt = addedAt;
    }
}
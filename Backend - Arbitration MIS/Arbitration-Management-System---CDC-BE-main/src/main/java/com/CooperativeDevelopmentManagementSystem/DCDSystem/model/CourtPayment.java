package com.CooperativeDevelopmentManagementSystem.DCDSystem.model;



import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourtPayment {
    private String id;
    private BigDecimal amount;
    private LocalDate paymentDate;
    private String addedBy;
    private LocalDateTime addedAt;
}
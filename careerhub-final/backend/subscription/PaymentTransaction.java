package com.graphix.careerhub.subscription;

import com.graphix.careerhub.common.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_transactions")
@Getter @Setter
public class PaymentTransaction extends BaseEntity {
    private Long studentId;
    private Long planId;
    private Double amountRs;
    private String currency = "INR";
    private String paymentGateway;
    private String gatewayOrderId;
    private String gatewayPaymentId;
    private String status = "CREATED";
    private String failureReason;
    private LocalDateTime initiatedAt = LocalDateTime.now();
    private LocalDateTime completedAt;
}

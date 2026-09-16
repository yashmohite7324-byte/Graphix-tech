package com.graphix.careerhub.subscription;

import com.graphix.careerhub.common.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_access")
@Getter @Setter
public class StudentAccess extends BaseEntity {
    private Long studentId;
    private String accessTier = "EXTERNAL_PENDING";
    private Long planId;
    private String paymentStatus = "FREE";
    private String paymentReference;
    private String paymentMethod;
    private Double amountPaid;
    private LocalDateTime accessValidFrom;
    private LocalDateTime accessValidUntil;
}

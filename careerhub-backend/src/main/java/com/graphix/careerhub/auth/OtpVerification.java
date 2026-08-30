package com.graphix.careerhub.auth;

import com.graphix.careerhub.common.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "otp_verifications")
@Getter
@Setter
public class OtpVerification extends BaseEntity {

    private String identifier; // email or mobile
    private String code;
    private LocalDateTime expiresAt;
    private boolean consumed = false;
}

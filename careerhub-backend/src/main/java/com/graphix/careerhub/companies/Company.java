package com.graphix.careerhub.companies;

import com.graphix.careerhub.common.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "companies")
@Getter
@Setter
public class Company extends BaseEntity {

    public enum VerificationStatus { PENDING, APPROVED, REJECTED }

    private String name;
    private String website;
    private String industry;
    private String location;

    @Enumerated(EnumType.STRING)
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;

    private String documentsUrl;
}

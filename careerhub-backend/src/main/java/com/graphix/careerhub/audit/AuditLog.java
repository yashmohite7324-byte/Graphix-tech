package com.graphix.careerhub.audit;

import com.graphix.careerhub.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
public class AuditLog extends BaseEntity {

    private String actorEmail;
    private String action;        // e.g. "LOGIN", "COMPANY_APPROVED", "APPLICATION_STATUS_CHANGED"
    private String entityName;    // e.g. "Company", "Application"
    private String entityId;

    @Column(columnDefinition = "TEXT")
    private String details;
}

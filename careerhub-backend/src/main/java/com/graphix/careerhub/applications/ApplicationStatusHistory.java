package com.graphix.careerhub.applications;

import com.graphix.careerhub.common.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "application_status_history")
@Getter
@Setter
public class ApplicationStatusHistory extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "application_id")
    private Application application;

    @Enumerated(EnumType.STRING)
    private Application.Status fromStatus;

    @Enumerated(EnumType.STRING)
    private Application.Status toStatus;

    private String changedBy; // actor email
}

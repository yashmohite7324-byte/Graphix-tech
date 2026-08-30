package com.graphix.careerhub.jobs;

import com.graphix.careerhub.common.BaseEntity;
import com.graphix.careerhub.companies.Company;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "jobs")
@Getter
@Setter
public class Job extends BaseEntity {

    public enum Status { OPEN, CLOSED, DRAFT }

    @ManyToOne
    @JoinColumn(name = "company_id")
    private Company company;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Double ctc;
    private LocalDate applicationDeadline;

    @Enumerated(EnumType.STRING)
    private Status status = Status.OPEN;
}

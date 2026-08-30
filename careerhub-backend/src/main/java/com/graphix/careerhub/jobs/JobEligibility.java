package com.graphix.careerhub.jobs;

import com.graphix.careerhub.common.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "job_eligibility")
@Getter
@Setter
public class JobEligibility extends BaseEntity {

    @OneToOne
    @JoinColumn(name = "job_id", unique = true)
    private Job job;

    private Double minCgpa;
    private Integer maxBacklogs;
    private String eligibleBranches;   // comma-separated, e.g. "CSE,IT,ECE"
    private Integer eligibleBatchYear;
    private String requiredSkills;     // comma-separated
}

package com.graphix.careerhub.jobs.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class JobRequest {
    private String title;
    private String description;
    private Double ctc;
    private LocalDate applicationDeadline;

    // Eligibility fields
    private Double minCgpa;
    private Integer maxBacklogs;
    private String eligibleBranches;
    private Integer eligibleBatchYear;
    private String requiredSkills;
}

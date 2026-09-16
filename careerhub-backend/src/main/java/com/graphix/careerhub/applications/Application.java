package com.graphix.careerhub.applications;

import com.graphix.careerhub.common.BaseEntity;
import com.graphix.careerhub.jobs.Job;
import com.graphix.careerhub.students.StudentProfile;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "applications")
@Getter
@Setter
public class Application extends BaseEntity {

    public enum Status {
        APPLIED, UNDER_REVIEW, SHORTLISTED, INTERVIEW_SCHEDULED, INTERVIEWED,
        SELECTED, OFFERED, PLACED, REJECTED, WITHDRAWN, ON_HOLD
    }

    @ManyToOne
    @JoinColumn(name = "job_id")
    private Job job;

    @ManyToOne
    @JoinColumn(name = "student_id")
    private StudentProfile student;

    @Enumerated(EnumType.STRING)
    private Status status = Status.APPLIED;

    private Integer aiMatchScore; // AI Resume Score
}

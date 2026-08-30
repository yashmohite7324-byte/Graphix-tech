package com.graphix.careerhub.training;

import com.graphix.careerhub.common.BaseEntity;
import com.graphix.careerhub.students.StudentProfile;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "assessment_scores")
@Getter @Setter
public class AssessmentScore extends BaseEntity {
    @ManyToOne
    @JoinColumn(name = "assessment_id")
    private Assessment assessment;

    @ManyToOne
    @JoinColumn(name = "student_id")
    private StudentProfile student;

    private Double score;
    private String remarks;
}

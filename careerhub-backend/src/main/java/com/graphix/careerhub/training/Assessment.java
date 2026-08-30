package com.graphix.careerhub.training;

import com.graphix.careerhub.common.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Entity
@Table(name = "assessments")
@Getter @Setter
public class Assessment extends BaseEntity {
    @ManyToOne
    @JoinColumn(name = "training_program_id")
    private TrainingProgram trainingProgram;

    private String title;
    private Double totalMarks;
    private LocalDate conductedOn;
}

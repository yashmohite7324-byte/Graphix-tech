package com.graphix.careerhub.training;

import com.graphix.careerhub.common.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Entity
@Table(name = "training_programs")
@Getter @Setter
public class TrainingProgram extends BaseEntity {
    private String name;
    @Column(columnDefinition = "TEXT")
    private String description;
    private String trainerName;
    private String branch;
    private Integer batchYear;
    private LocalDate startDate;
    private LocalDate endDate;
    private String mode;
    private String syllabus;
}

package com.graphix.careerhub.training;

import com.graphix.careerhub.common.BaseEntity;
import com.graphix.careerhub.students.StudentProfile;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Entity
@Table(name = "attendance")
@Getter @Setter
public class Attendance extends BaseEntity {
    public enum Status { PRESENT, ABSENT, LATE }

    @ManyToOne
    @JoinColumn(name = "training_program_id")
    private TrainingProgram trainingProgram;

    @ManyToOne
    @JoinColumn(name = "student_id")
    private StudentProfile student;

    private LocalDate date;

    @Enumerated(EnumType.STRING)
    private Status status;
}

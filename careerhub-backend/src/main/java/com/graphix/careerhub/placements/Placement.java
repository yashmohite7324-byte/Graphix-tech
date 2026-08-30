package com.graphix.careerhub.placements;

import com.graphix.careerhub.common.BaseEntity;
import com.graphix.careerhub.companies.Company;
import com.graphix.careerhub.students.StudentProfile;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Entity
@Table(name = "placements")
@Getter @Setter
public class Placement extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "student_id")
    private StudentProfile student;

    @ManyToOne
    @JoinColumn(name = "company_id")
    private Company company;

    private Double ctcOffered;
    private LocalDate joiningDate;
    private String designation;
    private String location;
    private String offerLetterUrl;

    @Enumerated(EnumType.STRING)
    private PlacementStatus status = PlacementStatus.OFFERED;

    public enum PlacementStatus { OFFERED, ACCEPTED, DECLINED, JOINED }
}

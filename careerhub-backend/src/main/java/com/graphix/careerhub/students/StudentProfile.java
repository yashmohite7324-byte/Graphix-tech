package com.graphix.careerhub.students;

import com.graphix.careerhub.common.BaseEntity;
import com.graphix.careerhub.users.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "student_profiles")
@Getter
@Setter
public class StudentProfile extends BaseEntity {

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id", unique = true)
    private User user;

    private String fullName;

    @Column(unique = true)
    private String rollNumber;

    private String branch;
    private Integer batchYear;
    private Double cgpa;
    private Integer backlogCount = 0;
    private String resumeUrl;
    private String photoUrl;
}

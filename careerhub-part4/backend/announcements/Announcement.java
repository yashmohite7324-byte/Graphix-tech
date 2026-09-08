package com.graphix.careerhub.announcements;

import com.graphix.careerhub.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "announcements")
@Getter
@Setter
public class Announcement extends BaseEntity {

    private String title;

    @Column(columnDefinition = "TEXT")
    private String message;

    // Target: ALL, STUDENT, RECRUITER, TRAINER
    private String targetRole;

    // Optional filters
    private String targetBranch;
    private Integer targetBatchYear;

    private String createdByEmail;

    private boolean active = true;
}

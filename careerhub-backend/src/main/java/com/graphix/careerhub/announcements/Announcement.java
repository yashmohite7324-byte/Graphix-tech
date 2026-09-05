package com.graphix.careerhub.announcements;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "announcements")
@Data
public class Announcement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String message;
    
    private String targetRole; 
    private String targetBranch;
    private String targetBatchYear;
    
    private LocalDateTime createdAt = LocalDateTime.now();
    private String createdBy;
}

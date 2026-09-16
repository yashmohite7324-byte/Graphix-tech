package com.graphix.careerhub.students.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StudentProfileResponse {
    private Long id;
    private String email;
    private String fullName;
    private String rollNumber;
    private String branch;
    private Integer batchYear;
    private Double cgpa;
    private Integer backlogCount;
    private String resumeUrl; // Raw S3 Key or URL
    private String photoUrl;  // Raw S3 Key or URL
    private String presignedResumeUrl; // Presigned URL for private S3 access
    private String presignedPhotoUrl;  // Presigned URL for private S3 access
}

package com.graphix.careerhub.students;

import com.graphix.careerhub.common.BadRequestException;
import com.graphix.careerhub.common.ResourceNotFoundException;
import com.graphix.careerhub.storage.S3Service;
import com.graphix.careerhub.students.dto.StudentProfileResponse;
import com.graphix.careerhub.users.User;
import com.graphix.careerhub.users.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class StudentService {

    private final StudentProfileRepository studentProfileRepository;
    private final UserRepository userRepository;
    private final S3Service s3Service;
    private final com.graphix.careerhub.audit.AuditService auditService;
    private final com.graphix.careerhub.notifications.NotificationService notificationService;

    public StudentService(StudentProfileRepository studentProfileRepository,
                          UserRepository userRepository,
                          S3Service s3Service,
                          com.graphix.careerhub.audit.AuditService auditService,
                          com.graphix.careerhub.notifications.NotificationService notificationService) {
        this.studentProfileRepository = studentProfileRepository;
        this.userRepository = userRepository;
        this.s3Service = s3Service;
        this.auditService = auditService;
        this.notificationService = notificationService;
    }

    @jakarta.annotation.PostConstruct
    public void fixLegacyStudents() {
        java.util.List<StudentProfile> students = studentProfileRepository.findAll();
        for (StudentProfile s : students) {
            if (s.getVerificationStatus() == null) {
                s.setVerificationStatus(StudentProfile.VerificationStatus.APPROVED);
                studentProfileRepository.save(s);
            }
        }
    }

    public java.util.List<StudentProfile> getAllStudents() {
        return studentProfileRepository.findAll();
    }

    public StudentProfile approveStudent(Long id, String adminEmail) {
        StudentProfile sp = studentProfileRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        sp.setVerificationStatus(StudentProfile.VerificationStatus.APPROVED);
        studentProfileRepository.save(sp);
        auditService.log(adminEmail, "STUDENT_APPROVED", "Student", id.toString(), sp.getFullName());
        
        if (sp.getUser() != null) {
            notificationService.send(sp.getUser().getId(), com.graphix.careerhub.notifications.Notification.Type.SYSTEM, "Account Approved", "Your academy account has been approved by the Placement Admin. You can now log in.");
        }
        
        return sp;
    }

    public StudentProfile rejectStudent(Long id, String adminEmail) {
        StudentProfile sp = studentProfileRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        sp.setVerificationStatus(StudentProfile.VerificationStatus.REJECTED);
        studentProfileRepository.save(sp);
        auditService.log(adminEmail, "STUDENT_REJECTED", "Student", id.toString(), sp.getFullName());
        
        if (sp.getUser() != null) {
            notificationService.send(sp.getUser().getId(), com.graphix.careerhub.notifications.Notification.Type.SYSTEM, "Account Rejected", "Your academy account has been rejected by the Placement Admin.");
        }
        
        return sp;
    }

    public StudentProfile getProfileByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return studentProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
    }

    public StudentProfileResponse getProfileResponseByEmail(String email) {
        StudentProfile profile = getProfileByEmail(email);
        return mapToResponse(profile);
    }

    public StudentProfileResponse updateProfile(String email, StudentProfile updated) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        StudentProfile profile = studentProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    StudentProfile p = new StudentProfile();
                    p.setUser(user);
                    return p;
                });

        if (updated.getFullName() != null) profile.setFullName(updated.getFullName());
        if (updated.getBranch() != null) profile.setBranch(updated.getBranch());
        if (updated.getBatchYear() != null) profile.setBatchYear(updated.getBatchYear());
        if (updated.getCgpa() != null) profile.setCgpa(updated.getCgpa());
        if (updated.getBacklogCount() != null) profile.setBacklogCount(updated.getBacklogCount());
        if (updated.getRollNumber() != null) profile.setRollNumber(updated.getRollNumber());
        if (updated.getResumeUrl() != null) profile.setResumeUrl(updated.getResumeUrl());
        if (updated.getPhotoUrl() != null) profile.setPhotoUrl(updated.getPhotoUrl());

        StudentProfile saved = studentProfileRepository.save(profile);
        return mapToResponse(saved);
    }

    public StudentProfileResponse uploadResume(String email, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File cannot be empty");
        }

        try {
            String objectKey = s3Service.uploadFile("resumes", file);
            StudentProfile profile = getProfileByEmail(email);
            profile.setResumeUrl(objectKey);
            StudentProfile saved = studentProfileRepository.save(profile);
            return mapToResponse(saved);
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload resume to S3: " + e.getMessage(), e);
        }
    }

    public StudentProfileResponse uploadPhoto(String email, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File cannot be empty");
        }

        try {
            String objectKey = s3Service.uploadFile("photos", file);
            StudentProfile profile = getProfileByEmail(email);
            profile.setPhotoUrl(objectKey);
            StudentProfile saved = studentProfileRepository.save(profile);
            return mapToResponse(saved);
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload photo to S3: " + e.getMessage(), e);
        }
    }

    public StudentProfileResponse mapToResponse(StudentProfile profile) {
        String presignedResume = s3Service.generatePresignedUrl(profile.getResumeUrl());
        String presignedPhoto = s3Service.generatePresignedUrl(profile.getPhotoUrl());

        return StudentProfileResponse.builder()
                .id(profile.getId())
                .email(profile.getUser() != null ? profile.getUser().getEmail() : null)
                .fullName(profile.getFullName())
                .rollNumber(profile.getRollNumber())
                .branch(profile.getBranch())
                .batchYear(profile.getBatchYear())
                .cgpa(profile.getCgpa())
                .backlogCount(profile.getBacklogCount())
                .resumeUrl(profile.getResumeUrl())
                .photoUrl(profile.getPhotoUrl())
                .presignedResumeUrl(presignedResume)
                .presignedPhotoUrl(presignedPhoto)
                .build();
    }
}

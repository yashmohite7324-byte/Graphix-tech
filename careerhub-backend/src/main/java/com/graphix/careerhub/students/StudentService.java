package com.graphix.careerhub.students;

import com.graphix.careerhub.common.ResourceNotFoundException;
import com.graphix.careerhub.users.User;
import com.graphix.careerhub.users.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class StudentService {

    private final StudentProfileRepository studentProfileRepository;
    private final UserRepository userRepository;

    public StudentService(StudentProfileRepository studentProfileRepository, UserRepository userRepository) {
        this.studentProfileRepository = studentProfileRepository;
        this.userRepository = userRepository;
    }

    public StudentProfile getProfileByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return studentProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
    }

    public StudentProfile updateProfile(String email, StudentProfile updated) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        StudentProfile profile = studentProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    StudentProfile p = new StudentProfile();
                    p.setUser(user);
                    return p;
                });

        profile.setFullName(updated.getFullName());
        profile.setBranch(updated.getBranch());
        profile.setBatchYear(updated.getBatchYear());
        profile.setCgpa(updated.getCgpa());
        profile.setBacklogCount(updated.getBacklogCount());
        profile.setResumeUrl(updated.getResumeUrl());
        profile.setPhotoUrl(updated.getPhotoUrl());

        return studentProfileRepository.save(profile);
    }
}

package com.graphix.careerhub.students;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {
    Optional<StudentProfile> findByUserId(Long userId);
    Optional<StudentProfile> findByRollNumber(String rollNumber);
    boolean existsByRollNumber(String rollNumber);
    java.util.List<StudentProfile> findByBranch(String branch);
    java.util.List<StudentProfile> findByVerificationStatus(StudentProfile.VerificationStatus status);
}

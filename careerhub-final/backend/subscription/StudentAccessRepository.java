package com.graphix.careerhub.subscription;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface StudentAccessRepository extends JpaRepository<StudentAccess, Long> {
    Optional<StudentAccess> findByStudentId(Long studentId);
}

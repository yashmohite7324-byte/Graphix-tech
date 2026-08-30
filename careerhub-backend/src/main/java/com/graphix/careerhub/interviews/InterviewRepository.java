package com.graphix.careerhub.interviews;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InterviewRepository extends JpaRepository<Interview, Long> {
    List<Interview> findByApplicationStudentUserId(Long userId);
    List<Interview> findByApplicationJobCompanyId(Long companyId);
}

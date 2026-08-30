package com.graphix.careerhub.training;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface AssessmentScoreRepository extends JpaRepository<AssessmentScore, Long> {
    List<AssessmentScore> findByStudentId(Long studentId);
    List<AssessmentScore> findByAssessmentId(Long assessmentId);
}

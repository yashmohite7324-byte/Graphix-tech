package com.graphix.careerhub.training;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface AssessmentRepository extends JpaRepository<Assessment, Long> {
    List<Assessment> findByTrainingProgramId(Long programId);
}

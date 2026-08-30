package com.graphix.careerhub.jobs;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface JobEligibilityRepository extends JpaRepository<JobEligibility, Long> {
    Optional<JobEligibility> findByJobId(Long jobId);
}

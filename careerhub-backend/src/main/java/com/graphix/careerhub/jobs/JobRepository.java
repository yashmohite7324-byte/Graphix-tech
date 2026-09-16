package com.graphix.careerhub.jobs;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {

    List<Job> findByStatus(Job.Status status);

    List<Job> findByCompanyId(Long companyId);
}

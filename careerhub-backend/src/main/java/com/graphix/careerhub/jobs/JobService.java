package com.graphix.careerhub.jobs;

import com.graphix.careerhub.companies.Company;
import com.graphix.careerhub.jobs.dto.JobRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JobService {

    private final JobRepository jobRepository;
    private final JobEligibilityRepository jobEligibilityRepository;

    public JobService(JobRepository jobRepository, JobEligibilityRepository jobEligibilityRepository) {
        this.jobRepository = jobRepository;
        this.jobEligibilityRepository = jobEligibilityRepository;
    }

    public Job createJob(JobRequest request, Company company) {
        Job job = new Job();
        job.setCompany(company);
        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setCtc(request.getCtc());
        job.setApplicationDeadline(request.getApplicationDeadline());
        job.setStatus(Job.Status.OPEN);
        Job saved = jobRepository.save(job);

        JobEligibility eligibility = new JobEligibility();
        eligibility.setJob(saved);
        eligibility.setMinCgpa(request.getMinCgpa());
        eligibility.setMaxBacklogs(request.getMaxBacklogs());
        eligibility.setEligibleBranches(request.getEligibleBranches());
        eligibility.setEligibleBatchYear(request.getEligibleBatchYear());
        eligibility.setRequiredSkills(request.getRequiredSkills());
        jobEligibilityRepository.save(eligibility);

        return saved;
    }

    public List<Job> getAllOpenJobs() {
        return jobRepository.findAllOpenJobs();
    }

    public JobEligibility getEligibilityForJob(Long jobId) {
        return jobEligibilityRepository.findByJobId(jobId).orElse(null);
    }
}

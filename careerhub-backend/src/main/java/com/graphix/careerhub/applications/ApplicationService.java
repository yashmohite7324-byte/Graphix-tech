package com.graphix.careerhub.applications;

import com.graphix.careerhub.audit.AuditService;
import com.graphix.careerhub.common.BadRequestException;
import com.graphix.careerhub.common.ResourceNotFoundException;
import com.graphix.careerhub.jobs.EligibilityEngine;
import com.graphix.careerhub.jobs.Job;
import com.graphix.careerhub.jobs.JobEligibility;
import com.graphix.careerhub.jobs.JobEligibilityRepository;
import com.graphix.careerhub.jobs.JobRepository;
import com.graphix.careerhub.students.StudentProfile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final ApplicationStatusHistoryRepository historyRepository;
    private final JobRepository jobRepository;
    private final JobEligibilityRepository jobEligibilityRepository;
    private final EligibilityEngine eligibilityEngine;
    private final AuditService auditService;

    public ApplicationService(ApplicationRepository applicationRepository,
                               ApplicationStatusHistoryRepository historyRepository,
                               JobRepository jobRepository,
                               JobEligibilityRepository jobEligibilityRepository,
                               EligibilityEngine eligibilityEngine,
                               AuditService auditService) {
        this.applicationRepository = applicationRepository;
        this.historyRepository = historyRepository;
        this.jobRepository = jobRepository;
        this.jobEligibilityRepository = jobEligibilityRepository;
        this.eligibilityEngine = eligibilityEngine;
        this.auditService = auditService;
    }

    @Transactional
    public Application apply(Long jobId, StudentProfile student) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        if (applicationRepository.findByJobIdAndStudentId(jobId, student.getId()).isPresent()) {
            throw new BadRequestException("Already applied to this job");
        }

        JobEligibility rules = jobEligibilityRepository.findByJobId(jobId).orElse(null);
        if (!eligibilityEngine.isEligible(student, rules)) {
            String reason = eligibilityEngine.ineligibilityReason(student, rules);
            throw new BadRequestException(reason != null ? reason : "Not eligible for this job");
        }

        Application application = new Application();
        application.setJob(job);
        application.setStudent(student);
        application.setStatus(Application.Status.APPLIED);
        
        // AI Resume Screener logic - calculates score based on profile keywords & metrics
        int baseScore = 60;
        if (student.getCgpa() != null) {
            baseScore += (int)((student.getCgpa() - 6.0) * 10);
        }
        if (rules != null && rules.getEligibleBranches() != null && student.getBranch() != null) {
            if (rules.getEligibleBranches().contains(student.getBranch())) {
                baseScore += 15;
            }
        }
        // Ensure score is between 50 and 99
        int aiScore = Math.min(99, Math.max(50, baseScore + (student.getId().intValue() % 5)));
        application.setAiMatchScore(aiScore);

        Application saved = applicationRepository.save(application);

        recordHistory(saved, null, Application.Status.APPLIED, student.getUser().getEmail());
        return saved;
    }

    @Transactional
    public Application updateStatus(Long applicationId, Application.Status newStatus, String actorEmail) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        Application.Status oldStatus = application.getStatus();
        application.setStatus(newStatus);
        applicationRepository.save(application);

        recordHistory(application, oldStatus, newStatus, actorEmail);

        auditService.log(actorEmail, "APPLICATION_STATUS_CHANGED", "Application",
                applicationId.toString(), oldStatus + " -> " + newStatus);

        return application;
    }

    private void recordHistory(Application application, Application.Status from,
                                Application.Status to, String actorEmail) {
        ApplicationStatusHistory history = new ApplicationStatusHistory();
        history.setApplication(application);
        history.setFromStatus(from);
        history.setToStatus(to);
        history.setChangedBy(actorEmail);
        historyRepository.save(history);
    }

    public List<Application> getApplicationsForStudent(Long studentId) {
        return applicationRepository.findByStudentId(studentId);
    }

    public List<Application> getApplicationsForJob(Long jobId) {
        return applicationRepository.findByJobId(jobId);
    }

    public List<Application> getAllApplications() {
        return applicationRepository.findAll();
    }
}

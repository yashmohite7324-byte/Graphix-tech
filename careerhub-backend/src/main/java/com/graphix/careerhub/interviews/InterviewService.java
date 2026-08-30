package com.graphix.careerhub.interviews;

import com.graphix.careerhub.applications.Application;
import com.graphix.careerhub.applications.ApplicationRepository;
import com.graphix.careerhub.applications.ApplicationService;
import com.graphix.careerhub.audit.AuditService;
import com.graphix.careerhub.common.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final ApplicationRepository applicationRepository;
    private final ApplicationService applicationService;
    private final AuditService auditService;

    public InterviewService(InterviewRepository interviewRepository,
                            ApplicationRepository applicationRepository,
                            ApplicationService applicationService,
                            AuditService auditService) {
        this.interviewRepository = interviewRepository;
        this.applicationRepository = applicationRepository;
        this.applicationService = applicationService;
        this.auditService = auditService;
    }

    @Transactional
    public Interview schedule(InterviewRequest req, String actorEmail) {
        Application application = applicationRepository.findById(req.getApplicationId())
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        Interview interview = new Interview();
        interview.setApplication(application);
        interview.setRound(req.getRound());
        interview.setScheduledAt(req.getScheduledAt());
        interview.setMode(Interview.Mode.valueOf(req.getMode().toUpperCase()));
        interview.setVenue(req.getVenue());
        interview.setMeetingLink(req.getMeetingLink());
        interview.setPanel(req.getPanel());
        interview.setResult(Interview.Result.PENDING);

        Interview saved = interviewRepository.save(interview);

        applicationService.updateStatus(application.getId(),
                Application.Status.INTERVIEW_SCHEDULED, actorEmail);

        auditService.log(actorEmail, "INTERVIEW_SCHEDULED", "Interview",
                saved.getId().toString(), "Round " + req.getRound());
        return saved;
    }

    @Transactional
    public Interview updateResult(Long interviewId, Interview.Result result,
                                   String feedback, String actorEmail) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found"));
        interview.setResult(result);
        interview.setFeedback(feedback);
        interviewRepository.save(interview);

        if (result == Interview.Result.PASSED) {
            applicationService.updateStatus(interview.getApplication().getId(),
                    Application.Status.INTERVIEWED, actorEmail);
        }

        auditService.log(actorEmail, "INTERVIEW_RESULT_UPDATED", "Interview",
                interviewId.toString(), result.name());
        return interview;
    }

    public List<Interview> getForStudent(Long userId) {
        return interviewRepository.findByApplicationStudentUserId(userId);
    }

    public List<Interview> getAll() {
        return interviewRepository.findAll();
    }
}

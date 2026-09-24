package com.graphix.careerhub.jobs;

import com.graphix.careerhub.common.ApiResponse;
import com.graphix.careerhub.common.ResourceNotFoundException;
import com.graphix.careerhub.companies.RecruiterProfile;
import com.graphix.careerhub.companies.RecruiterProfileRepository;
import com.graphix.careerhub.jobs.dto.JobRequest;
import com.graphix.careerhub.users.User;
import com.graphix.careerhub.users.UserRepository;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/recruiter/jobs")
@PreAuthorize("hasRole('RECRUITER')")
public class RecruiterJobController {

    private final JobService jobService;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final UserRepository userRepository;

    public RecruiterJobController(JobService jobService,
                                   RecruiterProfileRepository recruiterProfileRepository,
                                   UserRepository userRepository) {
        this.jobService = jobService;
        this.recruiterProfileRepository = recruiterProfileRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ApiResponse<Job> createJob(@Valid @RequestBody JobRequest request, Authentication authentication) {
        RecruiterProfile recruiter = getRecruiterProfile(authentication.getName());
        if (recruiter.getCompany() != null && recruiter.getCompany().getVerificationStatus() != com.graphix.careerhub.companies.Company.VerificationStatus.APPROVED) {
            throw new RuntimeException("Your company account is pending approval by the placement cell. You cannot post jobs yet.");
        }
        return ApiResponse.success(jobService.createJob(request, recruiter.getCompany()));
    }

    @GetMapping
    public ApiResponse<java.util.List<Job>> getMyJobs(Authentication authentication) {
        RecruiterProfile recruiter = getRecruiterProfile(authentication.getName());
        return ApiResponse.success(jobService.getJobsByCompanyId(recruiter.getCompany().getId()));
    }

    private RecruiterProfile getRecruiterProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return recruiterProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter profile not found"));
    }
}

package com.graphix.careerhub.applications;

import com.graphix.careerhub.applications.dto.StatusUpdateRequest;
import com.graphix.careerhub.common.ApiResponse;
import com.graphix.careerhub.students.StudentService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class ApplicationController {

    private final ApplicationService applicationService;
    private final StudentService studentService;

    public ApplicationController(ApplicationService applicationService, StudentService studentService) {
        this.applicationService = applicationService;
        this.studentService = studentService;
    }

    @PostMapping("/student/jobs/{jobId}/apply")
    @PreAuthorize("hasRole('STUDENT')")
    public ApiResponse<Application> apply(@PathVariable Long jobId, Authentication authentication) {
        var student = studentService.getProfileByEmail(authentication.getName());
        return ApiResponse.success(applicationService.apply(jobId, student));
    }

    @GetMapping("/student/applications/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ApiResponse<List<Application>> myApplications(Authentication authentication) {
        var student = studentService.getProfileByEmail(authentication.getName());
        return ApiResponse.success(applicationService.getApplicationsForStudent(student.getId()));
    }

    @GetMapping("/recruiter/jobs/{jobId}/applications")
    @PreAuthorize("hasRole('RECRUITER')")
    public ApiResponse<List<Application>> applicationsForJob(@PathVariable Long jobId) {
        return ApiResponse.success(applicationService.getApplicationsForJob(jobId));
    }

    @PatchMapping("/recruiter/applications/{applicationId}/status")
    @PreAuthorize("hasRole('RECRUITER')")
    public ApiResponse<Application> updateStatus(@PathVariable Long applicationId,
                                                  @Valid @RequestBody StatusUpdateRequest request,
                                                  Authentication authentication) {
        return ApiResponse.success(
                applicationService.updateStatus(applicationId, request.getStatus(), authentication.getName()));
    }
}

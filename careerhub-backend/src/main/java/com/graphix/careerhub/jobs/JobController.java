package com.graphix.careerhub.jobs;

import com.graphix.careerhub.common.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/jobs")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @GetMapping("/public/search")
    public ApiResponse<List<Job>> searchJobs() {
        return ApiResponse.success(jobService.getAllOpenJobs());
    }
}

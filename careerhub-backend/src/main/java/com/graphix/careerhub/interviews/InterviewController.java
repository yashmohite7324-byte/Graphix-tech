package com.graphix.careerhub.interviews;

import com.graphix.careerhub.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/interviews")
public class InterviewController {

    private final InterviewService interviewService;

    public InterviewController(InterviewService interviewService) {
        this.interviewService = interviewService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('RECRUITER','PLACEMENT_ADMIN','SUPER_ADMIN')")
    public ApiResponse<Interview> schedule(@Valid @RequestBody InterviewRequest req,
                                            Authentication auth) {
        return ApiResponse.success(interviewService.schedule(req, auth.getName()));
    }

    @PatchMapping("/{id}/result")
    @PreAuthorize("hasAnyRole('RECRUITER','PLACEMENT_ADMIN','SUPER_ADMIN')")
    public ApiResponse<Interview> updateResult(@PathVariable Long id,
                                               @RequestBody Map<String, String> body,
                                               Authentication auth) {
        Interview.Result result = Interview.Result.valueOf(body.get("result").toUpperCase());
        String feedback = body.get("feedback");
        return ApiResponse.success(interviewService.updateResult(id, result, feedback, auth.getName()));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ApiResponse<List<Interview>> myInterviews(Authentication auth) {
        return ApiResponse.success(interviewService.getForStudent(
                interviewService.getAll().size() > 0 ? 1L : 0L));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('PLACEMENT_ADMIN','SUPER_ADMIN')")
    public ApiResponse<List<Interview>> all() {
        return ApiResponse.success(interviewService.getAll());
    }
}

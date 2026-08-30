package com.graphix.careerhub.training;

import com.graphix.careerhub.common.ApiResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/training")
public class TrainingController {

    private final TrainingService trainingService;

    public TrainingController(TrainingService trainingService) {
        this.trainingService = trainingService;
    }

    @PostMapping("/programs")
    @PreAuthorize("hasAnyRole('TRAINER','PLACEMENT_ADMIN','SUPER_ADMIN')")
    public ApiResponse<TrainingProgram> createProgram(@RequestBody TrainingProgram program) {
        return ApiResponse.success(trainingService.createProgram(program));
    }

    @GetMapping("/programs")
    public ApiResponse<List<TrainingProgram>> getAll() {
        return ApiResponse.success(trainingService.getAllPrograms());
    }

    @PostMapping("/attendance")
    @PreAuthorize("hasAnyRole('TRAINER','PLACEMENT_ADMIN','SUPER_ADMIN')")
    public ApiResponse<Attendance> markAttendance(@RequestBody Map<String, String> body) {
        return ApiResponse.success(trainingService.markAttendance(
                Long.parseLong(body.get("programId")),
                Long.parseLong(body.get("studentId")),
                body.get("date"), body.get("status")));
    }

    @GetMapping("/attendance/summary")
    public ApiResponse<Map<String, Object>> attendanceSummary(@RequestParam Long studentId,
                                                               @RequestParam Long programId) {
        return ApiResponse.success(trainingService.getAttendanceSummary(studentId, programId));
    }

    @PostMapping("/scores")
    @PreAuthorize("hasAnyRole('TRAINER','PLACEMENT_ADMIN','SUPER_ADMIN')")
    public ApiResponse<AssessmentScore> saveScore(@RequestBody Map<String, String> body) {
        return ApiResponse.success(trainingService.saveScore(
                Long.parseLong(body.get("assessmentId")),
                Long.parseLong(body.get("studentId")),
                Double.parseDouble(body.get("score")),
                body.get("remarks")));
    }

    @GetMapping("/scores/student/{studentId}")
    public ApiResponse<List<AssessmentScore>> studentScores(@PathVariable Long studentId) {
        return ApiResponse.success(trainingService.getScoresForStudent(studentId));
    }
}

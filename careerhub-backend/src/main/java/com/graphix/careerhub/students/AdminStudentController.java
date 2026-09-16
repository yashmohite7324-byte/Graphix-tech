package com.graphix.careerhub.students;

import com.graphix.careerhub.common.ApiResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/students")
@PreAuthorize("hasAnyRole('SUPER_ADMIN','PLACEMENT_ADMIN')")
public class AdminStudentController {

    private final StudentService studentService;

    public AdminStudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping
    public ApiResponse<List<StudentProfile>> getAllStudents() {
        return ApiResponse.success(studentService.getAllStudents());
    }

    @PatchMapping("/{id}/approve")
    public ApiResponse<StudentProfile> approveStudent(@PathVariable Long id, Authentication authentication) {
        return ApiResponse.success(studentService.approveStudent(id, authentication.getName()));
    }

    @PatchMapping("/{id}/reject")
    public ApiResponse<StudentProfile> rejectStudent(@PathVariable Long id, Authentication authentication) {
        return ApiResponse.success(studentService.rejectStudent(id, authentication.getName()));
    }
}

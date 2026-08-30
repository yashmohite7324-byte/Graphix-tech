package com.graphix.careerhub.students;

import com.graphix.careerhub.common.ApiResponse;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/student")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping("/me")
    public ApiResponse<StudentProfile> getMyProfile(Authentication authentication) {
        return ApiResponse.success(studentService.getProfileByEmail(authentication.getName()));
    }

    @PutMapping("/me")
    public ApiResponse<StudentProfile> updateMyProfile(Authentication authentication, @RequestBody StudentProfile profile) {
        return ApiResponse.success(studentService.updateProfile(authentication.getName(), profile));
    }
}

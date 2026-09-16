package com.graphix.careerhub.students;

import com.graphix.careerhub.common.ApiResponse;
import com.graphix.careerhub.students.dto.StudentProfileResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/student")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping("/me")
    public ApiResponse<StudentProfileResponse> getMyProfile(Authentication authentication) {
        return ApiResponse.success(studentService.getProfileResponseByEmail(authentication.getName()));
    }

    @PutMapping("/me")
    public ApiResponse<StudentProfileResponse> updateMyProfile(Authentication authentication, @RequestBody StudentProfile profile) {
        return ApiResponse.success(studentService.updateProfile(authentication.getName(), profile));
    }

    @PostMapping(value = "/profile/resume", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<StudentProfileResponse> uploadResume(
            Authentication authentication,
            @RequestParam("file") MultipartFile file) {
        return ApiResponse.success(studentService.uploadResume(authentication.getName(), file));
    }

    @PostMapping(value = "/profile/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<StudentProfileResponse> uploadPhoto(
            Authentication authentication,
            @RequestParam("file") MultipartFile file) {
        return ApiResponse.success(studentService.uploadPhoto(authentication.getName(), file));
    }
}

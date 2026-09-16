package com.graphix.careerhub.auth;

import com.graphix.careerhub.auth.dto.AuthResponse;
import com.graphix.careerhub.auth.dto.LoginRequest;
import com.graphix.careerhub.auth.dto.OtpVerifyRequest;
import com.graphix.careerhub.auth.dto.RefreshRequest;
import com.graphix.careerhub.auth.dto.RegisterRequest;
import com.graphix.careerhub.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ApiResponse<String> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.success(authService.register(request));
    }

    @PostMapping("/otp/send")
    public ApiResponse<String> sendOtp(@RequestBody java.util.Map<String, String> body) {
        String identifier = body.get("identifier");
        if (identifier == null) identifier = body.get("email");
        return ApiResponse.success(authService.sendOtp(identifier));
    }

    @PostMapping("/otp/verify")
    public ApiResponse<AuthResponse> verifyOtp(@Valid @RequestBody OtpVerifyRequest request) {
        return ApiResponse.success(authService.verifyOtp(request));
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.success(authService.login(request));
    }

    @PostMapping("/refresh")
    public ApiResponse<AuthResponse> refresh(@Valid @RequestBody RefreshRequest request) {
        return ApiResponse.success(authService.refresh(request.getRefreshToken()));
    }
}

package com.graphix.careerhub.auth;

import com.graphix.careerhub.audit.AuditService;
import com.graphix.careerhub.auth.dto.AuthResponse;
import com.graphix.careerhub.auth.dto.LoginRequest;
import com.graphix.careerhub.auth.dto.OtpVerifyRequest;
import com.graphix.careerhub.auth.dto.RegisterRequest;
import com.graphix.careerhub.common.BadRequestException;
import com.graphix.careerhub.common.UnauthorizedException;
import com.graphix.careerhub.users.User;
import com.graphix.careerhub.users.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.graphix.careerhub.companies.RecruiterProfile;
import com.graphix.careerhub.companies.RecruiterProfileRepository;
import com.graphix.careerhub.students.StudentProfile;
import com.graphix.careerhub.students.StudentProfileRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final OtpService otpService;
    private final RefreshTokenService refreshTokenService;
    private final AuditService auditService;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final StudentProfileRepository studentProfileRepository;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                        JwtService jwtService, OtpService otpService,
                        RefreshTokenService refreshTokenService, AuditService auditService,
                        RecruiterProfileRepository recruiterProfileRepository,
                        StudentProfileRepository studentProfileRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.otpService = otpService;
        this.refreshTokenService = refreshTokenService;
        this.auditService = auditService;
        this.recruiterProfileRepository = recruiterProfileRepository;
        this.studentProfileRepository = studentProfileRepository;
    }

    public String register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }

        String roleUpper = request.getRole().toUpperCase();
        if (!roleUpper.equals("STUDENT") && !roleUpper.equals("RECRUITER")) {
            throw new BadRequestException("Self-registration is only allowed for STUDENT or RECRUITER");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setMobile(request.getMobile());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.valueOf(roleUpper));
        user.setStatus(User.Status.PENDING);
        userRepository.save(user);

        otpService.generateOtp(request.getEmail());
        auditService.log(request.getEmail(), "REGISTER", "User", null, "New " + roleUpper + " registered");

        return "Registration successful. OTP sent to " + request.getEmail();
    }

    public String verifyOtp(OtpVerifyRequest request) {
        otpService.verifyOtp(request.getEmail(), request.getOtp());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("User not found"));
        user.setStatus(User.Status.ACTIVE);
        userRepository.save(user);

        auditService.log(request.getEmail(), "OTP_VERIFIED", "User", user.getId().toString(), null);
        return "Account verified. You can now log in.";
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid credentials");
        }
        if (user.getStatus() != User.Status.ACTIVE) {
            throw new UnauthorizedException("Account not verified yet");
        }

        String accessToken = jwtService.generateAccessToken(user.getEmail(), user.getRole().name());
        RefreshToken refreshToken = refreshTokenService.issue(user);

        auditService.log(user.getEmail(), "LOGIN", "User", user.getId().toString(), null);

        String name = null;
        String designation = null;
        String companyName = null;

        if (user.getRole() == User.Role.RECRUITER) {
            RecruiterProfile rp = recruiterProfileRepository.findByUserId(user.getId()).orElse(null);
            if (rp != null) {
                designation = rp.getDesignation();
                if (rp.getCompany() != null) {
                    companyName = rp.getCompany().getName();
                }
            }
        } else if (user.getRole() == User.Role.STUDENT) {
            StudentProfile sp = studentProfileRepository.findByUserId(user.getId()).orElse(null);
            if (sp != null) {
                name = sp.getFullName();
            }
        }

        return new AuthResponse(accessToken, refreshToken.getToken(), user.getRole().name(), user.getEmail(), name, designation, companyName);
    }

    public AuthResponse refresh(String rawRefreshToken) {
        RefreshToken rotated = refreshTokenService.rotate(rawRefreshToken);
        User user = rotated.getUser();
        String accessToken = jwtService.generateAccessToken(user.getEmail(), user.getRole().name());
        return new AuthResponse(accessToken, rotated.getToken(), user.getRole().name(), user.getEmail(), null, null, null);
    }
}

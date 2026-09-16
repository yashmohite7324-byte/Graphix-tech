package com.graphix.careerhub.auth;

import com.graphix.careerhub.audit.AuditService;
import com.graphix.careerhub.auth.dto.AuthResponse;
import com.graphix.careerhub.auth.dto.LoginRequest;
import com.graphix.careerhub.auth.dto.OtpVerifyRequest;
import com.graphix.careerhub.auth.dto.RegisterRequest;
import com.graphix.careerhub.common.BadRequestException;
import com.graphix.careerhub.common.UnauthorizedException;
import com.graphix.careerhub.companies.Company;
import com.graphix.careerhub.companies.CompanyRepository;
import com.graphix.careerhub.companies.RecruiterProfile;
import com.graphix.careerhub.companies.RecruiterProfileRepository;
import com.graphix.careerhub.students.StudentProfile;
import com.graphix.careerhub.students.StudentProfileRepository;
import com.graphix.careerhub.users.User;
import com.graphix.careerhub.users.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private final CompanyRepository companyRepository;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                        JwtService jwtService, OtpService otpService,
                        RefreshTokenService refreshTokenService, AuditService auditService,
                        RecruiterProfileRepository recruiterProfileRepository,
                        StudentProfileRepository studentProfileRepository,
                        CompanyRepository companyRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.otpService = otpService;
        this.refreshTokenService = refreshTokenService;
        this.auditService = auditService;
        this.recruiterProfileRepository = recruiterProfileRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.companyRepository = companyRepository;
    }

    @Transactional
    public String register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }

        String roleUpper = request.getRole().toUpperCase();
        if (!roleUpper.equals("STUDENT") && !roleUpper.equals("RECRUITER")) {
            throw new BadRequestException("Self-registration is only allowed for STUDENT or RECRUITER");
        }

        User user = new User();
        user.setEmail(request.getEmail().trim());
        String mobileVal = (request.getMobile() != null && !request.getMobile().isBlank()) ? request.getMobile().trim() : null;
        user.setMobile(mobileVal);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.valueOf(roleUpper));
        user.setStatus(User.Status.PENDING);
        userRepository.save(user);

        if (user.getRole() == User.Role.RECRUITER) {
            Company company = new Company();
            company.setName(request.getEmail().split("@")[0] + " Corp");
            company.setIndustry("Technology");
            company.setVerificationStatus(Company.VerificationStatus.PENDING);
            companyRepository.save(company);

            RecruiterProfile rp = new RecruiterProfile();
            rp.setUser(user);
            rp.setCompany(company);
            rp.setDesignation("Hiring Manager");
            recruiterProfileRepository.save(rp);
        } else if (user.getRole() == User.Role.STUDENT) {
            StudentProfile sp = new StudentProfile();
            sp.setUser(user);
            sp.setFullName(request.getEmail().split("@")[0]);
            studentProfileRepository.save(sp);
        }

        String target = (request.getMobile() != null && !request.getMobile().isBlank()) ? request.getMobile() : request.getEmail();
        otpService.generateOtp(target);
        if (!target.equals(request.getEmail())) {
            otpService.generateOtp(request.getEmail());
        }

        auditService.log(request.getEmail(), "REGISTER", "User", user.getId().toString(), "New " + roleUpper + " registered");

        return "Registration successful. Twilio SMS OTP sent to " + target;
    }

    public String sendOtp(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            throw new BadRequestException("Identifier cannot be empty");
        }
        otpService.generateOtp(identifier.trim());
        return "OTP sent successfully to " + identifier;
    }

    @Transactional
    public AuthResponse verifyOtp(OtpVerifyRequest request) {
        otpService.verifyOtp(request.getEmail(), request.getOtp());

        User user = userRepository.findByEmail(request.getEmail())
                .or(() -> userRepository.findByMobile(request.getEmail()))
                .orElseThrow(() -> new BadRequestException("User not found"));
        
        user.setStatus(User.Status.ACTIVE);
        userRepository.save(user);

        auditService.log(user.getEmail(), "OTP_VERIFIED", "User", user.getId().toString(), null);

        // Prevent Recruiter from getting JWT if company is pending/rejected
        if (user.getRole() == User.Role.RECRUITER) {
            RecruiterProfile rp = recruiterProfileRepository.findByUserId(user.getId()).orElse(null);
            if (rp != null && rp.getCompany() != null) {
                Company company = rp.getCompany();
                if (company.getVerificationStatus() == Company.VerificationStatus.PENDING) {
                    throw new UnauthorizedException("OTP Verified successfully! However, your company account is pending approval by the Placement Admin. You will be able to log in once approved.");
                }
                if (company.getVerificationStatus() == Company.VerificationStatus.REJECTED) {
                    throw new UnauthorizedException("Your company account has been rejected by the Placement Admin.");
                }
            }
        }

        // Prevent Student from getting JWT if pending/rejected
        if (user.getRole() == User.Role.STUDENT) {
            StudentProfile sp = studentProfileRepository.findByUserId(user.getId()).orElse(null);
            if (sp != null) {
                if (sp.getVerificationStatus() == StudentProfile.VerificationStatus.PENDING) {
                    throw new UnauthorizedException("OTP Verified successfully! However, your student account is pending approval by the Placement Admin. You will be able to log in once approved.");
                }
                if (sp.getVerificationStatus() == StudentProfile.VerificationStatus.REJECTED) {
                    throw new UnauthorizedException("Your student account has been rejected by the Placement Admin.");
                }
            }
        }

        String accessToken = jwtService.generateAccessToken(user.getEmail(), user.getRole().name());
        RefreshToken refreshToken = refreshTokenService.issue(user);

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

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .or(() -> userRepository.findByMobile(request.getEmail()))
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid credentials");
        }

        // If Recruiter, check Company verification status FIRST
        if (user.getRole() == User.Role.RECRUITER) {
            RecruiterProfile rp = recruiterProfileRepository.findByUserId(user.getId()).orElse(null);
            if (rp != null && rp.getCompany() != null) {
                Company company = rp.getCompany();
                if (company.getVerificationStatus() == Company.VerificationStatus.PENDING) {
                    throw new UnauthorizedException("Company account pending approval by Placement Admin. Please wait for admin approval.");
                }
                if (company.getVerificationStatus() == Company.VerificationStatus.REJECTED) {
                    throw new UnauthorizedException("Company account rejected by Placement Admin.");
                }
            }
        }

        // If Student, check Student verification status FIRST
        if (user.getRole() == User.Role.STUDENT) {
            StudentProfile sp = studentProfileRepository.findByUserId(user.getId()).orElse(null);
            if (sp != null) {
                if (sp.getVerificationStatus() == StudentProfile.VerificationStatus.PENDING) {
                    throw new UnauthorizedException("Student account pending approval by Placement Admin. Please wait for admin approval.");
                }
                if (sp.getVerificationStatus() == StudentProfile.VerificationStatus.REJECTED) {
                    throw new UnauthorizedException("Student account rejected by Placement Admin.");
                }
            }
        }

        // Admin does NOT require OTP -> login immediately
        if (user.getRole() == User.Role.PLACEMENT_ADMIN || user.getRole() == User.Role.SUPER_ADMIN) {
            user.setStatus(User.Status.ACTIVE);
            userRepository.save(user);

            String accessToken = jwtService.generateAccessToken(user.getEmail(), user.getRole().name());
            RefreshToken refreshToken = refreshTokenService.issue(user);

            auditService.log(user.getEmail(), "LOGIN", "User", user.getId().toString(), null);

            return new AuthResponse(accessToken, refreshToken.getToken(), user.getRole().name(), user.getEmail(), "Admin", "Placement Admin", "Graphix TechHire");
        }

        // For Student and Recruiter -> Send Twilio SMS OTP
        String identifier = (user.getMobile() != null && !user.getMobile().isBlank()) ? user.getMobile() : user.getEmail();
        otpService.generateOtp(identifier);
        if (!identifier.equals(user.getEmail())) {
            otpService.generateOtp(user.getEmail());
        }

        auditService.log(user.getEmail(), "LOGIN_OTP_TRIGGERED", "User", user.getId().toString(), null);

        // Return AuthResponse with token prefix REQUIRES_OTP
        return new AuthResponse("REQUIRES_OTP:" + identifier, null, user.getRole().name(), user.getEmail(), null, null, null);
    }

    public AuthResponse refresh(String rawRefreshToken) {
        RefreshToken rotated = refreshTokenService.rotate(rawRefreshToken);
        User user = rotated.getUser();
        String accessToken = jwtService.generateAccessToken(user.getEmail(), user.getRole().name());
        return new AuthResponse(accessToken, rotated.getToken(), user.getRole().name(), user.getEmail(), null, null, null);
    }
}

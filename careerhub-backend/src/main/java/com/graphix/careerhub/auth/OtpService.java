package com.graphix.careerhub.auth;

import com.graphix.careerhub.common.UnauthorizedException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
public class OtpService {

    private final OtpVerificationRepository otpVerificationRepository;
    private final EmailService emailService;
    private final TwilioSmsService twilioSmsService;

    @Value("${app.otp.expiration-minutes:10}")
    private int expirationMinutes;

    public OtpService(OtpVerificationRepository otpVerificationRepository, 
                      EmailService emailService,
                      TwilioSmsService twilioSmsService) {
        this.otpVerificationRepository = otpVerificationRepository;
        this.emailService = emailService;
        this.twilioSmsService = twilioSmsService;
    }

    public String generateOtp(String identifier) {
        String code = String.format("%06d", new Random().nextInt(999999));

        OtpVerification otp = new OtpVerification();
        otp.setIdentifier(identifier);
        otp.setCode(code);
        otp.setExpiresAt(LocalDateTime.now().plusMinutes(expirationMinutes));
        otp.setConsumed(false);
        otpVerificationRepository.save(otp);

        // Send OTP via Email if identifier contains @
        if (identifier != null && identifier.contains("@")) {
            emailService.sendOtpEmail(identifier, code);
        }

        // Send OTP via Twilio SMS
        twilioSmsService.sendSmsOtp(identifier, code);

        return code;
    }

    public void verifyOtp(String identifier, String code) {
        OtpVerification otp = otpVerificationRepository
                .findTopByIdentifierAndConsumedFalseOrderByCreatedAtDesc(identifier)
                .orElseThrow(() -> new UnauthorizedException("No OTP request found for this identifier"));

        if (otp.isConsumed()) {
            throw new UnauthorizedException("OTP already used");
        }
        if (otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new UnauthorizedException("OTP expired, please request a new one");
        }
        if (!otp.getCode().equals(code)) {
            throw new UnauthorizedException("Incorrect OTP");
        }

        otp.setConsumed(true);
        otpVerificationRepository.save(otp);
    }
}

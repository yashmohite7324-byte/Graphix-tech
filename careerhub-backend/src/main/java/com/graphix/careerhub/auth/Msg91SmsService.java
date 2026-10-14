package com.graphix.careerhub.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Service
public class Msg91SmsService {

    @Value("${msg91.auth-key:}")
    private String authKey;

    @Value("${msg91.template-id:}")
    private String templateId;

    @Value("${msg91.sender-id:GRPHIX}")
    private String senderId;

    @Value("${msg91.otp-expiry-minutes:10}")
    private int otpExpiryMinutes;

    @Value("${msg91.enabled:true}")
    private boolean enabled;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public String getResolvedAuthKey() {
        if (authKey != null && !authKey.isBlank()) return authKey.trim();
        String env = System.getenv("MSG91_AUTH_KEY");
        return env != null ? env.trim() : null;
    }

    public String getResolvedTemplateId() {
        if (templateId != null && !templateId.isBlank()) return templateId.trim();
        String env = System.getenv("MSG91_TEMPLATE_ID");
        return env != null ? env.trim() : null;
    }

    public String formatMobile(String mobile) {
        if (mobile == null || mobile.isBlank()) return null;
        String digits = mobile.replaceAll("[^0-9]", "");
        if (digits.length() == 10) {
            return "91" + digits;
        }
        if (digits.length() == 11 && digits.startsWith("0")) {
            return "91" + digits.substring(1);
        }
        if (digits.length() == 12 && digits.startsWith("91")) {
            return digits;
        }
        return digits;
    }

    public boolean isRemoteVerificationAvailable() {
        String key = getResolvedAuthKey();
        return enabled && key != null && !key.isBlank();
    }

    public boolean sendOtp(String rawMobile, String otpCode) {
        if (!enabled) {
            return false;
        }

        if (rawMobile == null || rawMobile.isBlank() || rawMobile.contains("@")) {
            return false; // Email is handled by EmailService
        }

        String mobile = formatMobile(rawMobile);
        if (mobile == null || mobile.length() < 10) {
            return false;
        }

        String key = getResolvedAuthKey();
        String tpl = getResolvedTemplateId();

        // Print log for dev/test debugging
        System.out.println("\n=======================================================");
        System.out.println("[MSG91 LOG] Preparing OTP for mobile: " + mobile + " (" + rawMobile + ")");
        System.out.println("[MSG91 LOG] Generated OTP Code: " + otpCode);
        if (key == null || key.isBlank()) {
            System.out.println("[MSG91 NOTICE] MSG91_AUTH_KEY not set in environment or application.properties.");
            System.out.println("[MSG91 NOTICE] Use master OTP '123456' for instant sign in.");
            System.out.println("=======================================================\n");
            return false;
        }
        System.out.println("=======================================================\n");

        try {
            // MSG91 v5 OTP API URL
            StringBuilder urlBuilder = new StringBuilder("https://control.msg91.com/api/v5/otp?");
            urlBuilder.append("mobile=").append(mobile);
            urlBuilder.append("&otp=").append(otpCode);
            urlBuilder.append("&authkey=").append(key);
            urlBuilder.append("&otp_expiry=").append(otpExpiryMinutes);

            if (tpl != null && !tpl.isBlank()) {
                urlBuilder.append("&template_id=").append(tpl.trim());
            }

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(urlBuilder.toString()))
                    .header("Content-Type", "application/json")
                    .header("authkey", key)
                    .POST(HttpRequest.BodyPublishers.noBody())
                    .timeout(Duration.ofSeconds(10))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            int statusCode = response.statusCode();
            String body = response.body();

            if (statusCode >= 200 && statusCode < 300) {
                System.out.println("[MSG91 SUCCESS] SMS OTP successfully dispatched to " + mobile + " | Response: " + body);
                return true;
            } else {
                System.err.println("[MSG91 WARNING] API returned status " + statusCode + ": " + body);
                return false;
            }
        } catch (Exception e) {
            System.err.println("[MSG91 EXCEPTION] Failed to dispatch SMS to " + mobile + ": " + e.getMessage());
            return false;
        }
    }

    public boolean verifyOtpRemote(String rawMobile, String otpCode) {
        String key = getResolvedAuthKey();
        if (key == null || key.isBlank()) return false;

        String mobile = formatMobile(rawMobile);
        if (mobile == null) return false;

        try {
            String url = "https://control.msg91.com/api/v5/otp/verify?mobile=" + mobile + "&otp=" + otpCode + "&authkey=" + key;
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("authkey", key)
                    .GET()
                    .timeout(Duration.ofSeconds(8))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200 && response.body() != null && response.body().contains("success")) {
                System.out.println("[MSG91 VERIFY SUCCESS] Mobile " + mobile + " verified via MSG91.");
                return true;
            }
        } catch (Exception e) {
            System.err.println("[MSG91 VERIFY EXCEPTION] " + e.getMessage());
        }
        return false;
    }
}

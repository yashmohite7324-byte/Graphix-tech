package com.graphix.careerhub.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Service
public class EmailService {

    @Value("${app.resend.api-key:}")
    private String apiKey;

    @Value("${app.resend.from-email:onboarding@resend.dev}")
    private String fromEmail;

    @Value("${app.resend.test-recipient:yashmohite7324@gmail.com}")
    private String testRecipient;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public void sendOtpEmail(String to, String otp) {
        System.out.println("======================================================");
        System.out.println("Sending Resend Transactional Email OTP for user: " + to);
        System.out.println("Generated Verification OTP Code: " + otp);
        System.out.println("======================================================");

        if (apiKey == null || apiKey.isBlank()) {
            System.err.println("[RESEND WARNING] No Resend API key configured. Email skipped.");
            return;
        }

        // Determine destination: On Resend free tier (onboarding@resend.dev), only verified developer email is allowed
        final String targetEmail = (fromEmail != null && fromEmail.contains("resend.dev"))
                ? testRecipient
                : to;

        Thread.ofVirtual().start(() -> {
            try {
                String htmlContent = "<div style='font-family: Arial, sans-serif; padding: 25px; background-color: #0f172a; color: #f8fafc; border-radius: 12px; max-width: 480px; margin: 0 auto;'>"
                        + "<h2 style='color: #6366f1; text-align: center; margin-top: 0;'>Graphix TechHire</h2>"
                        + "<p style='color: #cbd5e1; font-size: 15px;'>Your verification OTP code for <strong>" + to + "</strong> is:</p>"
                        + "<div style='background-color: #1e293b; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;'>"
                        + "<span style='color: #38bdf8; font-size: 32px; font-weight: bold; letter-spacing: 6px; font-family: monospace;'>" + otp + "</span>"
                        + "</div>"
                        + "<p style='color: #94a3b8; font-size: 13px;'>Valid for 10 minutes. Do not share this OTP with anyone.</p>"
                        + "</div>";

                String jsonPayload = String.format(
                        "{\"from\":\"Graphix TechHire <%s>\",\"to\":[\"%s\"],\"subject\":\"Your Verification OTP (%s) - Graphix TechHire\",\"html\":\"%s\"}",
                        fromEmail.trim(),
                        targetEmail.trim(),
                        otp,
                        htmlContent.replace("\"", "\\\"")
                );

                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create("https://api.resend.com/emails"))
                        .header("Authorization", "Bearer " + apiKey.trim())
                        .header("Content-Type", "application/json")
                        .header("User-Agent", "Graphix-TechHire-Backend/1.0")
                        .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                        .timeout(Duration.ofSeconds(10))
                        .build();

                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                if (response.statusCode() >= 200 && response.statusCode() < 300) {
                    System.out.println("[RESEND SUCCESS] Sent OTP email to " + targetEmail + " (for " + to + ") | Response: " + response.body());
                } else {
                    System.err.println("[RESEND ERROR] Failed to send email to " + targetEmail + " (HTTP " + response.statusCode() + "): " + response.body());
                }
            } catch (Exception e) {
                System.err.println("[RESEND EXCEPTION] Could not dispatch email to " + targetEmail + ": " + e.getMessage());
            }
        });
    }
}

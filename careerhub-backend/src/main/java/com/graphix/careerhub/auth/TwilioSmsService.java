package com.graphix.careerhub.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Service
public class TwilioSmsService {

    @Value("${twilio.account-sid:}")
    private String accountSid;

    @Value("${twilio.auth-token:}")
    private String authToken;

    @Value("${twilio.phone-number:+18005550199}")
    private String fromPhoneNumber;

    @Value("${twilio.default-to-number:}")
    private String defaultToPhoneNumber;

    private final RestTemplate restTemplate = new RestTemplate();

    private String getResolvedAccountSid() {
        if (accountSid != null && !accountSid.isBlank()) return accountSid.trim();
        String envSid = System.getenv("TWILIO_ACCOUNT_SID");
        return envSid != null ? envSid.trim() : null;
    }

    private String getResolvedAuthToken() {
        if (authToken != null && !authToken.isBlank()) return authToken.trim();
        String envToken = System.getenv("TWILIO_AUTH_TOKEN");
        return envToken != null ? envToken.trim() : null;
    }

    public boolean sendSmsOtp(String toPhoneNumber, String otpCode) {
        String sid = getResolvedAccountSid();
        String token = getResolvedAuthToken();

        String targetPhone = toPhoneNumber;
        if (targetPhone == null || targetPhone.isBlank() || targetPhone.contains("@")) {
            if (defaultToPhoneNumber != null && !defaultToPhoneNumber.isBlank()) {
                targetPhone = defaultToPhoneNumber.trim();
            }
        }

        if (sid == null || sid.isBlank() || token == null || token.isBlank()) {
            System.out.println("\n=======================================================");
            System.out.println("[LOCAL LOG] Twilio credentials missing.");
            System.out.println("OTP CODE FOR " + toPhoneNumber + " IS: " + otpCode);
            System.out.println("=======================================================\n");
            return false;
        }

        // ALWAYS log the OTP code to console for easy development/testing
        System.out.println("\n=======================================================");
        System.out.println("[DEV LOG] OTP CODE FOR " + toPhoneNumber + " IS: " + otpCode);
        if (targetPhone != null && !targetPhone.equals(toPhoneNumber)) {
            System.out.println("[DEV LOG] Routing SMS to default number: " + targetPhone);
        }
        System.out.println("=======================================================\n");

        try {
            String url = "https://api.twilio.com/2010-04-01/Accounts/" + sid + "/Messages.json";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            String auth = sid + ":" + token;
            String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes(StandardCharsets.UTF_8));
            headers.set("Authorization", "Basic " + encodedAuth);

            MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
            map.add("To", targetPhone != null && !targetPhone.isBlank() ? targetPhone : toPhoneNumber);
            map.add("From", fromPhoneNumber);
            map.add("Body", "Your Graphix TechHire OTP verification code is: " + otpCode + ". Valid for 10 minutes.");

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                System.out.println("Twilio SMS OTP sent successfully to " + map.getFirst("To"));
                return true;
            } else {
                System.err.println("Twilio API returned status: " + response.getStatusCode());
                return false;
            }
        } catch (Exception e) {
            System.err.println("\n[TWILIO ERROR] Failed to send Twilio SMS to " + targetPhone + ".");
            System.err.println("Reason: " + e.getMessage());
            System.err.println("If you are using a Twilio Trial account, ensure the destination number is VERIFIED in Twilio console.");
            System.err.println("Also ensure 'twilio.default-to-number' is set in application-local.properties!\n");
            return false;
        }
    }
}

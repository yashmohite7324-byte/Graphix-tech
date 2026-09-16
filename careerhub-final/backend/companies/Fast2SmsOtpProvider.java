package com.graphix.careerhub.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Map;

/**
 * Fast2SMS OTP Provider — FREE tier available.
 * Active when: app.otp.provider=fast2sms
 *
 * ─── Why Fast2SMS ─────────────────────────────────────────────
 * Fast2SMS offers a FREE plan with ₹50 credit on signup (~15–20 SMS).
 * Paid plans start at ₹200 for 1,000 SMS (₹0.20/SMS).
 * This is the cheapest production SMS option for India.
 * No monthly fee — pure pay-per-SMS.
 *
 * ─── Setup (5 minutes) ────────────────────────────────────────
 * 1. Go to https://www.fast2sms.com → Sign Up
 * 2. Verify your mobile number
 * 3. Dashboard → Dev API → copy your API_KEY
 * 4. No template approval needed for "Quick SMS" mode
 *    (Template/DLT mode requires TRAI registration for production)
 *
 * 5. Add to application.properties:
 *    app.otp.provider=fast2sms
 *    fast2sms.api-key=YOUR_API_KEY
 *
 * Fast2SMS API Docs: https://www.fast2sms.com/docs
 */
@Component
@ConditionalOnProperty(name = "app.otp.provider", havingValue = "fast2sms")
public class Fast2SmsOtpProvider implements OtpProvider {

    private static final Logger log = LoggerFactory.getLogger(Fast2SmsOtpProvider.class);

    @Value("${fast2sms.api-key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public void sendOtp(String mobile, String otp) {
        try {
            // Fast2SMS Quick SMS endpoint (no DLT template registration needed for dev)
            String url = UriComponentsBuilder.fromHttpUrl("https://www.fast2sms.com/dev/bulkV2")
                .queryParam("authorization", apiKey)
                .queryParam("route", "otp")
                .queryParam("variables_values", otp)
                .queryParam("flash", 0)
                .queryParam("numbers", normalizeMobile(mobile))
                .toUriString();

            HttpHeaders headers = new HttpHeaders();
            headers.set("cache-control", "no-cache");

            ResponseEntity<Map> response = restTemplate.exchange(
                url, HttpMethod.GET, new HttpEntity<>(headers), Map.class
            );

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Fast2SMS OTP sent to {}", mobile);
            } else {
                throw new OtpDeliveryException("Fast2SMS returned: " + response.getStatusCode());
            }
        } catch (OtpDeliveryException e) {
            throw e;
        } catch (Exception e) {
            log.error("Fast2SMS failed: {}", e.getMessage());
            throw new OtpDeliveryException("Fast2SMS delivery failed: " + e.getMessage(), e);
        }
    }

    private String normalizeMobile(String mobile) {
        return mobile.replaceAll("[^0-9]", "").replaceAll("^91", "");
    }
}

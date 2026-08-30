package com.graphix.careerhub.auth;

import org.springframework.stereotype.Service;

@Service
public class EmailService {

    public void sendOtpEmail(String to, String otp) {
        // Since we are not using real email credentials, we will just log the OTP to the backend console.
        // The user can check the backend console to find this OTP and enter it in the frontend.
        System.out.println("======================================================");
        System.out.println("Mock Email Service triggered for: " + to);
        System.out.println("Your OTP for Graphix CareerHub is: " + otp);
        System.out.println("======================================================");
    }
}

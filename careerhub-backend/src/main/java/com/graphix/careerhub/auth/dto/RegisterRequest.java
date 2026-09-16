package com.graphix.careerhub.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {

    @Email
    @NotBlank
    private String email;

    private String mobile;

    @NotBlank
    private String password;

    @NotBlank
    private String role; // STUDENT or RECRUITER (self-registration roles)
}

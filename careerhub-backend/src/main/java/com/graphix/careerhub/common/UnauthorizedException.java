package com.graphix.careerhub.common;

/** Thrown for authentication failures: bad credentials, invalid/expired OTP or token. */
public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
}

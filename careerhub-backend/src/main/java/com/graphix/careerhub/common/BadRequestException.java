package com.graphix.careerhub.common;

/** Thrown for invalid business operations: duplicate email, ineligible application, etc. */
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}

package com.graphix.careerhub.common;

/** Thrown when a requested entity (student, job, application, etc.) does not exist. */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}

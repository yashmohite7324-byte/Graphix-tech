package com.graphix.careerhub.common;

import lombok.Getter;

import java.util.UUID;

/**
 * Every API response is wrapped in this shape so the frontend can rely on
 * one consistent contract: { success, data, error, requestId }.
 */
@Getter
public class ApiResponse<T> {

    private final boolean success;
    private final T data;
    private final String error;
    private final String requestId;

    private ApiResponse(boolean success, T data, String error) {
        this.success = success;
        this.data = data;
        this.error = error;
        this.requestId = UUID.randomUUID().toString();
    }

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, data, null);
    }

    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, null, message);
    }
}

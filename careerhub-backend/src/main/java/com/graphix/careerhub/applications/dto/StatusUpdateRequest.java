package com.graphix.careerhub.applications.dto;

import com.graphix.careerhub.applications.Application;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StatusUpdateRequest {

    @NotNull
    private Application.Status status;
}

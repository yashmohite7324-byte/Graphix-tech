package com.graphix.careerhub.interviews;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter @Setter
public class InterviewRequest {
    @NotNull private Long applicationId;
    @NotNull private Integer round;
    @NotNull private LocalDateTime scheduledAt;
    @NotNull private String mode;
    private String venue;
    private String meetingLink;
    private String panel;
}

package com.graphix.careerhub.interviews;

import com.graphix.careerhub.applications.Application;
import com.graphix.careerhub.common.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "interviews")
@Getter @Setter
public class Interview extends BaseEntity {

    public enum Mode { ONLINE, OFFLINE, HYBRID }
    public enum Result { PENDING, PASSED, FAILED, NO_SHOW }

    @ManyToOne
    @JoinColumn(name = "application_id")
    private Application application;

    private Integer round;
    private LocalDateTime scheduledAt;

    @Enumerated(EnumType.STRING)
    private Mode mode;

    private String venue;
    private String meetingLink;
    private String panel;

    @Enumerated(EnumType.STRING)
    private Result result = Result.PENDING;

    @Column(columnDefinition = "TEXT")
    private String feedback;
}

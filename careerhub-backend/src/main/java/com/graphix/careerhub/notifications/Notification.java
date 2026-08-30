package com.graphix.careerhub.notifications;

import com.graphix.careerhub.common.BaseEntity;
import com.graphix.careerhub.users.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "notifications")
@Getter @Setter
public class Notification extends BaseEntity {

    public enum Type {
        APPLICATION_UPDATE, INTERVIEW_SCHEDULED, JOB_ALERT,
        TRAINING_REMINDER, ANNOUNCEMENT, PLACEMENT_UPDATE, SYSTEM
    }

    public enum Channel { IN_APP, EMAIL, SMS, WHATSAPP, PUSH }
    public enum DeliveryStatus { PENDING, SENT, FAILED }

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    private Type type;

    @Enumerated(EnumType.STRING)
    private Channel channel;

    @Enumerated(EnumType.STRING)
    private DeliveryStatus deliveryStatus = DeliveryStatus.PENDING;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String message;

    private boolean isRead = false;
}

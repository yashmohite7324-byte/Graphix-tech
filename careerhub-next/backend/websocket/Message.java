package com.graphix.careerhub.messaging;

import com.graphix.careerhub.common.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "messages")
@Getter
@Setter
public class Message extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "conversation_id")
    private Conversation conversation;

    private Long senderId;
    private String senderEmail;

    @Column(columnDefinition = "TEXT")
    private String content;

    private boolean isRead = false;
}

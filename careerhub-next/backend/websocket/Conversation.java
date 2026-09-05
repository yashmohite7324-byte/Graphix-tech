package com.graphix.careerhub.messaging;

import com.graphix.careerhub.common.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/**
 * Represents a chat thread between two users (student ↔ recruiter).
 * Each conversation has many Messages.
 */
@Entity
@Table(name = "conversations")
@Getter
@Setter
public class Conversation extends BaseEntity {

    // Participant 1 user id
    private Long participantOneId;

    // Participant 2 user id
    private Long participantTwoId;

    // Last message preview for inbox display
    @Column(columnDefinition = "TEXT")
    private String lastMessage;

    private java.time.LocalDateTime lastMessageAt;
}

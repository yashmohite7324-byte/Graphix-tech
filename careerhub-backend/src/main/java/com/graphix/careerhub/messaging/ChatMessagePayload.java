package com.graphix.careerhub.messaging;

import lombok.Data;

/**
 * This is the payload sent over WebSocket when a user sends a chat message.
 * Frontend publishes to /app/chat.send
 * Backend broadcasts to /topic/chat/{conversationId}
 */
@Data
public class ChatMessagePayload {
    private Long conversationId;
    private Long senderId;
    private String senderEmail;
    private String content;
    private String sentAt;
}

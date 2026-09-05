package com.graphix.careerhub.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * WebSocket config using STOMP protocol.
 * Frontend connects to /ws endpoint and subscribes to topics.
 *
 * Topics:
 *   /topic/notifications/{userId}  — real-time in-app notifications
 *   /topic/chat/{conversationId}   — real-time chat messages
 *   /user/queue/messages           — private messages per user
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Enable simple in-memory broker for these prefixes
        registry.enableSimpleBroker("/topic", "/queue");
        // Prefix for messages FROM client TO server
        registry.setApplicationDestinationPrefixes("/app");
        // Prefix for user-specific queues
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS(); // fallback for browsers that don't support WebSocket
    }
}

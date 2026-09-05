package com.graphix.careerhub.messaging;

import com.graphix.careerhub.common.ApiResponse;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    /**
     * WebSocket handler — frontend sends to /app/chat.send
     * This saves the message and broadcasts it back to /topic/chat/{conversationId}
     */
    @MessageMapping("/chat.send")
    public void handleMessage(@Payload ChatMessagePayload payload) {
        chatService.sendMessage(payload);
    }

    /**
     * REST — get or create conversation between current user and another user
     * POST /api/v1/chat/conversations
     * Body: { "otherUserId": 5 }
     */
    @PostMapping("/api/v1/chat/conversations")
    public ApiResponse<Conversation> getOrCreate(@RequestBody Map<String, Long> body,
                                                  Authentication auth) {
        Long myId = getUserId(auth.getName());
        Long otherId = body.get("otherUserId");
        return ApiResponse.success(chatService.getOrCreateConversation(myId, otherId));
    }

    /**
     * REST — get all conversations for current user (inbox list)
     * GET /api/v1/chat/conversations
     */
    @GetMapping("/api/v1/chat/conversations")
    public ApiResponse<List<Conversation>> getInbox(Authentication auth) {
        return ApiResponse.success(chatService.getInbox(auth.getName()));
    }

    /**
     * REST — get message history for a conversation
     * GET /api/v1/chat/conversations/{id}/messages
     */
    @GetMapping("/api/v1/chat/conversations/{id}/messages")
    public ApiResponse<List<Message>> getMessages(@PathVariable Long id) {
        return ApiResponse.success(chatService.getMessages(id));
    }

    /**
     * REST — mark messages as read
     * PATCH /api/v1/chat/conversations/{id}/read
     */
    @PatchMapping("/api/v1/chat/conversations/{id}/read")
    public ApiResponse<String> markRead(@PathVariable Long id, Authentication auth) {
        Long userId = getUserId(auth.getName());
        chatService.markRead(id, userId);
        return ApiResponse.success("Messages marked as read");
    }

    private Long getUserId(String email) {
        // Simplified — in production inject UserRepository and look up by email
        return 1L;
    }
}

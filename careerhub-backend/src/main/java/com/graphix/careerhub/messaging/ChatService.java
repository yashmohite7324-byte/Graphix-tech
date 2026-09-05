package com.graphix.careerhub.messaging;

import com.graphix.careerhub.common.ResourceNotFoundException;
import com.graphix.careerhub.users.User;
import com.graphix.careerhub.users.UserRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ChatService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatService(ConversationRepository conversationRepository,
                       MessageRepository messageRepository,
                       UserRepository userRepository,
                       SimpMessagingTemplate messagingTemplate) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Get or create a conversation between two users.
     * Called when a student opens a chat with a recruiter or vice versa.
     */
    @Transactional
    public Conversation getOrCreateConversation(Long userOneId, Long userTwoId) {
        return conversationRepository.findBetween(userOneId, userTwoId)
                .orElseGet(() -> {
                    Conversation conv = new Conversation();
                    conv.setParticipantOneId(userOneId);
                    conv.setParticipantTwoId(userTwoId);
                    conv.setLastMessageAt(LocalDateTime.now());
                    return conversationRepository.save(conv);
                });
    }

    /**
     * Save a message to DB and broadcast it via WebSocket
     * to all subscribers of /topic/chat/{conversationId}
     */
    @Transactional
    public Message sendMessage(ChatMessagePayload payload) {
        Conversation conversation = conversationRepository.findById(payload.getConversationId())
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        // Save to database
        Message message = new Message();
        message.setConversation(conversation);
        message.setSenderId(payload.getSenderId());
        message.setSenderEmail(payload.getSenderEmail());
        message.setContent(payload.getContent());
        message.setRead(false);
        Message saved = messageRepository.save(message);

        // Update conversation last message
        conversation.setLastMessage(payload.getContent());
        conversation.setLastMessageAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        // Broadcast to WebSocket subscribers
        // Frontend subscribes to: /topic/chat/{conversationId}
        payload.setSentAt(saved.getCreatedAt().toString());
        messagingTemplate.convertAndSend(
                "/topic/chat/" + conversation.getId(), payload);

        return saved;
    }

    /**
     * Get all messages in a conversation (for loading chat history)
     */
    public List<Message> getMessages(Long conversationId) {
        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
    }

    /**
     * Get all conversations for a user (inbox)
     */
    public List<Conversation> getInbox(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return conversationRepository.findByUserId(user.getId());
    }

    /**
     * Mark all messages in a conversation as read
     */
    @Transactional
    public void markRead(Long conversationId, Long userId) {
        List<Message> unread = messageRepository
                .findByConversationIdOrderByCreatedAtAsc(conversationId)
                .stream()
                .filter(m -> !m.isRead() && !m.getSenderId().equals(userId))
                .toList();
        unread.forEach(m -> m.setRead(true));
        messageRepository.saveAll(unread);
    }

    /**
     * Push a notification to a specific user via WebSocket
     * Frontend subscribes to: /topic/notifications/{userId}
     */
    public void pushNotification(Long userId, String title, String message) {
        messagingTemplate.convertAndSend(
                "/topic/notifications/" + userId,
                new NotificationPush(title, message));
    }

    public record NotificationPush(String title, String message) {}
}

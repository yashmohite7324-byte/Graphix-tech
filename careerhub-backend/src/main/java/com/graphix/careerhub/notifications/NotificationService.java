package com.graphix.careerhub.notifications;

import com.graphix.careerhub.users.User;
import com.graphix.careerhub.users.UserRepository;
import com.graphix.careerhub.common.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository,
                                UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    public Notification send(Long userId, Notification.Type type, String title, String message) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setType(type);
        notification.setChannel(Notification.Channel.IN_APP);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setDeliveryStatus(Notification.DeliveryStatus.SENT);
        notification.setRead(false);

        // TODO: publish to RabbitMQ for Email/SMS/WhatsApp delivery in background
        System.out.println("[NOTIFICATION] To: " + user.getEmail() + " | " + title);

        return notificationRepository.save(notification);
    }

    public List<Notification> getForUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    public void markAllRead(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalse(user.getId());
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    public Long getUnreadCount(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return notificationRepository.countByUserIdAndIsReadFalse(user.getId());
    }
}

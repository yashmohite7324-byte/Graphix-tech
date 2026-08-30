package com.graphix.careerhub.notifications;

import com.graphix.careerhub.common.ApiResponse;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/me")
    public ApiResponse<List<Notification>> myNotifications(Authentication auth) {
        return ApiResponse.success(notificationService.getForUser(auth.getName()));
    }

    @GetMapping("/me/unread-count")
    public ApiResponse<Long> unreadCount(Authentication auth) {
        return ApiResponse.success(notificationService.getUnreadCount(auth.getName()));
    }

    @PatchMapping("/me/read-all")
    public ApiResponse<String> markAllRead(Authentication auth) {
        notificationService.markAllRead(auth.getName());
        return ApiResponse.success("All notifications marked as read");
    }

    @PostMapping("/send")
    public ApiResponse<Notification> send(@RequestBody Map<String, String> body) {
        return ApiResponse.success(notificationService.send(
                Long.parseLong(body.get("userId")),
                Notification.Type.valueOf(body.get("type")),
                body.get("title"), body.get("message")));
    }
}

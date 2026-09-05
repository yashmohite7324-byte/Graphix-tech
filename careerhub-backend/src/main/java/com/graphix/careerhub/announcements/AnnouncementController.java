package com.graphix.careerhub.announcements;

import com.graphix.careerhub.common.ApiResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class AnnouncementController {
    
    private final AnnouncementService announcementService;

    public AnnouncementController(AnnouncementService announcementService) {
        this.announcementService = announcementService;
    }

    @GetMapping("/announcements")
    public ApiResponse<List<Announcement>> getAnnouncements() {
        return ApiResponse.success(announcementService.getAllAnnouncements());
    }

    @PostMapping("/admin/announcements")
    @PreAuthorize("hasAnyRole('PLACEMENT_ADMIN', 'SUPER_ADMIN')")
    public ApiResponse<Announcement> createAnnouncement(@RequestBody Announcement announcement, Authentication authentication) {
        return ApiResponse.success(announcementService.createAnnouncement(announcement, authentication.getName()));
    }

    @DeleteMapping("/admin/announcements/{id}")
    @PreAuthorize("hasAnyRole('PLACEMENT_ADMIN', 'SUPER_ADMIN')")
    public ApiResponse<String> deleteAnnouncement(@PathVariable Long id, Authentication authentication) {
        announcementService.deleteAnnouncement(id, authentication.getName());
        return ApiResponse.success("Announcement deleted successfully");
    }
}

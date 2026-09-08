package com.graphix.careerhub.announcements;

import com.graphix.careerhub.common.ApiResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/announcements")
public class AnnouncementController {

    private final AnnouncementService announcementService;

    public AnnouncementController(AnnouncementService announcementService) {
        this.announcementService = announcementService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PLACEMENT_ADMIN')")
    public ApiResponse<Announcement> create(@RequestBody Announcement announcement,
                                             Authentication auth) {
        return ApiResponse.success(announcementService.create(announcement, auth.getName()));
    }

    @GetMapping
    public ApiResponse<List<Announcement>> getAll() {
        return ApiResponse.success(announcementService.getAll());
    }

    @GetMapping("/my")
    public ApiResponse<List<Announcement>> forMe(Authentication auth) {
        String role = auth.getAuthorities().stream()
                .findFirst().map(a -> a.getAuthority().replace("ROLE_", ""))
                .orElse("STUDENT");
        return ApiResponse.success(announcementService.getForRole(role));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PLACEMENT_ADMIN')")
    public ApiResponse<String> delete(@PathVariable Long id, Authentication auth) {
        announcementService.delete(id, auth.getName());
        return ApiResponse.success("Announcement removed");
    }
}

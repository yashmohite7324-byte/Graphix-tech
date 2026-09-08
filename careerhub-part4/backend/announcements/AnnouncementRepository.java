package com.graphix.careerhub.announcements;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    List<Announcement> findByActiveOrderByCreatedAtDesc(boolean active);
    List<Announcement> findByTargetRoleInAndActiveOrderByCreatedAtDesc(List<String> roles, boolean active);
}

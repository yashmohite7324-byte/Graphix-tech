package com.graphix.careerhub.announcements;

import com.graphix.careerhub.audit.AuditService;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final AuditService auditService;

    public AnnouncementService(AnnouncementRepository announcementRepository, AuditService auditService) {
        this.announcementRepository = announcementRepository;
        this.auditService = auditService;
    }

    public Announcement create(Announcement announcement, String actorEmail) {
        announcement.setCreatedByEmail(actorEmail);
        announcement.setActive(true);
        Announcement saved = announcementRepository.save(announcement);
        auditService.log(actorEmail, "ANNOUNCEMENT_CREATED", "Announcement",
                saved.getId().toString(), saved.getTitle());
        return saved;
    }

    public List<Announcement> getAll() {
        return announcementRepository.findByActiveOrderByCreatedAtDesc(true);
    }

    public List<Announcement> getForRole(String role) {
        return announcementRepository.findByTargetRoleInAndActiveOrderByCreatedAtDesc(
                List.of("ALL", role), true);
    }

    public void delete(Long id, String actorEmail) {
        announcementRepository.findById(id).ifPresent(a -> {
            a.setActive(false);
            announcementRepository.save(a);
            auditService.log(actorEmail, "ANNOUNCEMENT_DELETED", "Announcement",
                    id.toString(), a.getTitle());
        });
    }
}

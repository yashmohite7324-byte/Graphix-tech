package com.graphix.careerhub.announcements;

import com.graphix.careerhub.audit.AuditService;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AnnouncementService {
    private final AnnouncementRepository repository;
    private final AuditService auditService;

    public AnnouncementService(AnnouncementRepository repository, AuditService auditService) {
        this.repository = repository;
        this.auditService = auditService;
    }

    public List<Announcement> getAllAnnouncements() {
        return repository.findAll();
    }

    public Announcement createAnnouncement(Announcement announcement, String adminEmail) {
        announcement.setCreatedBy(adminEmail);
        Announcement saved = repository.save(announcement);
        auditService.log(adminEmail, "CREATE", "Announcement", saved.getId().toString(), "Created announcement: " + announcement.getTitle());
        return saved;
    }

    public void deleteAnnouncement(Long id, String adminEmail) {
        repository.deleteById(id);
        auditService.log(adminEmail, "DELETE", "Announcement", id.toString(), "Deleted announcement");
    }
}

package com.graphix.careerhub.audit;

import org.springframework.stereotype.Service;

/**
 * Called explicitly from any service method that performs a sensitive action
 * (login, approval, shortlist, rejection, status change, admin change, etc.),
 * per the Master Prompt's auditing requirement.
 */
@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void log(String actorEmail, String action, String entityName, String entityId, String details) {
        AuditLog log = new AuditLog();
        log.setActorEmail(actorEmail);
        log.setAction(action);
        log.setEntityName(entityName);
        log.setEntityId(entityId);
        log.setDetails(details);
        auditLogRepository.save(log);
    }
}

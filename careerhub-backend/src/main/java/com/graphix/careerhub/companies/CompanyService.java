package com.graphix.careerhub.companies;

import com.graphix.careerhub.audit.AuditService;
import com.graphix.careerhub.common.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final AuditService auditService;
    private final com.graphix.careerhub.notifications.NotificationService notificationService;

    public CompanyService(CompanyRepository companyRepository, 
                          RecruiterProfileRepository recruiterProfileRepository,
                          AuditService auditService,
                          com.graphix.careerhub.notifications.NotificationService notificationService) {
        this.companyRepository = companyRepository;
        this.recruiterProfileRepository = recruiterProfileRepository;
        this.auditService = auditService;
        this.notificationService = notificationService;
    }

    @jakarta.annotation.PostConstruct
    public void fixLegacyCompanies() {
        List<Company> companies = companyRepository.findAll();
        for (Company c : companies) {
            if (c.getVerificationStatus() == null) {
                c.setVerificationStatus(Company.VerificationStatus.APPROVED);
                companyRepository.save(c);
            }
        }
    }

    public List<Company> getAll() {
        return companyRepository.findAll();
    }

    public Company approve(Long companyId, String actorEmail) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
        company.setVerificationStatus(Company.VerificationStatus.APPROVED);
        companyRepository.save(company);

        auditService.log(actorEmail, "COMPANY_APPROVED", "Company", companyId.toString(), company.getName());

        notifyRecruiters(company, "Account Approved", "Your recruiter account for " + company.getName() + " has been approved by the Placement Admin. You can now log in.");

        return company;
    }

    public Company reject(Long companyId, String actorEmail) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
        company.setVerificationStatus(Company.VerificationStatus.REJECTED);
        companyRepository.save(company);

        auditService.log(actorEmail, "COMPANY_REJECTED", "Company", companyId.toString(), company.getName());
        
        notifyRecruiters(company, "Account Rejected", "Your recruiter account for " + company.getName() + " has been rejected by the Placement Admin.");

        return company;
    }

    private void notifyRecruiters(Company company, String title, String message) {
        List<RecruiterProfile> profiles = recruiterProfileRepository.findByCompanyId(company.getId());
        for (RecruiterProfile rp : profiles) {
            if (rp.getUser() != null) {
                notificationService.send(rp.getUser().getId(), com.graphix.careerhub.notifications.Notification.Type.SYSTEM, title, message);
            }
        }
    }
}

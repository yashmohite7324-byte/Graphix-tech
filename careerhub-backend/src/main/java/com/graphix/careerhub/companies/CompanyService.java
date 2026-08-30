package com.graphix.careerhub.companies;

import com.graphix.careerhub.audit.AuditService;
import com.graphix.careerhub.common.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final AuditService auditService;

    public CompanyService(CompanyRepository companyRepository, AuditService auditService) {
        this.companyRepository = companyRepository;
        this.auditService = auditService;
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
        return company;
    }

    public Company reject(Long companyId, String actorEmail) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
        company.setVerificationStatus(Company.VerificationStatus.REJECTED);
        companyRepository.save(company);

        auditService.log(actorEmail, "COMPANY_REJECTED", "Company", companyId.toString(), company.getName());
        return company;
    }
}

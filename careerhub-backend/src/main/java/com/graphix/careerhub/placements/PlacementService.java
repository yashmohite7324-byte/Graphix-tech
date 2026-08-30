package com.graphix.careerhub.placements;

import com.graphix.careerhub.audit.AuditService;
import com.graphix.careerhub.common.BadRequestException;
import com.graphix.careerhub.common.ResourceNotFoundException;
import com.graphix.careerhub.companies.Company;
import com.graphix.careerhub.companies.CompanyRepository;
import com.graphix.careerhub.students.StudentProfile;
import com.graphix.careerhub.students.StudentProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
public class PlacementService {

    private final PlacementRepository placementRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final CompanyRepository companyRepository;
    private final AuditService auditService;

    public PlacementService(PlacementRepository placementRepository,
                             StudentProfileRepository studentProfileRepository,
                             CompanyRepository companyRepository,
                             AuditService auditService) {
        this.placementRepository = placementRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.companyRepository = companyRepository;
        this.auditService = auditService;
    }

    @Transactional
    public Placement recordPlacement(PlacementRequest req, String actorEmail) {
        if (placementRepository.findByStudentId(req.getStudentId()).isPresent()) {
            throw new BadRequestException("Student is already placed");
        }

        StudentProfile student = studentProfileRepository.findById(req.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        Company company = companyRepository.findById(req.getCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));

        Placement placement = new Placement();
        placement.setStudent(student);
        placement.setCompany(company);
        placement.setCtcOffered(req.getCtcOffered());
        placement.setJoiningDate(req.getJoiningDate());
        placement.setDesignation(req.getDesignation());
        placement.setLocation(req.getLocation());
        placement.setOfferLetterUrl(req.getOfferLetterUrl());
        placement.setStatus(Placement.PlacementStatus.OFFERED);

        Placement saved = placementRepository.save(placement);
        auditService.log(actorEmail, "PLACEMENT_RECORDED", "Placement",
                saved.getId().toString(), student.getFullName() + " at " + company.getName());
        return saved;
    }

    public List<Placement> getAll() { return placementRepository.findAll(); }

    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalPlacements", placementRepository.countPlacements());
        stats.put("averageCtc", placementRepository.avgCtc());
        stats.put("highestCtc", placementRepository.maxCtc());
        return stats;
    }
}

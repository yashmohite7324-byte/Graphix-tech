package com.graphix.careerhub.analytics;

import com.graphix.careerhub.analytics.dto.AnalyticsSummaryResponse;
import com.graphix.careerhub.companies.CompanyRepository;
import com.graphix.careerhub.placements.PlacementRepository;
import com.graphix.careerhub.students.StudentProfileRepository;
import org.springframework.stereotype.Service;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {
    private final StudentProfileRepository studentRepo;
    private final CompanyRepository companyRepo;
    private final PlacementRepository placementRepo;

    @PersistenceContext
    private EntityManager entityManager;

    public AnalyticsService(StudentProfileRepository studentRepo, CompanyRepository companyRepo, PlacementRepository placementRepo) {
        this.studentRepo = studentRepo;
        this.companyRepo = companyRepo;
        this.placementRepo = placementRepo;
    }

    public AnalyticsSummaryResponse getSummary() {
        AnalyticsSummaryResponse response = new AnalyticsSummaryResponse();
        response.setTotalStudents(studentRepo.count());
        response.setTotalCompanies(companyRepo.count());
        response.setTotalPlacements(placementRepo.count());

        Query avgQ = entityManager.createQuery("SELECT AVG(p.ctcOffered) FROM Placement p");
        Double avg = (Double) avgQ.getSingleResult();
        response.setAverageCtc(avg != null ? avg : 0.0);

        Query maxQ = entityManager.createQuery("SELECT MAX(p.ctcOffered) FROM Placement p");
        Double max = (Double) maxQ.getSingleResult();
        response.setHighestCtc(max != null ? max : 0.0);

        // Dummy aggregations for simplicity (in real app, use GROUP BY queries)
        List<Map<String, Object>> branchStats = new ArrayList<>();
        Map<String, Object> cse = new HashMap<>(); cse.put("branch", "CSE"); cse.put("placements", 120);
        Map<String, Object> it = new HashMap<>(); it.put("branch", "IT"); it.put("placements", 85);
        branchStats.add(cse); branchStats.add(it);
        response.setBranchStats(branchStats);

        List<Map<String, Object>> sectorStats = new ArrayList<>();
        Map<String, Object> itSector = new HashMap<>(); itSector.put("sector", "IT"); itSector.put("value", 60);
        Map<String, Object> finSector = new HashMap<>(); finSector.put("sector", "Finance"); finSector.put("value", 30);
        sectorStats.add(itSector); sectorStats.add(finSector);
        response.setSectorStats(sectorStats);

        response.setMonthlyTrends(new ArrayList<>());
        response.setCtcDistribution(new ArrayList<>());
        response.setTopCompanies(new ArrayList<>());

        return response;
    }
}

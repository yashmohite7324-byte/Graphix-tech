package com.graphix.careerhub.analytics;

import com.graphix.careerhub.applications.ApplicationRepository;
import com.graphix.careerhub.companies.CompanyRepository;
import com.graphix.careerhub.jobs.JobRepository;
import com.graphix.careerhub.placements.PlacementRepository;
import com.graphix.careerhub.students.StudentProfileRepository;
import com.graphix.careerhub.users.UserRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final PlacementRepository placementRepository;

    public AnalyticsService(UserRepository userRepository,
                             StudentProfileRepository studentProfileRepository,
                             CompanyRepository companyRepository,
                             JobRepository jobRepository,
                             ApplicationRepository applicationRepository,
                             PlacementRepository placementRepository) {
        this.userRepository = userRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.companyRepository = companyRepository;
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.placementRepository = placementRepository;
    }

    public Map<String, Object> getDashboardSummary() {
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalStudents", studentProfileRepository.count());
        summary.put("totalCompanies", companyRepository.count());
        summary.put("totalJobs", jobRepository.count());
        summary.put("totalApplications", applicationRepository.count());
        summary.put("totalPlacements", placementRepository.countPlacements());
        summary.put("averageCtc", placementRepository.avgCtc());
        summary.put("highestCtc", placementRepository.maxCtc());
        return summary;
    }

    public Map<String, Object> getPlacementStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalPlacements", placementRepository.countPlacements());
        stats.put("averageCtc", placementRepository.avgCtc());
        stats.put("highestCtc", placementRepository.maxCtc());
        return stats;
    }
}

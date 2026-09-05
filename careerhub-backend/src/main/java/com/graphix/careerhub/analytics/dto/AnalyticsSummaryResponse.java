package com.graphix.careerhub.analytics.dto;

import lombok.Data;
import java.util.Map;
import java.util.List;

@Data
public class AnalyticsSummaryResponse {
    private long totalStudents;
    private long totalCompanies;
    private long totalPlacements;
    private double averageCtc;
    private double highestCtc;

    private List<Map<String, Object>> monthlyTrends;
    private List<Map<String, Object>> branchStats;
    private List<Map<String, Object>> ctcDistribution;
    private List<Map<String, Object>> sectorStats;
    private List<Map<String, Object>> topCompanies;
}

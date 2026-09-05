package com.graphix.careerhub.analytics;

import com.graphix.careerhub.analytics.dto.AnalyticsSummaryResponse;
import com.graphix.careerhub.common.ApiResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('PLACEMENT_ADMIN', 'SUPER_ADMIN')")
    public ApiResponse<AnalyticsSummaryResponse> getSummary() {
        return ApiResponse.success(analyticsService.getSummary());
    }
}

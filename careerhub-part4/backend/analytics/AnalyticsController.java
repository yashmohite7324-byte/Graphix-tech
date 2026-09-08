package com.graphix.careerhub.analytics;

import com.graphix.careerhub.common.ApiResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/analytics")
@PreAuthorize("hasAnyRole('SUPER_ADMIN','PLACEMENT_ADMIN')")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/summary")
    public ApiResponse<Map<String, Object>> summary() {
        return ApiResponse.success(analyticsService.getDashboardSummary());
    }

    @GetMapping("/placements")
    public ApiResponse<Map<String, Object>> placementStats() {
        return ApiResponse.success(analyticsService.getPlacementStats());
    }
}

package com.graphix.careerhub.placements;

import com.graphix.careerhub.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/placements")
public class PlacementController {

    private final PlacementService placementService;

    public PlacementController(PlacementService placementService) {
        this.placementService = placementService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('PLACEMENT_ADMIN','SUPER_ADMIN')")
    public ApiResponse<Placement> record(@Valid @RequestBody PlacementRequest req, Authentication auth) {
        return ApiResponse.success(placementService.recordPlacement(req, auth.getName()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('PLACEMENT_ADMIN','SUPER_ADMIN','RECRUITER')")
    public ApiResponse<List<Placement>> getAll() {
        return ApiResponse.success(placementService.getAll());
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('PLACEMENT_ADMIN','SUPER_ADMIN')")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(placementService.getStats());
    }
}

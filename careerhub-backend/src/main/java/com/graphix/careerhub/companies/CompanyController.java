package com.graphix.careerhub.companies;

import com.graphix.careerhub.common.ApiResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/companies")
@PreAuthorize("hasAnyRole('SUPER_ADMIN','PLACEMENT_ADMIN')")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @GetMapping
    public ApiResponse<List<Company>> getAll() {
        return ApiResponse.success(companyService.getAll());
    }

    @PatchMapping("/{id}/approve")
    public ApiResponse<Company> approve(@PathVariable Long id, Authentication authentication) {
        return ApiResponse.success(companyService.approve(id, authentication.getName()));
    }

    @PatchMapping("/{id}/reject")
    public ApiResponse<Company> reject(@PathVariable Long id, Authentication authentication) {
        return ApiResponse.success(companyService.reject(id, authentication.getName()));
    }
}

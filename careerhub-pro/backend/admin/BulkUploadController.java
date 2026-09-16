package com.graphix.careerhub.admin;

import com.graphix.careerhub.common.ApiResponse;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.Map;

/**
 * Bulk upload + export endpoints for admin.
 *
 * Upload:  POST /api/v1/admin/bulk/students   (Excel file)
 *          POST /api/v1/admin/bulk/companies  (Excel file)
 * Template:GET  /api/v1/admin/bulk/template/students   (downloads sample .xlsx)
 *          GET  /api/v1/admin/bulk/template/companies
 * Export:  GET  /api/v1/admin/export/students          (downloads all students)
 *          GET  /api/v1/admin/export/placements        (downloads placement report)
 */
@RestController
@RequestMapping("/api/v1/admin")
public class BulkUploadController {

    private final BulkUploadService bulkUploadService;
    private final ExportService exportService;

    public BulkUploadController(BulkUploadService bulkUploadService, ExportService exportService) {
        this.bulkUploadService = bulkUploadService;
        this.exportService = exportService;
    }

    // ─── Uploads ──────────────────────────────────────────────

    @PostMapping("/bulk/students")
    @PreAuthorize("hasAnyRole('PLACEMENT_ADMIN','SUPER_ADMIN')")
    public ApiResponse<Map<String, Object>> uploadStudents(
            @RequestParam("file") MultipartFile file, Authentication auth) {
        return ApiResponse.success(bulkUploadService.uploadStudents(file, auth.getName()));
    }

    @PostMapping("/bulk/companies")
    @PreAuthorize("hasAnyRole('PLACEMENT_ADMIN','SUPER_ADMIN')")
    public ApiResponse<Map<String, Object>> uploadCompanies(
            @RequestParam("file") MultipartFile file, Authentication auth) {
        return ApiResponse.success(bulkUploadService.uploadCompanies(file, auth.getName()));
    }

    // ─── Templates (so admin knows the exact column format) ───

    @GetMapping("/bulk/template/students")
    @PreAuthorize("hasAnyRole('PLACEMENT_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<Resource> studentTemplate() {
        byte[] bytes = buildTemplate(
            "Students",
            List.of("Full Name", "Email", "Mobile", "Roll Number", "Branch", "Batch Year", "CGPA", "Backlogs"),
            List.of(List.of("Aditya Sharma", "aditya@graphix.edu", "9876543210", "GT2024CSE001", "CSE", "2026", "8.5", "0"))
        );
        return download(bytes, "student_upload_template.xlsx");
    }

    @GetMapping("/bulk/template/companies")
    @PreAuthorize("hasAnyRole('PLACEMENT_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<Resource> companyTemplate() {
        byte[] bytes = buildTemplate(
            "Companies",
            List.of("Company Name", "Industry", "Location", "Contact Email", "Contact Mobile", "Designation"),
            List.of(List.of("Grey Space Computing", "IT / Software", "Kodhwa, Pune", "hr@greyspace.com", "9800000001", "HR Generalist"))
        );
        return download(bytes, "company_upload_template.xlsx");
    }

    // ─── Exports ──────────────────────────────────────────────

    @GetMapping("/export/students")
    @PreAuthorize("hasAnyRole('PLACEMENT_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<Resource> exportStudents() {
        return download(exportService.exportStudents(), "students_export.xlsx");
    }

    @GetMapping("/export/placements")
    @PreAuthorize("hasAnyRole('PLACEMENT_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<Resource> exportPlacements() {
        return download(exportService.exportPlacements(), "placement_report.xlsx");
    }

    @GetMapping("/export/applications")
    @PreAuthorize("hasAnyRole('PLACEMENT_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<Resource> exportApplications() {
        return download(exportService.exportApplications(), "applications_export.xlsx");
    }

    // ─── Helpers ──────────────────────────────────────────────

    private ResponseEntity<Resource> download(byte[] bytes, String fileName) {
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
            .contentType(MediaType.parseMediaType(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
            .body(new ByteArrayResource(bytes));
    }

    private byte[] buildTemplate(String sheetName, List<String> headers, List<List<String>> sampleRows) {
        try (Workbook wb = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = wb.createSheet(sheetName);

            // Header style — bold with background
            CellStyle headerStyle = wb.createCellStyle();
            Font bold = wb.createFont();
            bold.setBold(true);
            bold.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(bold);
            headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.size(); i++) {
                Cell c = headerRow.createCell(i);
                c.setCellValue(headers.get(i));
                c.setCellStyle(headerStyle);
                sheet.setColumnWidth(i, 5000);
            }

            int r = 1;
            for (List<String> sample : sampleRows) {
                Row row = sheet.createRow(r++);
                for (int i = 0; i < sample.size(); i++) {
                    row.createCell(i).setCellValue(sample.get(i));
                }
            }

            wb.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Template generation failed", e);
        }
    }
}

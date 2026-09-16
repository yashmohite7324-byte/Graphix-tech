package com.graphix.careerhub.admin;

import com.graphix.careerhub.applications.ApplicationRepository;
import com.graphix.careerhub.placements.PlacementRepository;
import com.graphix.careerhub.students.StudentProfileRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.List;

/**
 * ExportService
 *
 * Generates downloadable Excel reports the placement office actually needs:
 *  - Full student list with placement status (for NAAC / AICTE reporting)
 *  - Placement report with CTC figures (for annual reports)
 *  - Application log (for audit and analysis)
 *
 * Requires: org.apache.poi:poi-ooxml in pom.xml
 */
@Service
public class ExportService {

    private final StudentProfileRepository studentRepo;
    private final PlacementRepository placementRepo;
    private final ApplicationRepository applicationRepo;

    public ExportService(StudentProfileRepository studentRepo,
                          PlacementRepository placementRepo,
                          ApplicationRepository applicationRepo) {
        this.studentRepo = studentRepo;
        this.placementRepo = placementRepo;
        this.applicationRepo = applicationRepo;
    }

    // ─── Student export ───────────────────────────────────────

    public byte[] exportStudents() {
        try (Workbook wb = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = wb.createSheet("Students");
            CellStyle header = headerStyle(wb);

            String[] cols = { "Roll Number", "Full Name", "Branch", "Batch Year",
                              "CGPA", "Backlogs", "Placed", "Resume Uploaded" };
            Row hr = sheet.createRow(0);
            for (int i = 0; i < cols.length; i++) {
                Cell c = hr.createCell(i);
                c.setCellValue(cols[i]);
                c.setCellStyle(header);
                sheet.setColumnWidth(i, 4500);
            }

            var students = studentRepo.findAll();
            int r = 1;
            for (var s : students) {
                Row row = sheet.createRow(r++);
                row.createCell(0).setCellValue(nullSafe(s.getRollNumber()));
                row.createCell(1).setCellValue(nullSafe(s.getFullName()));
                row.createCell(2).setCellValue(nullSafe(s.getBranch()));
                row.createCell(3).setCellValue(s.getBatchYear() != null ? s.getBatchYear() : 0);
                row.createCell(4).setCellValue(s.getCgpa() != null ? s.getCgpa() : 0);
                row.createCell(5).setCellValue(s.getBacklogCount() != null ? s.getBacklogCount() : 0);
                row.createCell(6).setCellValue(Boolean.TRUE.equals(s.getIsPlaced()) ? "Yes" : "No");
                row.createCell(7).setCellValue(s.getResumeUrl() != null ? "Yes" : "No");
            }

            // Summary row
            Row summary = sheet.createRow(r + 1);
            summary.createCell(0).setCellValue("TOTAL STUDENTS");
            summary.createCell(1).setCellValue(students.size());
            summary.createCell(2).setCellValue("PLACED");
            summary.createCell(3).setCellValue(
                students.stream().filter(s -> Boolean.TRUE.equals(s.getIsPlaced())).count()
            );

            wb.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Student export failed: " + e.getMessage(), e);
        }
    }

    // ─── Placement report ─────────────────────────────────────

    public byte[] exportPlacements() {
        try (Workbook wb = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = wb.createSheet("Placements");
            CellStyle header = headerStyle(wb);

            String[] cols = { "Student Name", "Roll Number", "Branch", "Company",
                              "Designation", "CTC (LPA)", "Location", "Joining Date", "Status" };
            Row hr = sheet.createRow(0);
            for (int i = 0; i < cols.length; i++) {
                Cell c = hr.createCell(i);
                c.setCellValue(cols[i]);
                c.setCellStyle(header);
                sheet.setColumnWidth(i, 4500);
            }

            var placements = placementRepo.findAll();
            int r = 1;
            double totalCtc = 0;
            double highestCtc = 0;

            for (var p : placements) {
                Row row = sheet.createRow(r++);
                row.createCell(0).setCellValue(p.getStudent() != null ? nullSafe(p.getStudent().getFullName()) : "");
                row.createCell(1).setCellValue(p.getStudent() != null ? nullSafe(p.getStudent().getRollNumber()) : "");
                row.createCell(2).setCellValue(p.getStudent() != null ? nullSafe(p.getStudent().getBranch()) : "");
                row.createCell(3).setCellValue(p.getCompany() != null ? nullSafe(p.getCompany().getName()) : "");
                row.createCell(4).setCellValue(nullSafe(p.getDesignation()));

                double ctcLakhs = p.getCtcOffered() != null ? p.getCtcOffered() / 100000.0 : 0;
                row.createCell(5).setCellValue(ctcLakhs);
                totalCtc += ctcLakhs;
                highestCtc = Math.max(highestCtc, ctcLakhs);

                row.createCell(6).setCellValue(nullSafe(p.getLocation()));
                row.createCell(7).setCellValue(p.getJoiningDate() != null ? p.getJoiningDate().toString() : "");
                row.createCell(8).setCellValue(nullSafe(p.getStatus()));
            }

            // Summary statistics — what the placement office reports annually
            int n = placements.size();
            Row s1 = sheet.createRow(r + 1);
            s1.createCell(0).setCellValue("TOTAL PLACEMENTS");
            s1.createCell(1).setCellValue(n);

            Row s2 = sheet.createRow(r + 2);
            s2.createCell(0).setCellValue("AVERAGE CTC (LPA)");
            s2.createCell(1).setCellValue(n > 0 ? Math.round((totalCtc / n) * 100) / 100.0 : 0);

            Row s3 = sheet.createRow(r + 3);
            s3.createCell(0).setCellValue("HIGHEST CTC (LPA)");
            s3.createCell(1).setCellValue(highestCtc);

            wb.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Placement export failed: " + e.getMessage(), e);
        }
    }

    // ─── Application log export ───────────────────────────────

    public byte[] exportApplications() {
        try (Workbook wb = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = wb.createSheet("Applications");
            CellStyle header = headerStyle(wb);

            String[] cols = { "Student", "Roll Number", "Job Title", "Company",
                              "Status", "Applied On" };
            Row hr = sheet.createRow(0);
            for (int i = 0; i < cols.length; i++) {
                Cell c = hr.createCell(i);
                c.setCellValue(cols[i]);
                c.setCellStyle(header);
                sheet.setColumnWidth(i, 5000);
            }

            var applications = applicationRepo.findAll();
            int r = 1;
            for (var a : applications) {
                Row row = sheet.createRow(r++);
                row.createCell(0).setCellValue(a.getStudent() != null ? nullSafe(a.getStudent().getFullName()) : "");
                row.createCell(1).setCellValue(a.getStudent() != null ? nullSafe(a.getStudent().getRollNumber()) : "");
                row.createCell(2).setCellValue(a.getJob() != null ? nullSafe(a.getJob().getTitle()) : "");
                row.createCell(3).setCellValue(
                    a.getJob() != null && a.getJob().getCompany() != null
                        ? nullSafe(a.getJob().getCompany().getName()) : "");
                row.createCell(4).setCellValue(nullSafe(a.getStatus()));
                row.createCell(5).setCellValue(a.getAppliedAt() != null ? a.getAppliedAt().toString() : "");
            }

            wb.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Application export failed: " + e.getMessage(), e);
        }
    }

    // ─── Helpers ──────────────────────────────────────────────

    private CellStyle headerStyle(Workbook wb) {
        CellStyle style = wb.createCellStyle();
        Font font = wb.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        return style;
    }

    private String nullSafe(String s) {
        return s != null ? s : "";
    }
}

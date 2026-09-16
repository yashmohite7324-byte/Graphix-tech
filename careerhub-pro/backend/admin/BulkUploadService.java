package com.graphix.careerhub.admin;

import com.graphix.careerhub.audit.AuditService;
import com.graphix.careerhub.common.BadRequestException;
import com.graphix.careerhub.companies.Company;
import com.graphix.careerhub.companies.CompanyRepository;
import com.graphix.careerhub.companies.RecruiterProfile;
import com.graphix.careerhub.companies.RecruiterProfileRepository;
import com.graphix.careerhub.students.StudentProfile;
import com.graphix.careerhub.students.StudentProfileRepository;
import com.graphix.careerhub.users.User;
import com.graphix.careerhub.users.UserRepository;
import org.apache.poi.ss.usermodel.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Bulk Excel Upload Service
 *
 * Lets the admin upload an .xlsx file to create many students or
 * companies at once instead of registering each one manually.
 *
 * ─── Required pom.xml dependency ──────────────────────────────
 * <dependency>
 *   <groupId>org.apache.poi</groupId>
 *   <artifactId>poi-ooxml</artifactId>
 *   <version>5.2.5</version>
 * </dependency>
 *
 * ─── Student Excel format ─────────────────────────────────────
 * Column A: Full Name       (required)
 * Column B: Email           (required, becomes login username)
 * Column C: Mobile          (required, 10 digits)
 * Column D: Roll Number     (required, unique)
 * Column E: Branch          (CSE / IT / ECE / MECH / CIVIL / MBA / MCA)
 * Column F: Batch Year      (e.g. 2026)
 * Column G: CGPA            (0.00 – 10.00)
 * Column H: Backlogs        (integer, default 0)
 *
 * ─── Company Excel format ─────────────────────────────────────
 * Column A: Company Name    (required)
 * Column B: Industry
 * Column C: Location
 * Column D: Contact Email   (required, becomes recruiter login)
 * Column E: Contact Mobile
 * Column F: Designation     (HR Executive / CEO / CTO etc.)
 *
 * Row 1 is treated as a header row and skipped.
 */
@Service
public class BulkUploadService {

    private static final Logger log = LoggerFactory.getLogger(BulkUploadService.class);

    private static final String DEFAULT_STUDENT_PASSWORD = "Student@1234";
    private static final String DEFAULT_COMPANY_PASSWORD = "Company@1234";

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final CompanyRepository companyRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    public BulkUploadService(UserRepository userRepository,
                              StudentProfileRepository studentProfileRepository,
                              CompanyRepository companyRepository,
                              RecruiterProfileRepository recruiterProfileRepository,
                              PasswordEncoder passwordEncoder,
                              AuditService auditService) {
        this.userRepository = userRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.companyRepository = companyRepository;
        this.recruiterProfileRepository = recruiterProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
    }

    // ─── Student bulk upload ──────────────────────────────────

    @Transactional
    public Map<String, Object> uploadStudents(MultipartFile file, String adminEmail) {
        validateFile(file);

        List<String> created = new ArrayList<>();
        List<String> skipped = new ArrayList<>();
        List<String> errors  = new ArrayList<>();

        try (InputStream is = file.getInputStream();
             Workbook workbook = WorkbookFactory.create(is)) {

            Sheet sheet = workbook.getSheetAt(0);

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {   // skip header row
                Row row = sheet.getRow(i);
                if (row == null || isRowEmpty(row)) continue;

                try {
                    String fullName = getString(row, 0);
                    String email    = getString(row, 1);
                    String mobile   = getString(row, 2);
                    String rollNo   = getString(row, 3);
                    String branch   = getString(row, 4);
                    Integer batch   = getInt(row, 5);
                    Double cgpa     = getDouble(row, 6);
                    Integer backlogs= getInt(row, 7);

                    if (email == null || email.isBlank()) {
                        errors.add("Row " + (i + 1) + ": email is required");
                        continue;
                    }

                    if (userRepository.findByEmail(email).isPresent()) {
                        skipped.add(email + " (already exists)");
                        continue;
                    }

                    // Create the user account
                    User user = new User();
                    user.setEmail(email.trim().toLowerCase());
                    user.setMobile(mobile);
                    user.setPasswordHash(passwordEncoder.encode(DEFAULT_STUDENT_PASSWORD));
                    user.setRole("STUDENT");
                    user.setStatus("ACTIVE");
                    userRepository.save(user);

                    // Create the student profile
                    StudentProfile profile = new StudentProfile();
                    profile.setUserId(user.getId());
                    profile.setFullName(fullName);
                    profile.setRollNumber(rollNo);
                    profile.setBranch(branch != null ? branch.toUpperCase() : null);
                    profile.setBatchYear(batch);
                    profile.setCgpa(cgpa);
                    profile.setBacklogCount(backlogs != null ? backlogs : 0);
                    studentProfileRepository.save(profile);

                    created.add(email);

                } catch (Exception rowEx) {
                    errors.add("Row " + (i + 1) + ": " + rowEx.getMessage());
                }
            }

        } catch (Exception e) {
            log.error("Excel parse failed: {}", e.getMessage());
            throw new BadRequestException("Could not read Excel file: " + e.getMessage());
        }

        auditService.log(adminEmail, "BULK_STUDENT_UPLOAD", "StudentProfile", "BULK",
            created.size() + " students created, " + skipped.size() + " skipped, " + errors.size() + " errors");

        Map<String, Object> result = new HashMap<>();
        result.put("createdCount", created.size());
        result.put("skippedCount", skipped.size());
        result.put("errorCount", errors.size());
        result.put("created", created);
        result.put("skipped", skipped);
        result.put("errors", errors);
        result.put("defaultPassword", DEFAULT_STUDENT_PASSWORD);
        result.put("message", created.size() + " students imported successfully. "
            + "They can log in with the default password and should change it immediately.");
        return result;
    }

    // ─── Company bulk upload ──────────────────────────────────

    @Transactional
    public Map<String, Object> uploadCompanies(MultipartFile file, String adminEmail) {
        validateFile(file);

        List<String> created = new ArrayList<>();
        List<String> skipped = new ArrayList<>();
        List<String> errors  = new ArrayList<>();

        try (InputStream is = file.getInputStream();
             Workbook workbook = WorkbookFactory.create(is)) {

            Sheet sheet = workbook.getSheetAt(0);

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null || isRowEmpty(row)) continue;

                try {
                    String coName      = getString(row, 0);
                    String industry    = getString(row, 1);
                    String location    = getString(row, 2);
                    String email       = getString(row, 3);
                    String mobile      = getString(row, 4);
                    String designation = getString(row, 5);

                    if (coName == null || coName.isBlank()) {
                        errors.add("Row " + (i + 1) + ": company name is required");
                        continue;
                    }
                    if (email == null || email.isBlank()) {
                        errors.add("Row " + (i + 1) + ": contact email is required");
                        continue;
                    }
                    if (userRepository.findByEmail(email).isPresent()) {
                        skipped.add(email + " (already exists)");
                        continue;
                    }

                    // Create the company — PENDING until admin approves
                    Company company = new Company();
                    company.setName(coName);
                    company.setIndustry(industry);
                    company.setHeadquarters(location);
                    company.setVerificationStatus("PENDING");
                    companyRepository.save(company);

                    // Create the recruiter login account
                    User user = new User();
                    user.setEmail(email.trim().toLowerCase());
                    user.setMobile(mobile);
                    user.setPasswordHash(passwordEncoder.encode(DEFAULT_COMPANY_PASSWORD));
                    user.setRole("RECRUITER");
                    user.setStatus("ACTIVE");
                    userRepository.save(user);

                    // Link recruiter to company with their designation
                    RecruiterProfile recruiter = new RecruiterProfile();
                    recruiter.setUserId(user.getId());
                    recruiter.setCompanyId(company.getId());
                    recruiter.setFullName(coName + " Contact");
                    recruiter.setDesignation(designation);
                    recruiter.setPhone(mobile);
                    recruiterProfileRepository.save(recruiter);

                    created.add(coName + " (" + email + ")");

                } catch (Exception rowEx) {
                    errors.add("Row " + (i + 1) + ": " + rowEx.getMessage());
                }
            }

        } catch (Exception e) {
            log.error("Excel parse failed: {}", e.getMessage());
            throw new BadRequestException("Could not read Excel file: " + e.getMessage());
        }

        auditService.log(adminEmail, "BULK_COMPANY_UPLOAD", "Company", "BULK",
            created.size() + " companies created");

        Map<String, Object> result = new HashMap<>();
        result.put("createdCount", created.size());
        result.put("skippedCount", skipped.size());
        result.put("errorCount", errors.size());
        result.put("created", created);
        result.put("skipped", skipped);
        result.put("errors", errors);
        result.put("defaultPassword", DEFAULT_COMPANY_PASSWORD);
        result.put("message", created.size() + " companies imported as PENDING. "
            + "Approve them from the Companies page to enable recruiter login.");
        return result;
    }

    // ─── Helpers ──────────────────────────────────────────────

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("No file uploaded");
        }
        String name = file.getOriginalFilename();
        if (name == null || (!name.endsWith(".xlsx") && !name.endsWith(".xls"))) {
            throw new BadRequestException("File must be an Excel file (.xlsx or .xls)");
        }
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new BadRequestException("File too large — max 5 MB");
        }
    }

    private boolean isRowEmpty(Row row) {
        for (int c = 0; c < 8; c++) {
            Cell cell = row.getCell(c);
            if (cell != null && cell.getCellType() != CellType.BLANK) return false;
        }
        return true;
    }

    private String getString(Row row, int col) {
        Cell cell = row.getCell(col);
        if (cell == null) return null;
        return switch (cell.getCellType()) {
            case STRING  -> cell.getStringCellValue().trim();
            case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default      -> null;
        };
    }

    private Integer getInt(Row row, int col) {
        Cell cell = row.getCell(col);
        if (cell == null) return null;
        try {
            if (cell.getCellType() == CellType.NUMERIC) {
                return (int) cell.getNumericCellValue();
            }
            return Integer.parseInt(cell.getStringCellValue().trim());
        } catch (Exception e) {
            return null;
        }
    }

    private Double getDouble(Row row, int col) {
        Cell cell = row.getCell(col);
        if (cell == null) return null;
        try {
            if (cell.getCellType() == CellType.NUMERIC) {
                return cell.getNumericCellValue();
            }
            return Double.parseDouble(cell.getStringCellValue().trim());
        } catch (Exception e) {
            return null;
        }
    }
}

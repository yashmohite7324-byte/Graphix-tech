package com.graphix.careerhub.jobs;

import com.graphix.careerhub.students.StudentProfile;
import org.springframework.stereotype.Component;

/**
 * Server-side eligibility calculation. This must NEVER be duplicated only on
 * the frontend — the frontend may show a preview, but this is the real gate
 * enforced when a student actually applies.
 */
@Component
public class EligibilityEngine {

    public boolean isEligible(StudentProfile student, JobEligibility rules) {
        if (rules == null) {
            return true; // no rules defined means open to everyone
        }

        if (rules.getMinCgpa() != null
                && (student.getCgpa() == null || student.getCgpa() < rules.getMinCgpa())) {
            return false;
        }

        if (rules.getMaxBacklogs() != null
                && student.getBacklogCount() != null
                && student.getBacklogCount() > rules.getMaxBacklogs()) {
            return false;
        }

        if (rules.getEligibleBranches() != null && !rules.getEligibleBranches().isBlank()
                && student.getBranch() != null
                && !rules.getEligibleBranches().toLowerCase().contains(student.getBranch().toLowerCase())) {
            return false;
        }

        if (rules.getEligibleBatchYear() != null
                && student.getBatchYear() != null
                && !rules.getEligibleBatchYear().equals(student.getBatchYear())) {
            return false;
        }

        // requiredSkills check intentionally omitted here — wire it up once the
        // Skill entity/relationship is added; comparing comma-separated strings
        // against a real skills table gives a more reliable match.

        return true;
    }

    /** Returns a human-readable reason when a student is NOT eligible, or null if eligible. */
    public String ineligibilityReason(StudentProfile student, JobEligibility rules) {
        if (rules == null) return null;

        if (rules.getMinCgpa() != null && (student.getCgpa() == null || student.getCgpa() < rules.getMinCgpa())) {
            return "CGPA below the required minimum of " + rules.getMinCgpa();
        }
        if (rules.getMaxBacklogs() != null && student.getBacklogCount() != null
                && student.getBacklogCount() > rules.getMaxBacklogs()) {
            return "Backlog count exceeds the allowed maximum of " + rules.getMaxBacklogs();
        }
        if (rules.getEligibleBranches() != null && !rules.getEligibleBranches().isBlank()
                && student.getBranch() != null
                && !rules.getEligibleBranches().toLowerCase().contains(student.getBranch().toLowerCase())) {
            return "Branch not eligible for this job";
        }
        if (rules.getEligibleBatchYear() != null && student.getBatchYear() != null
                && !rules.getEligibleBatchYear().equals(student.getBatchYear())) {
            return "Batch year not eligible for this job";
        }
        return null;
    }
}

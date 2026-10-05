package com.graphix.careerhub.config;

import com.graphix.careerhub.companies.Company;
import com.graphix.careerhub.companies.CompanyRepository;
import com.graphix.careerhub.companies.RecruiterProfile;
import com.graphix.careerhub.companies.RecruiterProfileRepository;
import com.graphix.careerhub.students.StudentProfile;
import com.graphix.careerhub.students.StudentProfileRepository;
import com.graphix.careerhub.users.User;
import com.graphix.careerhub.users.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository,
                                   CompanyRepository companyRepository,
                                   RecruiterProfileRepository recruiterProfileRepository,
                                   StudentProfileRepository studentProfileRepository,
                                   PasswordEncoder passwordEncoder) {
        return args -> {
            // 1. Exclusive System Admin Account
            String adminEmail = "admin@graphixinfotech.com";
            User admin = userRepository.findByEmail(adminEmail).orElse(null);
            if (admin == null) {
                admin = new User();
                admin.setEmail(adminEmail);
                admin.setPasswordHash(passwordEncoder.encode("Graphix@Admin2026!"));
                admin.setRole(User.Role.SUPER_ADMIN);
                admin.setStatus(User.Status.ACTIVE);
                userRepository.save(admin);
            } else {
                admin.setPasswordHash(passwordEncoder.encode("Graphix@Admin2026!"));
                admin.setRole(User.Role.SUPER_ADMIN);
                admin.setStatus(User.Status.ACTIVE);
                userRepository.save(admin);
            }

            // Remove legacy admin@graphix.edu if present
            userRepository.findByEmail("admin@graphix.edu").ifPresent(userRepository::delete);

            // 2. Recruiter Test Account (hr@logica.com / Password@123)
            String recruiterEmail = "hr@logica.com";
            User recruiter = userRepository.findByEmail(recruiterEmail).orElse(null);
            if (recruiter == null) {
                recruiter = new User();
                recruiter.setEmail(recruiterEmail);
                recruiter.setPasswordHash(passwordEncoder.encode("Password@123"));
                recruiter.setRole(User.Role.RECRUITER);
                recruiter.setStatus(User.Status.ACTIVE);
                userRepository.save(recruiter);
            } else {
                recruiter.setStatus(User.Status.ACTIVE);
                recruiter.setPasswordHash(passwordEncoder.encode("Password@123"));
                userRepository.save(recruiter);
            }

            Company company = companyRepository.findByName("Logica Infotech").orElse(null);
            if (company == null) {
                company = new Company();
                company.setName("Logica Infotech");
                company.setIndustry("Software & Product Engineering");
                company.setWebsite("https://www.logicainfotech.com");
                company.setVerificationStatus(Company.VerificationStatus.APPROVED);
                company = companyRepository.save(company);
            } else {
                company.setVerificationStatus(Company.VerificationStatus.APPROVED);
                companyRepository.save(company);
            }

            if (!recruiterProfileRepository.existsByUserId(recruiter.getId())) {
                RecruiterProfile rp = new RecruiterProfile();
                rp.setUser(recruiter);
                rp.setCompany(company);
                rp.setDesignation("Head of Talent Acquisition");
                recruiterProfileRepository.save(rp);
            }

            // 3. Student Test Account (shreya12@graphix.edu / shreya@123)
            String studentEmail = "shreya12@graphix.edu";
            User student = userRepository.findByEmail(studentEmail).orElse(null);
            if (student == null) {
                student = new User();
                student.setEmail(studentEmail);
                student.setPasswordHash(passwordEncoder.encode("shreya@123"));
                student.setRole(User.Role.STUDENT);
                student.setStatus(User.Status.ACTIVE);
                userRepository.save(student);
            } else {
                student.setStatus(User.Status.ACTIVE);
                student.setPasswordHash(passwordEncoder.encode("shreya@123"));
                userRepository.save(student);
            }

            StudentProfile sp = studentProfileRepository.findByUserId(student.getId()).orElse(null);
            if (sp == null) {
                sp = new StudentProfile();
                sp.setUser(student);
                sp.setFullName("Shreya Kudale");
                sp.setRollNumber("2026-COMP-0012");
                sp.setBranch("Computer Engineering");
                sp.setBatchYear(2026);
                sp.setCgpa(9.2);
                sp.setBacklogCount(0);
                sp.setVerificationStatus(StudentProfile.VerificationStatus.APPROVED);
                studentProfileRepository.save(sp);
            } else {
                sp.setVerificationStatus(StudentProfile.VerificationStatus.APPROVED);
                sp.setFullName("Shreya Kudale");
                sp.setBranch("Computer Engineering");
                sp.setCgpa(9.2);
                studentProfileRepository.save(sp);
            }
        };
    }
}

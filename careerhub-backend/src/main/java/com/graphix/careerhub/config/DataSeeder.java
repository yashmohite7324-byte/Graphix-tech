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

import com.graphix.careerhub.jobs.Job;
import com.graphix.careerhub.jobs.JobRepository;
import com.graphix.careerhub.jobs.JobEligibility;
import com.graphix.careerhub.jobs.JobEligibilityRepository;
import java.time.LocalDate;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository,
                                   CompanyRepository companyRepository,
                                   RecruiterProfileRepository recruiterProfileRepository,
                                   StudentProfileRepository studentProfileRepository,
                                   JobRepository jobRepository,
                                   JobEligibilityRepository jobEligibilityRepository,
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

            // 4. Seed Campus Jobs for Browse Jobs
            if (jobRepository.count() == 0) {
                Company logica = companyRepository.findByName("Logica Infotech").orElse(company);

                // Job 1: Full Stack Web Developer (Logica Infotech)
                Job job1 = new Job();
                job1.setCompany(logica);
                job1.setTitle("Full Stack Web Developer");
                job1.setDescription("Build and scale cloud microservices, REST APIs, and responsive React frontend applications.");
                job1.setCtc(14.5);
                job1.setApplicationDeadline(LocalDate.now().plusMonths(2));
                job1.setStatus(Job.Status.OPEN);
                jobRepository.save(job1);

                JobEligibility el1 = new JobEligibility();
                el1.setJob(job1);
                el1.setMinCgpa(7.0);
                el1.setMaxBacklogs(0);
                el1.setEligibleBatchYear(2026);
                el1.setEligibleBranches("Computer Engineering,Information Technology,CSE,ENTC");
                el1.setRequiredSkills("Java,Spring Boot,React,PostgreSQL,Docker");
                jobEligibilityRepository.save(el1);

                // Company 2: Google India
                Company google = companyRepository.findByName("Google India").orElseGet(() -> {
                    Company c = new Company();
                    c.setName("Google India");
                    c.setIndustry("Technology & Cloud");
                    c.setWebsite("https://www.google.com");
                    c.setVerificationStatus(Company.VerificationStatus.APPROVED);
                    return companyRepository.save(c);
                });

                Job job2 = new Job();
                job2.setCompany(google);
                job2.setTitle("Software Development Engineer (SDE-1)");
                job2.setDescription("Design large-scale distributed systems, search algorithms, and machine learning pipelines.");
                job2.setCtc(32.0);
                job2.setApplicationDeadline(LocalDate.now().plusMonths(2));
                job2.setStatus(Job.Status.OPEN);
                jobRepository.save(job2);

                JobEligibility el2 = new JobEligibility();
                el2.setJob(job2);
                el2.setMinCgpa(8.0);
                el2.setMaxBacklogs(0);
                el2.setEligibleBatchYear(2026);
                el2.setEligibleBranches("Computer Engineering,Information Technology,Data Science & AI");
                el2.setRequiredSkills("Algorithms,Java,Python,System Design");
                jobEligibilityRepository.save(el2);

                // Company 3: Amazon India
                Company amazon = companyRepository.findByName("Amazon India").orElseGet(() -> {
                    Company c = new Company();
                    c.setName("Amazon India");
                    c.setIndustry("E-Commerce & Cloud Computing");
                    c.setWebsite("https://www.amazon.jobs");
                    c.setVerificationStatus(Company.VerificationStatus.APPROVED);
                    return companyRepository.save(c);
                });

                Job job3 = new Job();
                job3.setCompany(amazon);
                job3.setTitle("Cloud Solutions Associate");
                job3.setDescription("Work with AWS infrastructure, cloud migration, serverless microservices, and DevOps automation.");
                job3.setCtc(28.5);
                job3.setApplicationDeadline(LocalDate.now().plusMonths(2));
                job3.setStatus(Job.Status.OPEN);
                jobRepository.save(job3);

                JobEligibility el3 = new JobEligibility();
                el3.setJob(job3);
                el3.setMinCgpa(7.5);
                el3.setMaxBacklogs(1);
                el3.setEligibleBatchYear(2026);
                el3.setEligibleBranches("Computer Engineering,Information Technology,Electronics & Telecommunication");
                el3.setRequiredSkills("AWS,Linux,Python,Cloud Architecture");
                jobEligibilityRepository.save(el3);

                // Company 4: Microsoft India
                Company ms = companyRepository.findByName("Microsoft India").orElseGet(() -> {
                    Company c = new Company();
                    c.setName("Microsoft India");
                    c.setIndustry("Software & Cloud Solutions");
                    c.setWebsite("https://careers.microsoft.com");
                    c.setVerificationStatus(Company.VerificationStatus.APPROVED);
                    return companyRepository.save(c);
                });

                Job job4 = new Job();
                job4.setCompany(ms);
                job4.setTitle("Software Engineer - Core Platform");
                job4.setDescription("Develop core cloud infrastructure, Azure services, and developer enterprise tools.");
                job4.setCtc(26.0);
                job4.setApplicationDeadline(LocalDate.now().plusMonths(2));
                job4.setStatus(Job.Status.OPEN);
                jobRepository.save(job4);

                JobEligibility el4 = new JobEligibility();
                el4.setJob(job4);
                el4.setMinCgpa(8.0);
                el4.setMaxBacklogs(0);
                el4.setEligibleBatchYear(2026);
                el4.setEligibleBranches("Computer Engineering,Information Technology");
                el4.setRequiredSkills("C++,Java,Distributed Systems");
                jobEligibilityRepository.save(el4);

                // Company 5: Razorpay
                Company razorpay = companyRepository.findByName("Razorpay").orElseGet(() -> {
                    Company c = new Company();
                    c.setName("Razorpay");
                    c.setIndustry("FinTech & Payments");
                    c.setWebsite("https://razorpay.com");
                    c.setVerificationStatus(Company.VerificationStatus.APPROVED);
                    return companyRepository.save(c);
                });

                Job job5 = new Job();
                job5.setCompany(razorpay);
                job5.setTitle("Backend Distributed Systems Engineer");
                job5.setDescription("Engineer ultra-low-latency financial transaction switches and payment gateway infrastructure.");
                job5.setCtc(16.0);
                job5.setApplicationDeadline(LocalDate.now().plusMonths(1));
                job5.setStatus(Job.Status.OPEN);
                jobRepository.save(job5);

                JobEligibility el5 = new JobEligibility();
                el5.setJob(job5);
                el5.setMinCgpa(7.5);
                el5.setMaxBacklogs(0);
                el5.setEligibleBatchYear(2026);
                el5.setEligibleBranches("Computer Engineering,Information Technology,Data Science & AI");
                el5.setRequiredSkills("Go,Java,Kafka,Redis,SQL");
                jobEligibilityRepository.save(el5);

                // Company 6: Tata Consultancy Services
                Company tcs = companyRepository.findByName("Tata Consultancy Services").orElseGet(() -> {
                    Company c = new Company();
                    c.setName("Tata Consultancy Services");
                    c.setIndustry("IT Services & Consulting");
                    c.setWebsite("https://www.tcs.com");
                    c.setVerificationStatus(Company.VerificationStatus.APPROVED);
                    return companyRepository.save(c);
                });

                Job job6 = new Job();
                job6.setCompany(tcs);
                job6.setTitle("Digital Specialist Programmer");
                job6.setDescription("Enterprise software transformation, modern web engineering, and automated testing.");
                job6.setCtc(9.0);
                job6.setApplicationDeadline(LocalDate.now().plusMonths(3));
                job6.setStatus(Job.Status.OPEN);
                jobRepository.save(job6);

                JobEligibility el6 = new JobEligibility();
                el6.setJob(job6);
                el6.setMinCgpa(6.5);
                el6.setMaxBacklogs(2);
                el6.setEligibleBatchYear(2026);
                el6.setEligibleBranches("Computer Engineering,Information Technology,Electronics & Telecommunication,Mechanical Engineering");
                el6.setRequiredSkills("Java,SQL,Web Technologies");
                jobEligibilityRepository.save(el6);
            }
        };
    }
}

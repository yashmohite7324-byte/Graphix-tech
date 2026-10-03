package com.graphix.careerhub.config;

import com.graphix.careerhub.companies.Company;
import com.graphix.careerhub.companies.CompanyRepository;
import com.graphix.careerhub.companies.RecruiterProfile;
import com.graphix.careerhub.companies.RecruiterProfileRepository;
import com.graphix.careerhub.students.StudentProfile;
import com.graphix.careerhub.students.StudentProfileRepository;
import com.graphix.careerhub.training.TrainingProgram;
import com.graphix.careerhub.training.TrainingProgramRepository;
import com.graphix.careerhub.users.User;
import com.graphix.careerhub.users.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.Random;

@Component
@Order(2)
public class EnterpriseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final CompanyRepository companyRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final TrainingProgramRepository trainingProgramRepository;
    private final PasswordEncoder passwordEncoder;

    public EnterpriseSeeder(UserRepository userRepository,
                            StudentProfileRepository studentProfileRepository,
                            CompanyRepository companyRepository,
                            RecruiterProfileRepository recruiterProfileRepository,
                            TrainingProgramRepository trainingProgramRepository,
                            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.companyRepository = companyRepository;
        this.recruiterProfileRepository = recruiterProfileRepository;
        this.trainingProgramRepository = trainingProgramRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        try {
            seedCompanies();
            seedStudents();
            seedTrainingPrograms();
        } catch (Exception e) {
            System.err.println("EnterpriseSeeder notice: " + e.getMessage());
        }
    }

    private void seedCompanies() {
        if (companyRepository.count() >= 50) {
            return;
        }

        String[] companyNames = {
            "Tata Consultancy Services", "Infosys Technologies", "Wipro Limited", "Accenture India", "Google India",
            "Microsoft India", "Amazon Development Centre", "Tech Mahindra", "HCL Technologies", "Cognizant Technology Solutions",
            "LTI Mindtree", "Persistent Systems", "Graphix Infotech", "Zoho Corporation", "Freshworks",
            "Swiggy", "Zomato", "Razorpay", "Paytm", "PhonePe",
            "Flipkart", "Ola Cabs", "Jio Platforms", "Ather Energy", "Druva Cloud Solutions",
            "Postman Labs", "Hasura", "BrowserStack", "Zerodha", "CRED",
            "InMobi", "Nykaa", "PolicyBazaar", "Pine Labs", "Delhivery",
            "Gupshup", "Chargebee", "Unacademy", "ShareChat", "Urban Company",
            "Rebel Foods", "Cars24", "Meesho", "Slice", "BharatPe",
            "Upstox", "CoinDCX", "Cleartrip", "Fractal Analytics", "Mu Sigma"
        };

        String[] industries = {"IT Services", "Product Engineering", "FinTech", "E-Commerce", "SaaS / Cloud", "EdTech", "Mobility & CleanTech"};
        String defaultPass = passwordEncoder.encode("Recruiter@2026!");

        for (int i = 0; i < companyNames.length; i++) {
            try {
                String cName = companyNames[i];
                String cleanName = cName.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
                String email = "hr@" + cleanName + ".com";

                Company company;
                if (!companyRepository.existsByName(cName)) {
                    company = new Company();
                    company.setName(cName);
                    company.setIndustry(industries[i % industries.length]);
                    company.setWebsite("https://www." + cleanName + ".com");
                    company.setVerificationStatus(i % 5 == 0 ? Company.VerificationStatus.PENDING : Company.VerificationStatus.APPROVED);
                    company = companyRepository.save(company);
                } else {
                    company = companyRepository.findByName(cName).orElse(null);
                }

                if (company != null && !userRepository.existsByEmail(email)) {
                    User user = new User();
                    user.setEmail(email);
                    user.setPasswordHash(defaultPass);
                    user.setRole(User.Role.RECRUITER);
                    user.setStatus(User.Status.ACTIVE);
                    userRepository.save(user);

                    RecruiterProfile rp = new RecruiterProfile();
                    rp.setUser(user);
                    rp.setCompany(company);
                    rp.setDesignation("Lead Talent Acquisition Specialist");
                    recruiterProfileRepository.save(rp);
                }
            } catch (Exception e) {
                // Ignore individual company duplicate
            }
        }
        System.out.println("Seeded 50 Enterprise Tech Companies and Recruiter Profiles into PostgreSQL.");
    }

    private void seedStudents() {
        long currentCount = studentProfileRepository.count();
        if (currentCount >= 500) {
            return;
        }

        String[] firstNames = {
            "Aarav", "Ananya", "Rohan", "Priya", "Aditya", "Ishita", "Devansh", "Tanvi", "Sanya", "Kunal",
            "Vihaan", "Diya", "Kabir", "Meera", "Yash", "Kadambari", "Shreya", "Neha", "Rahul", "Pooja",
            "Arjun", "Riya", "Varun", "Sneha", "Pranav", "Shruti", "Siddharth", "Kavya", "Manish", "Bhavna",
            "Saurabh", "Anushka", "Nikhil", "Simran", "Akash", "Kriti", "Gaurav", "Swati", "Deepak", "Nisha"
        };

        String[] lastNames = {
            "Sharma", "Verma", "Patel", "Gupta", "Iyer", "Kulkarni", "Mohite", "Kudale", "Abuj", "Kamthe",
            "Deshmukh", "Joshi", "Mehta", "Shah", "Reddy", "Nair", "Rao", "Chowdhury", "Singh", "Kumar",
            "Mishra", "Pandey", "Bhat", "Agarwal", "Bansal", "Chawla", "Tiwari", "Dutta", "Sengupta", "Pillai"
        };

        String[] branches = {
            "Computer Engineering",
            "Information Technology",
            "Data Science & AI",
            "Electronics & Telecommunication",
            "Mechanical Engineering",
            "Civil Engineering",
            "Electrical Engineering"
        };

        Integer[] batchYears = {2024, 2025, 2026};
        Random rand = new Random(42);
        String studentPass = passwordEncoder.encode("Student@2026!");

        int targetNew = (int) (500 - currentCount);
        int successCount = 0;

        for (int i = 0; i < targetNew + 100 && (currentCount + successCount) < 500; i++) {
            try {
                String fn = firstNames[rand.nextInt(firstNames.length)];
                String ln = lastNames[rand.nextInt(lastNames.length)];
                String fullName = fn + " " + ln;
                long nextNum = currentCount + successCount + 1000 + i;
                String rollNum = "2026-ENG-" + String.format("%05d", nextNum);
                String email = fn.toLowerCase() + "." + ln.toLowerCase() + nextNum + "@graphix.edu.in";

                if (userRepository.existsByEmail(email) || studentProfileRepository.existsByRollNumber(rollNum)) {
                    continue;
                }

                User user = new User();
                user.setEmail(email);
                user.setPasswordHash(studentPass);
                user.setRole(User.Role.STUDENT);

                StudentProfile.VerificationStatus vStatus;
                int statusRoll = rand.nextInt(10);
                if (statusRoll < 7) {
                    vStatus = StudentProfile.VerificationStatus.APPROVED;
                    user.setStatus(User.Status.ACTIVE);
                } else if (statusRoll < 9) {
                    vStatus = StudentProfile.VerificationStatus.PENDING;
                    user.setStatus(User.Status.PENDING);
                } else {
                    vStatus = StudentProfile.VerificationStatus.BLOCKED;
                    user.setStatus(User.Status.SUSPENDED);
                }

                user = userRepository.save(user);

                StudentProfile sp = new StudentProfile();
                sp.setUser(user);
                sp.setFullName(fullName);
                sp.setRollNumber(rollNum);
                sp.setBranch(branches[rand.nextInt(branches.length)]);
                sp.setBatchYear(batchYears[rand.nextInt(batchYears.length)]);
                sp.setCgpa(Math.round((6.5 + rand.nextDouble() * 3.4) * 100.0) / 100.0);
                sp.setBacklogCount(rand.nextDouble() > 0.85 ? 1 : 0);
                sp.setVerificationStatus(vStatus);
                sp.setResumeUrl("resumes/sample_" + rollNum + ".pdf");
                sp.setPhotoUrl("photos/sample_" + rollNum + ".jpg");

                studentProfileRepository.save(sp);
                successCount++;
            } catch (Exception e) {
                // Ignore individual row duplicate and keep seeding rest
            }
        }
        System.out.println("Seeded total 500 Realistic Indian Student Profiles in PostgreSQL.");
    }

    private void seedTrainingPrograms() {
        try {
            if (trainingProgramRepository.count() >= 4) {
                return;
            }

            TrainingProgram p1 = new TrainingProgram();
            p1.setName("Full-Stack Java & React Enterprise Bootcamp");
            p1.setDescription("Master Spring Boot 3, Microservices, Security, React 18, and Tailwind CSS for corporate campus drives.");
            p1.setTrainerName("Prof. Amruta Mankwade");
            p1.setBranch("Computer Engineering");
            p1.setBatchYear(2026);
            p1.setStartDate(LocalDate.now().minusDays(5));
            p1.setEndDate(LocalDate.now().plusDays(25));
            p1.setMode("HYBRID");
            p1.setSyllabus("Core Java, Spring Security, JWT, REST APIs, React components, State Management, PostgreSQL");

            TrainingProgram p2 = new TrainingProgram();
            p2.setName("DSA & Competitive Coding Sprint");
            p2.setDescription("Targeted problem solving, dynamic programming, tree algorithms, and graph theory for product companies.");
            p2.setTrainerName("Dr. S. K. Deshmukh");
            p2.setBranch("Information Technology");
            p2.setBatchYear(2026);
            p2.setStartDate(LocalDate.now());
            p2.setEndDate(LocalDate.now().plusDays(30));
            p2.setMode("OFFLINE");
            p2.setSyllabus("Arrays, Strings, Stacks, Queues, Binary Trees, Graphs, Greedy, Dynamic Programming");

            TrainingProgram p3 = new TrainingProgram();
            p3.setName("AWS & Cloud DevOps Fundamentals");
            p3.setDescription("Learn EC2, S3, Docker, Kubernetes, CI/CD pipelines, and terraform infrastructure setup.");
            p3.setTrainerName("Er. Devendra Verma");
            p3.setBranch("Data Science & AI");
            p3.setBatchYear(2025);
            p3.setStartDate(LocalDate.now().plusDays(3));
            p3.setEndDate(LocalDate.now().plusDays(20));
            p3.setMode("ONLINE");
            p3.setSyllabus("Cloud Architecture, AWS S3, IAM, Docker Containerization, GitHub Actions CI/CD");

            TrainingProgram p4 = new TrainingProgram();
            p4.setName("Aptitude & Verbal Mastery Workshop");
            p4.setDescription("Quantitative aptitude, logical reasoning, and verbal ability modules for first-round placement elimination tests.");
            p4.setTrainerName("Prof. Radhika Iyer");
            p4.setBranch("Electronics & Telecommunication");
            p4.setBatchYear(2026);
            p4.setStartDate(LocalDate.now().minusDays(2));
            p4.setEndDate(LocalDate.now().plusDays(10));
            p4.setMode("ONLINE");
            p4.setSyllabus("Quantitative Shortcuts, Analytical Reasoning, Data Interpretation, Verbal Grammar");

            trainingProgramRepository.saveAll(List.of(p1, p2, p3, p4));
            System.out.println("Seeded 4 Corporate Placement Training Programs into PostgreSQL.");
        } catch (Exception e) {
            // Non-fatal
        }
    }
}

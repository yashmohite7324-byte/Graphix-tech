package com.graphix.careerhub.config;

import com.graphix.careerhub.users.User;
import com.graphix.careerhub.users.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // 1. Admin Account 1
            String adminEmail = "admin@graphixinfotech.com";
            if (!userRepository.existsByEmail(adminEmail)) {
                User admin = new User();
                admin.setEmail(adminEmail);
                admin.setPasswordHash(passwordEncoder.encode("Graphix@Admin2026!"));
                admin.setRole(User.Role.SUPER_ADMIN);
                admin.setStatus(User.Status.ACTIVE);
                userRepository.save(admin);
            }

            // 2. Admin Account 2
            String adminEdu = "admin@graphix.edu";
            if (!userRepository.existsByEmail(adminEdu)) {
                User admin2 = new User();
                admin2.setEmail(adminEdu);
                admin2.setPasswordHash(passwordEncoder.encode("Admin@Graphix2026"));
                admin2.setRole(User.Role.SUPER_ADMIN);
                admin2.setStatus(User.Status.ACTIVE);
                userRepository.save(admin2);
            }

            // 3. Recruiter Test Account (hr@logica.com / Password@123)
            String recruiterEmail = "hr@logica.com";
            if (!userRepository.existsByEmail(recruiterEmail)) {
                User recruiter = new User();
                recruiter.setEmail(recruiterEmail);
                recruiter.setPasswordHash(passwordEncoder.encode("Password@123"));
                recruiter.setRole(User.Role.RECRUITER);
                recruiter.setStatus(User.Status.ACTIVE);
                userRepository.save(recruiter);
            }

            // 4. Student Test Account (shreya12@graphix.edu / shreya@123)
            String studentEmail = "shreya12@graphix.edu";
            if (!userRepository.existsByEmail(studentEmail)) {
                User student = new User();
                student.setEmail(studentEmail);
                student.setPasswordHash(passwordEncoder.encode("shreya@123"));
                student.setRole(User.Role.STUDENT);
                student.setStatus(User.Status.ACTIVE);
                userRepository.save(student);
            }
        };
    }
}

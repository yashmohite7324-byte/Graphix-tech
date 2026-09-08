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
            String adminEmail = "admin@graphixinfotech.com";
            if (!userRepository.existsByEmail(adminEmail)) {
                User admin = new User();
                admin.setEmail(adminEmail);
                admin.setPasswordHash(passwordEncoder.encode("Graphix@Admin2026!"));
                admin.setRole(User.Role.SUPER_ADMIN);
                admin.setStatus(User.Status.ACTIVE);
                userRepository.save(admin);
                System.out.println("Created super admin account: " + adminEmail);
            }
        };
    }
}

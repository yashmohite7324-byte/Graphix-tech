package com.graphix.careerhub.companies;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CompanyRepository extends JpaRepository<Company, Long> {
    boolean existsByName(String name);
    java.util.Optional<Company> findByName(String name);
}

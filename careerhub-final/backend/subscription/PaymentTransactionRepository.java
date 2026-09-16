package com.graphix.careerhub.subscription;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {
    List<PaymentTransaction> findByStudentIdOrderByCreatedAtDesc(Long studentId);
}

package com.graphix.careerhub.subscription;

import com.graphix.careerhub.audit.AuditService;
import com.graphix.careerhub.common.BadRequestException;
import com.graphix.careerhub.common.ResourceNotFoundException;
import com.graphix.careerhub.students.StudentProfileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;

@Service
public class SubscriptionService {

    private static final Logger log = LoggerFactory.getLogger(SubscriptionService.class);

    private final StudentAccessRepository studentAccessRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final PaymentTransactionRepository paymentRepo;
    private final StudentProfileRepository studentProfileRepository;
    private final AuditService auditService;

    public SubscriptionService(StudentAccessRepository studentAccessRepository,
                                SubscriptionPlanRepository subscriptionPlanRepository,
                                PaymentTransactionRepository paymentRepo,
                                StudentProfileRepository studentProfileRepository,
                                AuditService auditService) {
        this.studentAccessRepository = studentAccessRepository;
        this.subscriptionPlanRepository = subscriptionPlanRepository;
        this.paymentRepo = paymentRepo;
        this.studentProfileRepository = studentProfileRepository;
        this.auditService = auditService;
    }

    /** Check if a student has active portal access */
    public boolean hasActiveAccess(Long studentId) {
        return studentAccessRepository.findByStudentId(studentId)
            .map(access -> {
                if (access.getAccessTier().equals("GRAPHIX_STUDENT")) return true;
                if (access.getAccessTier().equals("EXTERNAL_PAID") &&
                    access.getAccessValidUntil() != null &&
                    access.getAccessValidUntil().isAfter(LocalDateTime.now())) return true;
                return false;
            })
            .orElse(false);
    }

    /** Get access tier for a student */
    public Map<String, Object> getAccessInfo(Long studentId) {
        var access = studentAccessRepository.findByStudentId(studentId).orElse(null);
        if (access == null) {
            return Map.of(
                "tier", "EXTERNAL_PENDING",
                "hasAccess", false,
                "planPrice", 1099,
                "message", "Purchase the External Student Plan for ₹1099 to access the full portal."
            );
        }
        boolean active = hasActiveAccess(studentId);
        return Map.of(
            "tier", access.getAccessTier(),
            "hasAccess", active,
            "paymentStatus", access.getPaymentStatus(),
            "validUntil", access.getAccessValidUntil() != null ? access.getAccessValidUntil().toString() : "Lifetime",
            "planPrice", access.getAccessTier().equals("GRAPHIX_STUDENT") ? 0 : 1099
        );
    }

    /**
     * Initiate payment for External Student Plan (₹1099)
     * Returns a payment order ID for the frontend to complete via Razorpay/UPI.
     *
     * For now returns a mock order — wire to Razorpay SDK for production.
     */
    @Transactional
    public Map<String, Object> initiatePayment(Long studentId, String paymentMethod) {
        var student = studentProfileRepository.findById(studentId)
            .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        var existingAccess = studentAccessRepository.findByStudentId(studentId);
        if (existingAccess.isPresent() && hasActiveAccess(studentId)) {
            throw new BadRequestException("You already have active portal access.");
        }

        var plan = subscriptionPlanRepository.findByPriceRs(1099.00)
            .orElseThrow(() -> new ResourceNotFoundException("External plan not found"));

        // Create a payment transaction record
        PaymentTransaction txn = new PaymentTransaction();
        txn.setStudentId(studentId);
        txn.setPlanId(plan.getId());
        txn.setAmountRs(1099.00);
        txn.setCurrency("INR");
        txn.setPaymentGateway(paymentMethod != null ? paymentMethod : "RAZORPAY");
        txn.setStatus("CREATED");

        // In production: call Razorpay API to create an order and return order_id.
        // Razorpay free to integrate (no monthly fee, 2% per transaction).
        String mockOrderId = "order_" + System.currentTimeMillis();
        txn.setGatewayOrderId(mockOrderId);
        paymentRepo.save(txn);

        log.info("Payment initiated for student {} — amount ₹1099, order {}", studentId, mockOrderId);

        return Map.of(
            "orderId", mockOrderId,
            "amount", 109900,           // Razorpay uses paise (1099 * 100)
            "currency", "INR",
            "planName", "External Student Plan",
            "description", "1-year access to Graphix CareerHub Portal",
            "transactionId", txn.getId()
        );
    }

    /**
     * Confirm payment after Razorpay/UPI callback.
     * In production verify the payment signature with Razorpay SDK.
     */
    @Transactional
    public Map<String, Object> confirmPayment(Long studentId, String gatewayPaymentId,
                                               String gatewayOrderId, Long transactionId) {
        PaymentTransaction txn = paymentRepo.findById(transactionId)
            .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        // Update transaction
        txn.setGatewayPaymentId(gatewayPaymentId);
        txn.setStatus("SUCCESS");
        txn.setCompletedAt(LocalDateTime.now());
        paymentRepo.save(txn);

        // Grant access
        var plan = subscriptionPlanRepository.findById(txn.getPlanId())
            .orElseThrow(() -> new ResourceNotFoundException("Plan not found"));

        StudentAccess access = studentAccessRepository.findByStudentId(studentId)
            .orElseGet(() -> {
                StudentAccess a = new StudentAccess();
                a.setStudentId(studentId);
                return a;
            });

        access.setAccessTier("EXTERNAL_PAID");
        access.setPlanId(plan.getId());
        access.setPaymentStatus("PAID");
        access.setPaymentReference(gatewayPaymentId);
        access.setAmountPaid(1099.00);
        access.setAccessValidFrom(LocalDateTime.now());
        access.setAccessValidUntil(LocalDateTime.now().plusDays(plan.getDurationDays()));
        studentAccessRepository.save(access);

        auditService.log("system", "PAYMENT_SUCCESS", "StudentAccess",
            studentId.toString(), "External plan activated — ₹1099 paid — valid 1 year");

        log.info("Access granted to student {} — tier EXTERNAL_PAID", studentId);

        return Map.of(
            "success", true,
            "message", "Payment successful! You now have full access to the portal for 1 year.",
            "validUntil", access.getAccessValidUntil().toString()
        );
    }

    /**
     * Admin: grant free Graphix Student access to a student
     */
    @Transactional
    public void grantGraphixAccess(Long studentId, String adminEmail) {
        StudentAccess access = studentAccessRepository.findByStudentId(studentId)
            .orElseGet(() -> {
                StudentAccess a = new StudentAccess();
                a.setStudentId(studentId);
                return a;
            });

        access.setAccessTier("GRAPHIX_STUDENT");
        access.setPaymentStatus("FREE");
        access.setAccessValidFrom(LocalDateTime.now());
        access.setAccessValidUntil(LocalDateTime.now().plusYears(10));
        studentAccessRepository.save(access);

        auditService.log(adminEmail, "GRAPHIX_ACCESS_GRANTED", "StudentAccess",
            studentId.toString(), "Free Graphix Institute access granted by admin");
    }
}

package com.graphix.careerhub.subscription;

import com.graphix.careerhub.common.ApiResponse;
import com.graphix.careerhub.students.StudentProfileRepository;
import com.graphix.careerhub.users.UserRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/subscription")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;
    private final StudentProfileRepository studentProfileRepository;
    private final UserRepository userRepository;

    public SubscriptionController(SubscriptionService subscriptionService,
                                   StudentProfileRepository studentProfileRepository,
                                   UserRepository userRepository) {
        this.subscriptionService = subscriptionService;
        this.studentProfileRepository = studentProfileRepository;
        this.userRepository = userRepository;
    }

    /** GET /api/v1/subscription/my-access — check current access tier */
    @GetMapping("/my-access")
    @PreAuthorize("hasRole('STUDENT')")
    public ApiResponse<Map<String, Object>> myAccess(Authentication auth) {
        Long studentId = getStudentId(auth.getName());
        return ApiResponse.success(subscriptionService.getAccessInfo(studentId));
    }

    /** POST /api/v1/subscription/initiate-payment — start ₹1099 payment */
    @PostMapping("/initiate-payment")
    @PreAuthorize("hasRole('STUDENT')")
    public ApiResponse<Map<String, Object>> initiatePayment(@RequestBody Map<String, String> body,
                                                             Authentication auth) {
        Long studentId = getStudentId(auth.getName());
        return ApiResponse.success(subscriptionService.initiatePayment(
            studentId, body.getOrDefault("paymentMethod", "RAZORPAY")
        ));
    }

    /** POST /api/v1/subscription/confirm-payment — confirm after gateway callback */
    @PostMapping("/confirm-payment")
    @PreAuthorize("hasRole('STUDENT')")
    public ApiResponse<Map<String, Object>> confirmPayment(@RequestBody Map<String, String> body,
                                                            Authentication auth) {
        Long studentId = getStudentId(auth.getName());
        return ApiResponse.success(subscriptionService.confirmPayment(
            studentId,
            body.get("gatewayPaymentId"),
            body.get("gatewayOrderId"),
            Long.parseLong(body.get("transactionId"))
        ));
    }

    /** ADMIN: grant free access to a Graphix student */
    @PostMapping("/admin/grant-access")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','PLACEMENT_ADMIN')")
    public ApiResponse<String> grantAccess(@RequestBody Map<String, Long> body,
                                            Authentication auth) {
        subscriptionService.grantGraphixAccess(body.get("studentId"), auth.getName());
        return ApiResponse.success("Graphix Institute access granted successfully");
    }

    private Long getStudentId(String email) {
        var user = userRepository.findByEmail(email)
            .orElseThrow(() -> new com.graphix.careerhub.common.ResourceNotFoundException("User not found"));
        return studentProfileRepository.findByUserId(user.getId())
            .orElseThrow(() -> new com.graphix.careerhub.common.ResourceNotFoundException("Student profile not found"))
            .getId();
    }
}

package com.graphix.careerhub.subscription;

import com.graphix.careerhub.common.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "subscription_plans")
@Getter @Setter
public class SubscriptionPlan extends BaseEntity {
    private String name;
    private Double priceRs;
    private Integer durationDays;
    private String description;
    @Column(columnDefinition = "TEXT")
    private String features;
    private Boolean isActive = true;
}

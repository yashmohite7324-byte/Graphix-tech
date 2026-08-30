package com.graphix.careerhub.placements;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Getter @Setter
public class PlacementRequest {
    @NotNull private Long studentId;
    @NotNull private Long companyId;
    @NotNull private Double ctcOffered;
    private LocalDate joiningDate;
    private String designation;
    private String location;
    private String offerLetterUrl;
}

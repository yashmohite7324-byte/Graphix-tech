package com.graphix.careerhub.placements;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface PlacementRepository extends JpaRepository<Placement, Long> {
    Optional<Placement> findByStudentId(Long studentId);
    List<Placement> findByCompanyId(Long companyId);

    @Query("SELECT COUNT(p) FROM Placement p WHERE p.status IN ('OFFERED','ACCEPTED','JOINED')")
    Long countPlacements();

    @Query("SELECT AVG(p.ctcOffered) FROM Placement p WHERE p.status IN ('OFFERED','ACCEPTED','JOINED')")
    Double avgCtc();

    @Query("SELECT MAX(p.ctcOffered) FROM Placement p WHERE p.status IN ('OFFERED','ACCEPTED','JOINED')")
    Double maxCtc();
}

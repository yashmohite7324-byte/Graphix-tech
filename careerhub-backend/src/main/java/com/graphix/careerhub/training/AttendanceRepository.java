package com.graphix.careerhub.training;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByStudentId(Long studentId);
    List<Attendance> findByTrainingProgramId(Long programId);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student.id = :studentId AND a.trainingProgram.id = :programId AND a.status = 'PRESENT'")
    Long countPresent(Long studentId, Long programId);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student.id = :studentId AND a.trainingProgram.id = :programId")
    Long countTotal(Long studentId, Long programId);
}

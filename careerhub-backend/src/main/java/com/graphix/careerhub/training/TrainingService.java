package com.graphix.careerhub.training;

import com.graphix.careerhub.common.ResourceNotFoundException;
import com.graphix.careerhub.students.StudentProfile;
import com.graphix.careerhub.students.StudentProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
public class TrainingService {

    private final TrainingProgramRepository programRepo;
    private final AttendanceRepository attendanceRepo;
    private final AssessmentRepository assessmentRepo;
    private final AssessmentScoreRepository scoreRepo;
    private final StudentProfileRepository studentRepo;

    public TrainingService(TrainingProgramRepository programRepo,
                           AttendanceRepository attendanceRepo,
                           AssessmentRepository assessmentRepo,
                           AssessmentScoreRepository scoreRepo,
                           StudentProfileRepository studentRepo) {
        this.programRepo = programRepo;
        this.attendanceRepo = attendanceRepo;
        this.assessmentRepo = assessmentRepo;
        this.scoreRepo = scoreRepo;
        this.studentRepo = studentRepo;
    }

    public TrainingProgram createProgram(TrainingProgram program) {
        return programRepo.save(program);
    }

    public List<TrainingProgram> getAllPrograms() {
        return programRepo.findAll();
    }

    @Transactional
    public Attendance markAttendance(Long programId, Long studentId,
                                      String date, String status) {
        TrainingProgram program = programRepo.findById(programId)
                .orElseThrow(() -> new ResourceNotFoundException("Training program not found"));
        StudentProfile student = studentRepo.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        Attendance attendance = new Attendance();
        attendance.setTrainingProgram(program);
        attendance.setStudent(student);
        attendance.setDate(java.time.LocalDate.parse(date));
        attendance.setStatus(Attendance.Status.valueOf(status.toUpperCase()));
        return attendanceRepo.save(attendance);
    }

    public Map<String, Object> getAttendanceSummary(Long studentId, Long programId) {
        long present = attendanceRepo.countPresent(studentId, programId);
        long total = attendanceRepo.countTotal(studentId, programId);
        Map<String, Object> summary = new HashMap<>();
        summary.put("present", present);
        summary.put("total", total);
        summary.put("percentage", total > 0 ? (present * 100.0 / total) : 0);
        return summary;
    }

    public AssessmentScore saveScore(Long assessmentId, Long studentId, Double score, String remarks) {
        Assessment assessment = assessmentRepo.findById(assessmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment not found"));
        StudentProfile student = studentRepo.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        AssessmentScore s = new AssessmentScore();
        s.setAssessment(assessment);
        s.setStudent(student);
        s.setScore(score);
        s.setRemarks(remarks);
        return scoreRepo.save(s);
    }

    public List<AssessmentScore> getScoresForStudent(Long studentId) {
        return scoreRepo.findByStudentId(studentId);
    }
}

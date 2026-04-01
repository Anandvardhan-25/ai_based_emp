package com.example.ems.employee;

import com.example.ems.employee.dto.SkillMatchResponse;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/skills")
public class SkillController {
    private final SkillService skillService;

    public SkillController(SkillService skillService) {
        this.skillService = skillService;
    }

    @PostMapping("/resume/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<Set<String>> uploadResume(
            @PathVariable UUID employeeId,
            @RequestParam("file") MultipartFile file) {
        if (file.isEmpty() || !file.getContentType().equals("application/pdf")) {
            throw new IllegalArgumentException("Only PDF files are supported");
        }
        return ResponseEntity.ok(skillService.analyzeAndSaveResume(employeeId, file));
    }

    @GetMapping("/match")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<List<SkillMatchResponse>> matchSkills(@RequestParam List<String> skills) {
        return ResponseEntity.ok(skillService.matchSkills(skills));
    }
}

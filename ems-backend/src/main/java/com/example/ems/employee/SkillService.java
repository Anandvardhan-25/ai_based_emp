package com.example.ems.employee;

import com.example.ems.domain.Employee;
import com.example.ems.employee.dto.SkillMatchResponse;
import com.example.ems.exception.NotFoundException;
import com.example.ems.repository.EmployeeRepository;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class SkillService {
    private static final Logger log = LoggerFactory.getLogger(SkillService.class);

    private static final List<String> KNOWN_SKILLS = List.of(
        "Java", "Spring Boot", "Spring", "Python", "React", "Angular", "Vue", "Node.js", "Express",
        "SQL", "PostgreSQL", "MySQL", "MongoDB", "AWS", "Azure", "GCP", "Docker", "Kubernetes",
        "CI/CD", "Git", "Maven", "Gradle", "Javascript", "Typescript", "C++", "C#", ".NET",
        "HTML", "CSS", "Tailwind", "REST API", "GraphQL", "Redis", "Kafka", "RabbitMQ"
    );

    private final EmployeeRepository employeeRepo;

    public SkillService(EmployeeRepository employeeRepo) {
        this.employeeRepo = employeeRepo;
    }

    @Transactional
    public Set<String> analyzeAndSaveResume(UUID employeeId, MultipartFile file) {
        Employee emp = employeeRepo.findByIdAndDeletedFalse(employeeId)
            .orElseThrow(() -> new NotFoundException("Employee not found"));

        try (InputStream is = file.getInputStream(); PDDocument document = Loader.loadPDF(is.readAllBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            
            Set<String> extractedSkills = new HashSet<>();
            String lowerText = text.toLowerCase();
            
            for (String skill : KNOWN_SKILLS) {
                if (skill.contains(".")) {
                    if (lowerText.contains(skill.toLowerCase())) {
                        extractedSkills.add(skill);
                    }
                } else if (skill.equals("C++") || skill.equals("C#")) {
                    if (lowerText.contains(skill.toLowerCase())) {
                        extractedSkills.add(skill);
                    }
                } else {
                    String pattern = "\\b" + Pattern.quote(skill.toLowerCase()) + "\\b";
                    if (Pattern.compile(pattern).matcher(lowerText).find()) {
                        extractedSkills.add(skill);
                    }
                }
            }
            
            emp.getSkills().addAll(extractedSkills);
            employeeRepo.save(emp);
            log.info("Extracted {} skills for employee {}", extractedSkills.size(), employeeId);
            return emp.getSkills();
            
        } catch (IOException e) {
            log.error("Failed to parse resume PDF", e);
            throw new RuntimeException("Failed to read resume file: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<SkillMatchResponse> matchSkills(List<String> requiredSkills) {
        List<Employee> employees = employeeRepo.findAll();
        List<SkillMatchResponse> results = new ArrayList<>();

        if (requiredSkills == null || requiredSkills.isEmpty()) {
            return results;
        }

        for (Employee e : employees) {
            if (e.isDeleted()) continue;
            
            Set<String> hasSkills = new HashSet<>();
            Set<String> missingSkills = new HashSet<>(requiredSkills);
            
            for (String s : e.getSkills()) {
                String sl = s.toLowerCase();
                for (String rs : requiredSkills) {
                    if (rs.toLowerCase().equals(sl)) {
                        hasSkills.add(rs);
                        missingSkills.remove(rs);
                    }
                }
            }
            
            double matchPercentage = (double) hasSkills.size() / requiredSkills.size() * 100.0;
            
            if (matchPercentage > 0) {
                results.add(new SkillMatchResponse(
                    e.getId(), e.getName(), e.getEmail(), hasSkills, missingSkills, matchPercentage
                ));
            }
        }
        
        results.sort((a,b) -> Double.compare(b.matchPercentage(), a.matchPercentage()));
        return results;
    }
}

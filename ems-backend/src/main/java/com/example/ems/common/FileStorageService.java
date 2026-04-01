package com.example.ems.common;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileStorageService {
    
    private final String uploadDir = "uploads/";

    public FileStorageService() {
        File directory = new File(uploadDir);
        if (!directory.exists()) {
            directory.mkdirs();
        }
    }

    public String saveFile(MultipartFile file, String subdirectory) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload empty file");
        }
        
        String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path targetLocation = Paths.get(uploadDir + subdirectory).toAbsolutePath().normalize();
        
        if (!Files.exists(targetLocation)) {
            Files.createDirectories(targetLocation);
        }
        
        Path filePath = targetLocation.resolve(filename);
        Files.copy(file.getInputStream(), filePath);
        
        return "/files/" + subdirectory + "/" + filename;
    }
}

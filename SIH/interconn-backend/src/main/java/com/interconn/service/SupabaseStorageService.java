package com.interconn.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.util.UUID;

@Service
public class SupabaseStorageService {

    private final String supabaseUrl;
    private final String supabaseKey;
    private final String evidenceBucket;
    private final String reportsBucket;
    private final HttpClient httpClient;

    public SupabaseStorageService(
            @Value("${supabase.url:https://xyzcompany.supabase.co}") String supabaseUrl,
            @Value("${supabase.key:dummy-supabase-key}") String supabaseKey,
            @Value("${supabase.storage.bucket.evidence:evidence-images}") String evidenceBucket,
            @Value("${supabase.storage.bucket.reports:reports}") String reportsBucket) {

        this.supabaseUrl = supabaseUrl;
        this.supabaseKey = supabaseKey;
        this.evidenceBucket = evidenceBucket;
        this.reportsBucket = reportsBucket;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    public String uploadEvidence(UUID inspectionId, MultipartFile file) {
        String filename = UUID.randomUUID() + getExtension(file.getOriginalFilename());
        String objectPath = "inspections/" + inspectionId + "/" + filename;
        String contentType = file.getContentType() != null ? file.getContentType() : "image/jpeg";

        try {
            byte[] bytes = file.getBytes();
            return uploadToBucket(evidenceBucket, objectPath, bytes, contentType);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read upload file bytes", e);
        }
    }

    public String uploadReport(UUID inspectionId, byte[] reportBytes, String fileName) {
        String objectPath = "reports/" + inspectionId + "/" + fileName;
        return uploadToBucket(reportsBucket, objectPath, reportBytes, "application/pdf");
    }

    private String uploadToBucket(String bucket, String objectPath, byte[] data, String contentType) {
        boolean isSupabaseConfigured = supabaseUrl != null &&
                !supabaseUrl.contains("xyzcompany") &&
                supabaseKey != null &&
                !supabaseKey.contains("dummy");

        if (isSupabaseConfigured) {
            try {
                String uploadEndpoint = supabaseUrl + "/storage/v1/object/" + bucket + "/" + objectPath;

                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(uploadEndpoint))
                        .header("Authorization", "Bearer " + supabaseKey)
                        .header("apikey", supabaseKey)
                        .header("Content-Type", contentType)
                        .header("x-upsert", "true")
                        .POST(HttpRequest.BodyPublishers.ofByteArray(data))
                        .build();

                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

                if (response.statusCode() == 200 || response.statusCode() == 201) {
                    return supabaseUrl + "/storage/v1/object/public/" + bucket + "/" + objectPath;
                } else {
                    System.err.println("Supabase Storage upload warning: HTTP " + response.statusCode() + " - " + response.body());
                }
            } catch (Exception e) {
                System.err.println("Supabase Storage connection failed: " + e.getMessage() + ". Falling back to local storage.");
            }
        }

        // Fallback local storage implementation for testing/dev environments
        return saveFileLocally(bucket, objectPath, data);
    }

    private String saveFileLocally(String bucket, String objectPath, byte[] data) {
        try {
            Path localPath = Paths.get("uploads", bucket, objectPath);
            Files.createDirectories(localPath.getParent());
            Files.write(localPath, data);
            return localPath.toString().replace("\\", "/");
        } catch (IOException e) {
            throw new RuntimeException("Failed to save fallback local file", e);
        }
    }

    private String getExtension(String originalFilename) {
        if (originalFilename != null && originalFilename.contains(".")) {
            return originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        return ".jpg";
    }
}

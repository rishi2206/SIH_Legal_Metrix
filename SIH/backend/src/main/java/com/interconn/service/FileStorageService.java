package com.interconn.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Service
public class FileStorageService {

    private final SupabaseStorageService supabaseStorageService;

    public FileStorageService(SupabaseStorageService supabaseStorageService) {
        this.supabaseStorageService = supabaseStorageService;
    }

    public String saveFile(UUID inspectionId, MultipartFile file) {
        return supabaseStorageService.uploadEvidence(inspectionId, file);
    }
}
package com.sems.document.domain.port;

import java.io.InputStream;

public interface StorageService {
    String uploadFile(String fileName, InputStream inputStream, String contentType);
    byte[] downloadFile(String fileKey);
    String getFileUrl(String fileKey);
    void deleteFile(String fileKey);
} 
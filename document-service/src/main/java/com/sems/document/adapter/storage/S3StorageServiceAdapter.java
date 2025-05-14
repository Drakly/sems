package com.sems.document.adapter.storage;

import com.sems.document.domain.port.StorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

import jakarta.annotation.PostConstruct;
import java.io.InputStream;
import java.time.Duration;

@Component
@Slf4j
public class S3StorageServiceAdapter implements StorageService {
    
    @Value("${app.aws.s3.bucket-name}")
    private String bucketName;
    
    @Value("${app.aws.s3.region}")
    private String region;
    
    @Value("${app.aws.s3.access-key}")
    private String accessKey;
    
    @Value("${app.aws.s3.secret-key}")
    private String secretKey;
    
    private S3Client s3Client;
    private S3Presigner s3Presigner;
    
    @PostConstruct
    public void init() {
        // Create AWS credentials
        AwsBasicCredentials awsCredentials = AwsBasicCredentials.create(accessKey, secretKey);
        
        // Build S3 client with credentials
        s3Client = S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(awsCredentials))
                .build();
        
        // Build S3 presigner with credentials
        s3Presigner = S3Presigner.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(awsCredentials))
                .build();
        
        log.info("S3 client initialized with region: {}, bucket: {}", region, bucketName);
    }
    
    @Override
    public String uploadFile(String fileName, InputStream inputStream, String contentType) {
        try {
            String key = "documents/" + fileName;
            
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(contentType)
                    .build();
            
            s3Client.putObject(request, 
                    RequestBody.fromInputStream(inputStream, inputStream.available()));
            
            log.info("Uploaded file to S3: {}", key);
            return key;
        } catch (Exception e) {
            log.error("Failed to upload file to S3", e);
            throw new RuntimeException("Failed to upload file to S3: " + e.getMessage());
        }
    }
    
    @Override
    public byte[] downloadFile(String fileKey) {
        try {
            GetObjectRequest request = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileKey)
                    .build();
            
            ResponseBytes<GetObjectResponse> objectBytes = s3Client.getObjectAsBytes(request);
            log.info("Downloaded file from S3: {}", fileKey);
            return objectBytes.asByteArray();
        } catch (Exception e) {
            log.error("Failed to download file from S3", e);
            throw new RuntimeException("Failed to download file from S3: " + e.getMessage());
        }
    }
    
    @Override
    public String getFileUrl(String fileKey) {
        try {
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileKey)
                    .build();
            
            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofMinutes(60)) // URL expires in 60 minutes
                    .getObjectRequest(getObjectRequest)
                    .build();
            
            String presignedUrl = s3Presigner.presignGetObject(presignRequest).url().toString();
            log.info("Generated presigned URL for file: {}", fileKey);
            return presignedUrl;
        } catch (Exception e) {
            log.error("Failed to generate URL for file", e);
            throw new RuntimeException("Failed to generate URL for file: " + e.getMessage());
        }
    }
    
    @Override
    public void deleteFile(String fileKey) {
        try {
            DeleteObjectRequest request = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileKey)
                    .build();
            
            s3Client.deleteObject(request);
            log.info("Deleted file from S3: {}", fileKey);
        } catch (Exception e) {
            log.error("Failed to delete file from S3", e);
            throw new RuntimeException("Failed to delete file from S3: " + e.getMessage());
        }
    }
} 
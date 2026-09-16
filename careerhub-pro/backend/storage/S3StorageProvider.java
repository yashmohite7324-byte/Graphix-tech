package com.graphix.careerhub.storage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

import java.time.Duration;
import java.util.UUID;

/**
 * AWS S3 Storage Provider
 * Active when: app.storage.provider=s3
 *
 * ─── Setup ────────────────────────────────────────────────────
 * 1. AWS Console → S3 → Create Bucket
 *    - Name: careerhub-files-prod (must be globally unique)
 *    - Region: ap-south-1 (Mumbai — closest to Pune)
 *    - Block ALL public access: ON (we use presigned URLs for private access)
 *
 * 2. AWS Console → IAM → Users → Create User
 *    - Name: careerhub-s3-user
 *    - Attach policy: AmazonS3FullAccess (or create a scoped policy)
 *    - Security credentials → Create Access Key → copy both values
 *
 * 3. Add to application.properties:
 *    app.storage.provider=s3
 *    aws.s3.bucket=careerhub-files-prod
 *    aws.s3.region=ap-south-1
 *    aws.s3.access-key=AKIAXXXXXXXXXXXXXXXX
 *    aws.s3.secret-key=your_secret_key_here
 *
 * 4. Add to pom.xml:
 *    <dependency>
 *      <groupId>software.amazon.awssdk</groupId>
 *      <artifactId>s3</artifactId>
 *      <version>2.25.27</version>
 *    </dependency>
 *
 * ─── Free Tier ────────────────────────────────────────────────
 * First 12 months FREE: 5 GB storage, 20,000 GET, 2,000 PUT requests/month
 * After free tier: $0.025/GB/month (ap-south-1 Mumbai)
 * 200 students × 1MB = 200 MB → $0.005/month (basically free)
 *
 * ─── Folder structure inside S3 bucket ───────────────────────
 * careerhub/resumes/         ← student resume PDFs
 * careerhub/photos/          ← profile photos
 * careerhub/certificates/    ← course certs
 * careerhub/offers/          ← offer letters
 * careerhub/company-docs/    ← company verification docs
 * careerhub/assessments/     ← training material PDFs
 */
@Component
@ConditionalOnProperty(name = "app.storage.provider", havingValue = "s3")
public class S3StorageProvider implements StorageProvider {

    private static final Logger log = LoggerFactory.getLogger(S3StorageProvider.class);

    @Value("${aws.s3.bucket}")
    private String bucket;

    @Value("${aws.s3.region:ap-south-1}")
    private String region;

    @Value("${aws.s3.access-key}")
    private String accessKey;

    @Value("${aws.s3.secret-key}")
    private String secretKey;

    private S3Client buildClient() {
        return S3Client.builder()
            .region(Region.of(region))
            .credentialsProvider(StaticCredentialsProvider.create(
                AwsBasicCredentials.create(accessKey, secretKey)
            ))
            .build();
    }

    private S3Presigner buildPresigner() {
        return S3Presigner.builder()
            .region(Region.of(region))
            .credentialsProvider(StaticCredentialsProvider.create(
                AwsBasicCredentials.create(accessKey, secretKey)
            ))
            .build();
    }

    @Override
    public StorageResult upload(MultipartFile file, String folder, String fileName) {
        try (S3Client s3 = buildClient()) {
            String ext = getExtension(file.getOriginalFilename());
            String key = folder + "/" + fileName + "_" + UUID.randomUUID().toString().substring(0, 8) + ext;

            PutObjectRequest req = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType(file.getContentType())
                .contentLength(file.getSize())
                // Server-side encryption with AWS managed keys (free)
                .serverSideEncryption(ServerSideEncryption.AES256)
                .build();

            s3.putObject(req, RequestBody.fromBytes(file.getBytes()));

            // Private bucket — return presigned URL valid 24h for immediate display
            String presignedUrl = getSignedUrl(key, 86400);
            // Store the raw key in DB — regenerate presigned URLs as needed
            String publicUrl = "https://" + bucket + ".s3." + region + ".amazonaws.com/" + key;

            log.info("S3 upload: bucket={} key={}", bucket, key);
            return new StorageResult(presignedUrl, key, fileName, file.getSize(), file.getContentType(), "s3");

        } catch (Exception e) {
            log.error("S3 upload failed: {}", e.getMessage());
            throw new StorageException("S3 upload failed: " + e.getMessage(), e);
        }
    }

    @Override
    public void delete(String storageKey) {
        try (S3Client s3 = buildClient()) {
            s3.deleteObject(b -> b.bucket(bucket).key(storageKey));
            log.info("S3 deleted: {}", storageKey);
        } catch (Exception e) {
            log.warn("S3 delete failed for {}: {}", storageKey, e.getMessage());
        }
    }

    @Override
    public String getSignedUrl(String storageKey, int expirySeconds) {
        try (S3Presigner presigner = buildPresigner()) {
            GetObjectPresignRequest presignReq = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofSeconds(expirySeconds))
                .getObjectRequest(b -> b.bucket(bucket).key(storageKey))
                .build();
            return presigner.presignGetObject(presignReq).url().toString();
        } catch (Exception e) {
            log.error("Presigned URL failed for {}: {}", storageKey, e.getMessage());
            return null;
        }
    }

    private String getExtension(String name) {
        if (name == null || !name.contains(".")) return "";
        return "." + name.substring(name.lastIndexOf('.') + 1).toLowerCase();
    }
}

package com.graphix.careerhub.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

@Configuration
public class S3Config {

    @Value("${aws.s3.region:ap-south-1}")
    private String region;

    @Value("${aws.access-key-id:}")
    private String accessKey;

    @Value("${aws.secret-access-key:}")
    private String secretKey;

    private String getResolvedAccessKey() {
        if (accessKey != null && !accessKey.isBlank()) return accessKey.trim();
        String envKey = System.getenv("AWS_ACCESS_KEY_ID");
        return envKey != null ? envKey.trim() : null;
    }

    private String getResolvedSecretKey() {
        if (secretKey != null && !secretKey.isBlank()) return secretKey.trim();
        String envSecret = System.getenv("AWS_SECRET_ACCESS_KEY");
        return envSecret != null ? envSecret.trim() : null;
    }

    @Bean
    public S3Client s3Client() {
        var builder = S3Client.builder().region(Region.of(region));
        String finalKey = getResolvedAccessKey();
        String finalSecret = getResolvedSecretKey();

        if (finalKey != null && !finalKey.isBlank() && finalSecret != null && !finalSecret.isBlank()) {
            builder.credentialsProvider(StaticCredentialsProvider.create(
                    AwsBasicCredentials.create(finalKey, finalSecret)
            ));
        } else {
            builder.credentialsProvider(DefaultCredentialsProvider.create());
        }
        return builder.build();
    }

    @Bean
    public S3Presigner s3Presigner() {
        var builder = S3Presigner.builder().region(Region.of(region));
        String finalKey = getResolvedAccessKey();
        String finalSecret = getResolvedSecretKey();

        if (finalKey != null && !finalKey.isBlank() && finalSecret != null && !finalSecret.isBlank()) {
            builder.credentialsProvider(StaticCredentialsProvider.create(
                    AwsBasicCredentials.create(finalKey, finalSecret)
            ));
        } else {
            builder.credentialsProvider(DefaultCredentialsProvider.create());
        }
        return builder.build();
    }
}

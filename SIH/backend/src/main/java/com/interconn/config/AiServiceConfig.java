package com.interconn.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

/**
 * Configures the HTTP client used to call the AI service
 * (FastAPI: OpenCV preprocessing + PaddleOCR + Gemini structuring).
 */
@Configuration
public class AiServiceConfig {

    @Bean
    public RestClient aiServiceRestClient(
            @Value("${ai.service.base-url}") String baseUrl,
            @Value("${ai.service.connect-timeout-ms}") int connectTimeoutMs,
            @Value("${ai.service.read-timeout-ms}") int readTimeoutMs) {

        SimpleClientHttpRequestFactory requestFactory =
                new SimpleClientHttpRequestFactory();

        requestFactory.setConnectTimeout(connectTimeoutMs);
        requestFactory.setReadTimeout(readTimeoutMs);

        ClientHttpRequestFactory factory = requestFactory;

        return RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(factory)
                .build();
    }
}

package com.example.springboot_app.config; // Change to your actual package

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {

        System.out.println("CORS config is being loaded!"); // Temporary debug

        registry.addMapping("/**") // Allow all paths
                .allowedOrigins(
                        "http://localhost:8080", // Frontend container
                        "http://localhost:8888" // Optional: Allow direct access
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Allowed HTTP methods
                .allowedHeaders("*") // All headers
                .allowCredentials(true) // Enable cookies/auth
                .maxAge(3600); // Cache preflight requests (OPTIONS) for 1 hour

    }
}
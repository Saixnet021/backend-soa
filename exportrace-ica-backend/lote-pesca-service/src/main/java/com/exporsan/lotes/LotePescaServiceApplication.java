package com.exporsan.lotes;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(scanBasePackages = "com.exporsan")
@EnableJpaRepositories(basePackages = "com.exporsan")
@EntityScan(basePackages = "com.exporsan")
@EnableScheduling
public class LotePescaServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(LotePescaServiceApplication.class, args);
    }
}

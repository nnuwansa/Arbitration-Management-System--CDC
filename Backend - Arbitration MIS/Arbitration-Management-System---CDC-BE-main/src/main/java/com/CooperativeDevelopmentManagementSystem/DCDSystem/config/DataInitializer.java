package com.CooperativeDevelopmentManagementSystem.DCDSystem.config;

import com.CooperativeDevelopmentManagementSystem.DCDSystem.model.District;
import com.CooperativeDevelopmentManagementSystem.DCDSystem.repository.DistrictRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final DistrictRepository districtRepository;

    @Override
    public void run(String... args) throws Exception {
        if (districtRepository.count() == 0) {
            log.info("Initializing districts...");

            List<District> districts = Arrays.asList(
                    District.builder().id("nuwara-eliya").name("Nuwara Eliya").code("N").build(),
                    District.builder().id("kandy").name("Kandy").code("K").build(),
                    District.builder().id("matale").name("Matale").code("M").build()
            );

            districtRepository.saveAll(districts);
            log.info("Districts initialized successfully");
        }
    }
}
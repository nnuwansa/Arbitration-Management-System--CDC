package com.CooperativeDevelopmentManagementSystem.DCDSystem;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.security.SecureRandom;
import java.util.Base64;

@SpringBootApplication
public class DcdSystemApplication {

	public static void main(String[] args) {
		SpringApplication.run(DcdSystemApplication.class, args);
	}

}





//   import java.security.SecureRandom;
//   import java.util.Base64;
//
//public class DcdSystemApplication {
//	public static void main(String[] args) {
//		SecureRandom random = new SecureRandom();
//		byte[] bytes = new byte[64]; // 512 bits
//		random.nextBytes(bytes);
//		String secret = Base64.getEncoder().encodeToString(bytes);
//		System.out.println("JWT Secret: " + secret);
//	}
//}
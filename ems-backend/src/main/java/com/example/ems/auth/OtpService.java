package com.example.ems.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {
    private static final Logger log = LoggerFactory.getLogger(OtpService.class);
    private final Map<String, OtpData> otpStorage = new ConcurrentHashMap<>();
    private final Random random = new Random();

    public void generateAndSendOtp(String email) {
        String otp = String.format("%06d", random.nextInt(999999));
        OtpData otpData = new OtpData(otp, Instant.now().plusSeconds(300)); // 5 min expiry
        otpStorage.put(email, otpData);
        log.info("==============================================");
        log.info("OTP for password reset for {} is: {}", email, otp);
        log.info("==============================================");
    }

    public boolean verifyOtp(String email, String otp) {
        OtpData data = otpStorage.get(email);
        if (data == null) {
            return false;
        }
        if (Instant.now().isAfter(data.expiry())) {
            otpStorage.remove(email);
            return false; // Expired
        }
        if (data.otp().equals(otp)) {
            // Once verified, we need to mark it as verified or just remove it when resetting password.
            // For security, remove it here and store a "VERIFIED" state.
            // Simplified: we'll transition to verified state.
            otpStorage.put(email, new OtpData("VERIFIED", Instant.now().plusSeconds(300)));
            return true;
        }
        return false;
    }

    public boolean canResetPassword(String email) {
        OtpData data = otpStorage.get(email);
        if (data != null && "VERIFIED".equals(data.otp()) && Instant.now().isBefore(data.expiry())) {
            otpStorage.remove(email); // consume it
            return true;
        }
        return false;
    }

    private record OtpData(String otp, Instant expiry) {}
}

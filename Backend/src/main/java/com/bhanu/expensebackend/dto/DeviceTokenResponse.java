package com.bhanu.expensebackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeviceTokenResponse {

    /**
     * The raw device token to store securely on the Android device.
     *
     * SECURITY NOTE: This is the ONLY time the raw token will be visible.
     * The server stores only a SHA-256 hash of this value.
     * If the token is lost, the user must generate a new one.
     */
    private String token;

    private String deviceName;

    private String note;
}

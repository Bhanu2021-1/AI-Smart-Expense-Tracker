package com.bhanu.expensebackend.dto;

import lombok.Data;

@Data
public class DeviceTokenRequest {
    /** Human-readable name for the Android device, e.g. "Pixel 7 Pro". */
    private String deviceName;
    private String androidVersion;
    private String appVersion;
}

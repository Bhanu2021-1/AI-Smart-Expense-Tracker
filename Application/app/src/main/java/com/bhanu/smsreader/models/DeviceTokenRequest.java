package com.bhanu.smsreader.models;

public class DeviceTokenRequest {
    private String deviceName;
    private String androidVersion;
    private String appVersion;

    public DeviceTokenRequest(String deviceName, String androidVersion, String appVersion) {
        this.deviceName = deviceName;
        this.androidVersion = androidVersion;
        this.appVersion = appVersion;
    }
}

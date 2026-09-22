package com.bhanu.smsreader.models;

public class DeviceSyncStatusRequest {
    private String syncStatus;

    public DeviceSyncStatusRequest(String syncStatus) {
        this.syncStatus = syncStatus;
    }

    public String getSyncStatus() {
        return syncStatus;
    }

    public void setSyncStatus(String syncStatus) {
        this.syncStatus = syncStatus;
    }
}

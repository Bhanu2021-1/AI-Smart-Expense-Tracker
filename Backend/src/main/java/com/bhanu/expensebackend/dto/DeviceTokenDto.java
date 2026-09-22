package com.bhanu.expensebackend.dto;

import com.bhanu.expensebackend.entity.DeviceToken.SyncStatus;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class DeviceTokenDto {
    private Long id;
    private String deviceName;
    private String androidVersion;
    private String appVersion;
    private SyncStatus syncStatus;
    private Instant createdAt;
    private Instant lastUsed;
    private Instant lastSync;
}

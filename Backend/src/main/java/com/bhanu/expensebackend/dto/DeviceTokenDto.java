package com.bhanu.expensebackend.dto;

import com.bhanu.expensebackend.entity.DeviceToken.SyncStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class DeviceTokenDto {
    private Long id;
    private String deviceName;
    private String androidVersion;
    private String appVersion;
    private SyncStatus syncStatus;
    private LocalDateTime createdAt;
    private LocalDateTime lastUsed;
    private LocalDateTime lastSync;
}

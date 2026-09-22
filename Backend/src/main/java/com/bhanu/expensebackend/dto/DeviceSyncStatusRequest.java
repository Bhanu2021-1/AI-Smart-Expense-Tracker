package com.bhanu.expensebackend.dto;

import com.bhanu.expensebackend.entity.DeviceToken.SyncStatus;
import lombok.Data;

@Data
public class DeviceSyncStatusRequest {
    private SyncStatus syncStatus;
}

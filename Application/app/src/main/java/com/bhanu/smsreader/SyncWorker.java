package com.bhanu.smsreader;

import android.content.Context;
import android.database.Cursor;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

import com.bhanu.smsreader.api.AuthApi;
import com.bhanu.smsreader.api.ExpenseApi;
import com.bhanu.smsreader.api.RetrofitClient;
import com.bhanu.smsreader.auth.SessionManager;
import com.bhanu.smsreader.models.ExpenseDto;
import com.bhanu.smsreader.models.SyncStatusRequest;

import java.math.BigDecimal;

import retrofit2.Response;

public class SyncWorker extends Worker {

    private static final String TAG = "SyncWorker";
    private DatabaseHelper dbHelper;
    private ExpenseApi expenseApi;
    private AuthApi authApi;
    private SessionManager sessionManager;

    public SyncWorker(@NonNull Context context, @NonNull WorkerParameters workerParams) {
        super(context, workerParams);
        try {
            dbHelper = new DatabaseHelper(context);
            expenseApi = RetrofitClient.getClient(context).create(ExpenseApi.class);
            authApi = RetrofitClient.getClient(context).create(AuthApi.class);
            sessionManager = SessionManager.getInstance(context);
        } catch (Exception e) {
            android.util.Log.e("SYNC_DEBUG", "SyncWorker constructor crashed", e);
        }
    }

    @NonNull
    @Override
    public Result doWork() {
        try {
            android.util.Log.d("SYNC_DEBUG", "SyncWorker.doWork() ENTERED");
            android.util.Log.d("SYNC_DEBUG", "worker started");
            
            if (dbHelper == null || expenseApi == null || sessionManager == null) {
                android.util.Log.e("SYNC_DEBUG", "SyncWorker dependencies not initialized. Aborting.");
                return Result.failure();
            }

            String loadedDeviceToken = sessionManager.getDeviceToken();
            String loadedJwt = sessionManager.getJwt();
            android.util.Log.d("DEVICE_AUTH_DEBUG", "device token available = " + (loadedDeviceToken != null && !loadedDeviceToken.isEmpty()));
            android.util.Log.d("DEVICE_AUTH_DEBUG", "auth header source = " + (loadedDeviceToken != null && !loadedDeviceToken.isEmpty() ? "DEVICE_TOKEN" : (loadedJwt != null && !loadedJwt.isEmpty() ? "JWT" : "NONE")));
            android.util.Log.d("SYNC_DEBUG", "device id available to worker = " + sessionManager.getDeviceId());

            // If not authenticated, fail
            if (loadedDeviceToken == null && loadedJwt == null) {
                android.util.Log.e("SYNC_DEBUG", "No authentication token found. Aborting sync.");
                return Result.failure();
            }

            Cursor cursor = dbHelper.getPendingExpenses();
            boolean allSuccess = true;
            boolean atLeastOneSuccess = false;

            int count = (cursor != null) ? cursor.getCount() : 0;
            android.util.Log.d("SYNC_DEBUG", "pending expense count = " + count);

            if (cursor != null && cursor.moveToFirst()) {
                do {
                    long id = cursor.getLong(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_ID));
                    android.util.Log.d("SYNC_DEBUG", "processing expense id = " + id);
                    
                    String amount = cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_AMOUNT));
                    String note = cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_NOTE));
                    String merchant = cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_MERCHANT));
                    String category = cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_CATEGORY));
                    String smsHash = cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_SMS_HASH));
                    String date = cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_DATE));
                    String transactionType = cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_TRANSACTION_TYPE));

                    ExpenseDto dto = new ExpenseDto(
                            new BigDecimal(amount),
                            note,
                            category,
                            merchant,
                            "SMS",
                            smsHash,
                            date,
                            transactionType
                    );

                    try {
                        android.util.Log.d("SYNC_DEBUG", "API request started");
                        Response<ExpenseDto> response = expenseApi.createExpense(dto).execute();
                        android.util.Log.d("SYNC_DEBUG", "API response code = " + response.code());
                        
                        if (response.isSuccessful() || response.code() == 409) {
                            // 409 means it was already synced (idempotent success)
                            dbHelper.updateSyncStatus(id, "SYNCED");
                            android.util.Log.d("SYNC_DEBUG", "expense synced successfully");
                            atLeastOneSuccess = true;
                        } else if (response.code() == 401 || response.code() == 403) {
                            android.util.Log.e("SYNC_DEBUG", "Authentication failed. Device token revoked or invalid.");
                            
                            String jwt = sessionManager.getJwt();
                            if (jwt != null && !jwt.isEmpty()) {
                                android.util.Log.d("SYNC_DEBUG", "Attempting silent re-pair using JWT");
                                // Temporarily remove device token so interceptor uses JWT
                                sessionManager.saveDeviceToken(null);
                                
                                com.bhanu.smsreader.models.DeviceTokenRequest repairReq = new com.bhanu.smsreader.models.DeviceTokenRequest(
                                    android.os.Build.MODEL,
                                    android.os.Build.VERSION.RELEASE,
                                    "1.0"
                                );
                                
                                retrofit2.Response<com.bhanu.smsreader.models.DeviceTokenResponse> repairRes = authApi.issueDeviceToken(repairReq).execute();
                                if (repairRes.isSuccessful() && repairRes.body() != null) {
                                    android.util.Log.d("SYNC_DEBUG", "Silent re-pair successful");
                                    sessionManager.saveDeviceToken(repairRes.body().getToken());
                                    if (repairRes.body().getId() != null) {
                                        android.util.Log.d("DEVICE_AUTH_DEBUG", "new device id from silent re-pair = " + repairRes.body().getId());
                                        sessionManager.saveDeviceId(repairRes.body().getId());
                                        android.util.Log.d("DEVICE_AUTH_DEBUG", "new device id read-back = " + sessionManager.getDeviceId());
                                    }
                                    
                                    // Retry the expense sync
                                    android.util.Log.d("SYNC_DEBUG", "API request started");
                                    response = expenseApi.createExpense(dto).execute();
                                    android.util.Log.d("SYNC_DEBUG", "API response code = " + response.code());
                                    
                                    if (response.isSuccessful() || response.code() == 409) {
                                        dbHelper.updateSyncStatus(id, "SYNCED");
                                        android.util.Log.d("SYNC_DEBUG", "expense synced successfully");
                                        atLeastOneSuccess = true;
                                        continue;
                                    }
                                } else {
                                    android.util.Log.e("SYNC_DEBUG", "Silent re-pair failed: " + repairRes.code());
                                }
                            }
                            
                            android.util.Log.e("SYNC_DEBUG", "Permanent auth failure. Needs explicit login.");
                            sessionManager.clearSession();
                            return Result.failure(); // Permanent failure
                        } else {
                            android.util.Log.e("SYNC_DEBUG", "Failed to sync expense: " + response.code());
                            allSuccess = false;
                        }
                    } catch (Exception e) {
                        android.util.Log.e("SYNC_DEBUG", "Network error syncing expense: " + e.getMessage());
                        allSuccess = false;
                    }
                } while (cursor.moveToNext());
                cursor.close();
            }

            android.util.Log.d("SYNC_DEBUG", "atLeastOneSuccess = " + atLeastOneSuccess);
            android.util.Log.d("SYNC_DEBUG", "attempting device status update");

            if (atLeastOneSuccess) {
                Long deviceId = sessionManager.getDeviceId();
                if (deviceId != null) {
                    android.util.Log.d("SYNC_DEBUG", "stored device id = " + deviceId);
                    try {
                        android.util.Log.d("SYNC_DEBUG", "device sync-status update started");
                        
                        com.bhanu.smsreader.models.DeviceSyncStatusRequest req = new com.bhanu.smsreader.models.DeviceSyncStatusRequest("SYNCED");
                        retrofit2.Response<Void> statusResponse = authApi.updateSyncStatus(deviceId, req).execute();
                        
                        android.util.Log.d("SYNC_DEBUG", "device sync-status response = " + statusResponse.code());
                        if (statusResponse.isSuccessful()) {
                            android.util.Log.d("SYNC_DEBUG", "device sync-status updated successfully");
                        } else {
                            android.util.Log.d("SYNC_DEBUG", "device sync-status update failed = " + statusResponse.message());
                        }
                    } catch (Exception e) {
                        android.util.Log.d("SYNC_DEBUG", "device sync-status update exception");
                        e.printStackTrace();
                    }
                } else {
                    android.util.Log.d("SYNC_DEBUG", "device id missing; cannot update sync status");
                }
            }

            android.util.Log.d("SYNC_DEBUG", "SyncWorker finished");

            if (allSuccess) {
                return Result.success();
            } else {
                return Result.retry();
            }
        } catch (Exception e) {
            android.util.Log.e("SYNC_DEBUG", "SyncWorker failed", e);
            return Result.failure();
        }
    }
}

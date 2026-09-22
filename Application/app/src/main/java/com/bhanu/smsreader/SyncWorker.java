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
    private final DatabaseHelper dbHelper;
    private final ExpenseApi expenseApi;
    private final AuthApi authApi;
    private final SessionManager sessionManager;

    public SyncWorker(@NonNull Context context, @NonNull WorkerParameters workerParams) {
        super(context, workerParams);
        dbHelper = new DatabaseHelper(context);
        expenseApi = RetrofitClient.getClient(context).create(ExpenseApi.class);
        authApi = RetrofitClient.getClient(context).create(AuthApi.class);
        sessionManager = new SessionManager(context);
    }

    @NonNull
    @Override
    public Result doWork() {
        Log.d(TAG, "Starting sync work...");
        
        // If not authenticated, fail
        if (sessionManager.getDeviceToken() == null && sessionManager.getJwt() == null) {
            Log.e(TAG, "No authentication token found. Aborting sync.");
            return Result.failure();
        }

        Cursor cursor = dbHelper.getPendingExpenses();
        boolean allSuccess = true;

        if (cursor != null && cursor.moveToFirst()) {
            do {
                long id = cursor.getLong(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_ID));
                String amount = cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_AMOUNT));
                String note = cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_NOTE));
                String merchant = cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_MERCHANT));
                String category = cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_CATEGORY));
                String smsHash = cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_SMS_HASH));
                String date = cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_DATE));

                ExpenseDto dto = new ExpenseDto(
                        new BigDecimal(amount),
                        note,
                        category,
                        merchant,
                        "SMS",
                        smsHash,
                        date
                );

                try {
                    Response<ExpenseDto> response = expenseApi.createExpense(dto).execute();
                    if (response.isSuccessful() || response.code() == 409) {
                        // 409 means it was already synced (idempotent success)
                        dbHelper.updateSyncStatus(id, "SYNCED");
                        Log.d(TAG, "Successfully synced expense: " + id);
                    } else if (response.code() == 401 || response.code() == 403) {
                        Log.e(TAG, "Authentication failed. Device token revoked or invalid.");
                        sessionManager.clearSession();
                        return Result.failure(); // Permanent failure
                    } else {
                        Log.e(TAG, "Failed to sync expense: " + response.code());
                        allSuccess = false;
                    }
                } catch (Exception e) {
                    Log.e(TAG, "Network error syncing expense: " + e.getMessage());
                    allSuccess = false;
                }
            } while (cursor.moveToNext());
            cursor.close();
        }

        // Notify backend of last sync status if successful
        // NOTE: Actually we don't have device ID locally, but we can do it if needed. 
        // For now, the user uses JWT or device token. If we need to send PATCH, we need the device ID.
        // Wait, if we use the Device Token as Auth, the backend can extract it! 
        // But our PATCH endpoint requires {id}. We should probably change the PATCH endpoint to infer ID from the token,
        // or just let the backend update lastSync implicitly when validating the token.
        // In AuthService.java, we updated `validateDeviceToken` to update `lastUsed`.
        
        if (allSuccess) {
            return Result.success();
        } else {
            return Result.retry();
        }
    }
}

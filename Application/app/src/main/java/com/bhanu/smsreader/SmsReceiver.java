package com.bhanu.smsreader;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.provider.Telephony;
import android.telephony.SmsMessage;
import android.util.Log;

import androidx.work.Constraints;
import androidx.work.NetworkType;
import androidx.work.OneTimeWorkRequest;
import androidx.work.WorkManager;

import java.time.Instant;

public class SmsReceiver extends BroadcastReceiver {
    
    private static final String TAG = "SmsReceiver";

    @Override
    public void onReceive(Context context, Intent intent) {
        Log.d("SMS_DEBUG", "SmsReceiver.onReceive() ENTERED");
        Log.d("SMS_DEBUG", "action = " + (intent != null ? intent.getAction() : "null"));

        try {
            if (intent == null || intent.getAction() == null) {
                return;
            }
            
            SmsMessage[] messages = Telephony.Sms.Intents.getMessagesFromIntent(intent);
            Log.d("SMS_DEBUG", "SMS message count = " + (messages != null ? messages.length : 0));
            
            if (messages == null) return;

            for (SmsMessage msg : messages) {
                if (msg == null) continue;
                
                String messageBody = msg.getMessageBody();
                String sender = msg.getOriginatingAddress();
                long timestamp = msg.getTimestampMillis();

                Log.d("SMS_DEBUG", "sender = " + sender);
                Log.d("SMS_DEBUG", "body = " + messageBody);

                SmsParser.ParsedSms parsed = SmsParser.parse(messageBody, sender, timestamp);
                
                if (parsed != null) {
                    Log.d("SMS_DEBUG", "debit detected = true");
                    Log.d("SMS_DEBUG", "parsed amount = " + parsed.amount);
                    Log.d("SMS_DEBUG", "hash = " + parsed.smsHash);
                    
                    DatabaseHelper db = new DatabaseHelper(context);
                    
                    boolean isDuplicate = db.isSmsDuplicate(parsed.smsHash);
                    Log.d("SMS_DEBUG", "local duplicate check = " + isDuplicate);

                    if (isDuplicate) {
                        Log.d("SMS_DEBUG", "Duplicate SMS ignored. Hash: " + parsed.smsHash);
                        continue;
                    }
                    
                    // Save to local database as PENDING
                    String isoDate = null;
                    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                        isoDate = Instant.ofEpochMilli(timestamp).toString();
                    } else {
                        isoDate = new java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", java.util.Locale.US)
                            .format(new java.util.Date(timestamp));
                    }

                    long id = db.insertExpense(
                            parsed.amount, 
                            "Bank Debit via SMS", 
                            parsed.merchant, 
                            parsed.category, 
                            parsed.smsHash, 
                            isoDate, 
                            "PENDING",
                            parsed.transactionType
                    );
                    
                    Log.d("SMS_DEBUG", "local expense saved = " + (id != -1));
                    
                    // Enqueue background sync work
                    enqueueSync(context);
                } else {
                    Log.d("SMS_DEBUG", "debit detected = false");
                }
            }
        } catch (Exception e) {
            Log.e("SMS_DEBUG", "SmsReceiver failed", e);
        }
    }

    private void enqueueSync(Context context) {
        try {
            Log.d("SMS_DEBUG", "scheduling sync worker");
            Constraints constraints = new Constraints.Builder()
                    .setRequiredNetworkType(NetworkType.CONNECTED)
                    .build();

            OneTimeWorkRequest syncWork = new OneTimeWorkRequest.Builder(SyncWorker.class)
                    .setConstraints(constraints)
                    .build();

            WorkManager workManager = WorkManager.getInstance(context);
            workManager.enqueueUniqueWork("SMS_SYNC_WORK", androidx.work.ExistingWorkPolicy.REPLACE, syncWork);
            
            Log.d("SMS_DEBUG", "sync worker enqueued. Work ID = " + syncWork.getId());
            
            // Debug check of the actual state immediately after enqueue
            androidx.work.WorkInfo info = workManager.getWorkInfoById(syncWork.getId()).get();
            if (info != null) {
                Log.d("SMS_DEBUG", "Work state immediately after enqueue: " + info.getState());
            } else {
                Log.d("SMS_DEBUG", "Work state: NULL");
            }

        } catch (Exception e) {
            Log.e("SMS_DEBUG", "Failed to enqueue sync worker", e);
        }
    }
}
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
        Log.d(TAG, "Receiver Triggered");

        for (SmsMessage msg : Telephony.Sms.Intents.getMessagesFromIntent(intent)) {
            String messageBody = msg.getMessageBody();
            String sender = msg.getOriginatingAddress();
            long timestamp = msg.getTimestampMillis();

            Log.d(TAG, "Sender: " + sender);
            Log.d(TAG, "Message: " + messageBody);

            SmsParser.ParsedSms parsed = SmsParser.parse(messageBody, sender, timestamp);
            
            if (parsed != null) {
                Log.d(TAG, "💰 DEBIT DETECTED! Amount: ₹" + parsed.amount + " Merchant: " + parsed.merchant);
                
                DatabaseHelper db = new DatabaseHelper(context);
                
                if (db.isSmsDuplicate(parsed.smsHash)) {
                    Log.d(TAG, "Duplicate SMS ignored. Hash: " + parsed.smsHash);
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

                db.insertExpense(
                        parsed.amount, 
                        "Bank Debit via SMS", 
                        parsed.merchant, 
                        parsed.category, 
                        parsed.smsHash, 
                        isoDate, 
                        "PENDING"
                );
                
                // Enqueue background sync work
                enqueueSync(context);
            }
        }
    }

    private void enqueueSync(Context context) {
        Constraints constraints = new Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build();

        OneTimeWorkRequest syncWork = new OneTimeWorkRequest.Builder(SyncWorker.class)
                .setConstraints(constraints)
                .build();

        WorkManager.getInstance(context).enqueue(syncWork);
        Log.d(TAG, "Sync work enqueued");
    }
}
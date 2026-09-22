package com.bhanu.smsreader;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.provider.Telephony;
import android.telephony.SmsMessage;
import android.util.Log;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class SmsReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        Log.d("SMS_DEBUG", "Receiver Triggered");

        for (SmsMessage msg : Telephony.Sms.Intents.getMessagesFromIntent(intent)) {

            String messageBody = msg.getMessageBody();
            String sender = msg.getOriginatingAddress();

            Log.d("SMS_DEBUG", "Sender: " + sender);
            Log.d("SMS_DEBUG", "Message: " + messageBody);

            if (messageBody != null &&
                    (messageBody.toLowerCase().contains("debit")
                            || messageBody.toLowerCase().contains("debited"))) {

                Log.d("SMS_DEBUG", "💰 DEBIT MESSAGE DETECTED!");

                extractAmount(context, messageBody);
            }
        }
    }

    private void extractAmount(Context context, String body) {



        // Universal Indian bank SMS pattern
        Pattern pattern = Pattern.compile(
                "(?:Rs\\.?|INR)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:rs|/-)?",
                Pattern.CASE_INSENSITIVE
        );

        Matcher matcher = pattern.matcher(body);

        if (matcher.find()) {

            String amount = matcher.group(1);
            amount = amount.replace(",", "");

            Log.d("SMS_DEBUG", "💵 Amount Found: ₹" + amount);
            sendToServer(amount);

            try {
                DatabaseHelper db = new DatabaseHelper(context);
                db.insertExpense(amount, "Bank Debit");
                Log.d("SMS_DEBUG", "Saved to DB Successfully");
            } catch (Exception e) {
                Log.d("SMS_DEBUG", "DB Error: " + e.getMessage());
            }

        } else {
            Log.d("SMS_DEBUG", "No Amount Found");
        }

    }

    private void sendToServer(String amount) {

        new Thread(() -> {
            OkHttpClient client = new OkHttpClient.Builder()
                    .connectTimeout(30, java.util.concurrent.TimeUnit.SECONDS)
                    .readTimeout(30, java.util.concurrent.TimeUnit.SECONDS)
                    .writeTimeout(30, java.util.concurrent.TimeUnit.SECONDS)
                    .build();

            try {
                MediaType JSON =
                        MediaType.parse("application/json; charset=utf-8");

                String json = "{ \"amount\": " + amount +
                        ", \"note\": \"Bank Debit\", " +
                        "\"category\": \"Other\" }";

                Log.d("API_DEBUG", "Sending: " + json);

                RequestBody requestBody =
                        RequestBody.create(json, JSON);

                Request request = new Request.Builder()
                        .url("https://expensebackend-nzy9.onrender.com/api/expenses")
                        .post(requestBody)
                        .build();

                Response response = client.newCall(request).execute();

                Log.d("API_DEBUG", "HTTP CODE: " + response.code());

                if (response.body() != null) {
                    Log.d("API_DEBUG", "Response: " + response.body().string());
                }

            } catch (Exception e) {
                Log.e("API_DEBUG", "API ERROR: " + e.getClass().getSimpleName()
                        + " - " + e.getMessage());
            }
        }).start();
    }
}
package com.bhanu.smsreader;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.bhanu.smsreader.auth.SessionManager;

public class MainActivity extends AppCompatActivity {

    private static final int SMS_PERMISSION_CODE = 101;
    private SessionManager sessionManager;

    private TextView tvStatus;
    private Button btnLogout;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Initialize auth API and session
        sessionManager = SessionManager.getInstance(this);
        if (sessionManager.getDeviceToken() == null) {
            startActivity(new Intent(this, LoginActivity.class));
            finish();
            return;
        }

        setContentView(R.layout.activity_main);

        tvStatus = findViewById(R.id.tvStatus);
        btnLogout = findViewById(R.id.btnLogout);

        tvStatus.setText("Device Paired & Listening for SMS\n\nUser: " + sessionManager.getUserName());

        btnLogout.setOnClickListener(v -> {
            sessionManager.clearSession();
            Toast.makeText(this, "Logged out", Toast.LENGTH_SHORT).show();
            startActivity(new Intent(this, LoginActivity.class));
            finish();
        });

        requestSmsPermission();
    }

    private void requestSmsPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            int permissionCheck = ContextCompat.checkSelfPermission(this, Manifest.permission.RECEIVE_SMS);
            if (permissionCheck != PackageManager.PERMISSION_GRANTED) {
                android.util.Log.d("SMS_DEBUG", "RECEIVE_SMS permission = DENIED (Requesting now)");
                ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.RECEIVE_SMS}, SMS_PERMISSION_CODE);
            } else {
                android.util.Log.d("SMS_DEBUG", "RECEIVE_SMS permission = GRANTED");
            }
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == SMS_PERMISSION_CODE && grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
            android.util.Log.d("SMS_DEBUG", "RECEIVE_SMS permission = GRANTED (After prompt)");
            Toast.makeText(this, "SMS Permission Granted", Toast.LENGTH_SHORT).show();
        } else {
            android.util.Log.d("SMS_DEBUG", "RECEIVE_SMS permission = DENIED (After prompt)");
            Toast.makeText(this, "SMS Permission is required to sync expenses", Toast.LENGTH_LONG).show();
        }
    }
}
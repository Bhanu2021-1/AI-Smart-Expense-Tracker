package com.bhanu.smsreader;

import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.bhanu.smsreader.api.AuthApi;
import com.bhanu.smsreader.api.RetrofitClient;
import com.bhanu.smsreader.auth.SessionManager;
import com.bhanu.smsreader.models.AuthResponse;
import com.bhanu.smsreader.models.DeviceTokenRequest;
import com.bhanu.smsreader.models.DeviceTokenResponse;
import com.bhanu.smsreader.models.LoginRequest;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class LoginActivity extends AppCompatActivity {

    private EditText etEmail, etPassword;
    private Button btnLogin;
    private SessionManager sessionManager;
    private AuthApi authApi;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        sessionManager = new SessionManager(this);
        // If already paired with device token, go straight to main
        if (sessionManager.getDeviceToken() != null) {
            startActivity(new Intent(this, MainActivity.class));
            finish();
            return;
        }

        setContentView(R.layout.activity_login);

        etEmail = findViewById(R.id.etEmail);
        etPassword = findViewById(R.id.etPassword);
        btnLogin = findViewById(R.id.btnLogin);
        authApi = RetrofitClient.getClient(this).create(AuthApi.class);

        btnLogin.setOnClickListener(v -> attemptLogin());
    }

    private void attemptLogin() {
        String email = etEmail.getText().toString().trim();
        String password = etPassword.getText().toString().trim();

        if (email.isEmpty() || password.isEmpty()) {
            Toast.makeText(this, "Please fill in all fields", Toast.LENGTH_SHORT).show();
            return;
        }

        btnLogin.setEnabled(false);
        btnLogin.setText("Authenticating...");

        authApi.login(new LoginRequest(email, password)).enqueue(new Callback<AuthResponse>() {
            @Override
            public void onResponse(Call<AuthResponse> call, Response<AuthResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    // Temporarily save JWT so we can issue a Device Token
                    sessionManager.saveJwt(response.body().getToken());
                    sessionManager.saveUserName(response.body().getName());
                    issueDeviceToken();
                } else {
                    btnLogin.setEnabled(true);
                    btnLogin.setText("Login");
                    Toast.makeText(LoginActivity.this, "Invalid credentials", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<AuthResponse> call, Throwable t) {
                btnLogin.setEnabled(true);
                btnLogin.setText("Login");
                Toast.makeText(LoginActivity.this, "Network error", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void issueDeviceToken() {
        btnLogin.setText("Pairing Device...");
        
        String deviceName = Build.MANUFACTURER + " " + Build.MODEL;
        String androidVer = Build.VERSION.RELEASE;
        String appVer = "1.0"; // Should get from BuildConfig

        DeviceTokenRequest request = new DeviceTokenRequest(deviceName, androidVer, appVer);

        authApi.issueDeviceToken(request).enqueue(new Callback<DeviceTokenResponse>() {
            @Override
            public void onResponse(Call<DeviceTokenResponse> call, Response<DeviceTokenResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    sessionManager.saveDeviceToken(response.body().getToken());
                    // We can optionally clear the JWT, since the Android app primarily uses the Device Token for syncing
                    sessionManager.saveJwt(null);

                    Toast.makeText(LoginActivity.this, "Device Paired Successfully", Toast.LENGTH_SHORT).show();
                    startActivity(new Intent(LoginActivity.this, MainActivity.class));
                    finish();
                } else {
                    handlePairingError();
                }
            }

            @Override
            public void onFailure(Call<DeviceTokenResponse> call, Throwable t) {
                handlePairingError();
            }
        });
    }

    private void handlePairingError() {
        btnLogin.setEnabled(true);
        btnLogin.setText("Login");
        sessionManager.clearSession();
        Toast.makeText(LoginActivity.this, "Failed to pair device", Toast.LENGTH_SHORT).show();
    }
}

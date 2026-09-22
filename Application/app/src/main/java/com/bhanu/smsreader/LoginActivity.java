package com.bhanu.smsreader;

import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
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

import java.io.IOException;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class LoginActivity extends AppCompatActivity {

    private static final String TAG = "AUTH_DEBUG";

    private EditText etEmail, etPassword;
    private Button btnLogin;
    private SessionManager sessionManager;
    private AuthApi authApi;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        sessionManager = SessionManager.getInstance(this);

        // If already paired with device token, go straight to MainActivity
        if (sessionManager.getDeviceToken() != null &&
                !sessionManager.getDeviceToken().isEmpty()) {

            Log.d(TAG, "Existing device token found. Opening MainActivity.");

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

            Toast.makeText(
                    this,
                    "Please fill in all fields",
                    Toast.LENGTH_SHORT
            ).show();

            return;
        }

        btnLogin.setEnabled(false);
        btnLogin.setText("Authenticating...");

        Log.d(TAG, "Starting login request for email: " + email);

        LoginRequest loginRequest = new LoginRequest(email, password);

        authApi.login(loginRequest).enqueue(new Callback<AuthResponse>() {

            @Override
            public void onResponse(
                    Call<AuthResponse> call,
                    Response<AuthResponse> response
            ) {

                Log.d(TAG, "Login HTTP code: " + response.code());

                if (response.isSuccessful() && response.body() != null) {

                    AuthResponse authResponse = response.body();

                    Log.d(
                            TAG,
                            "Login successful. User ID: "
                                    + authResponse.getUserId()
                                    + ", Name: "
                                    + authResponse.getName()
                    );

                    // Save JWT temporarily for device-token pairing
                    sessionManager.saveJwt(authResponse.getToken());
                    sessionManager.saveUserName(authResponse.getName());

                    issueDeviceToken();

                } else {

                    String errorBody = readErrorBody(response);

                    Log.e(
                            TAG,
                            "Login failed. HTTP "
                                    + response.code()
                                    + " | "
                                    + errorBody
                    );

                    btnLogin.setEnabled(true);
                    btnLogin.setText("Login");

                    String message;

                    if (response.code() == 401) {
                        message = "Invalid email or password";
                    } else if (response.code() == 400) {
                        message = "Invalid login request";
                    } else if (response.code() == 403) {
                        message = "Access denied";
                    } else {
                        message = "Login failed (" + response.code() + ")";
                    }

                    Toast.makeText(
                            LoginActivity.this,
                            message,
                            Toast.LENGTH_LONG
                    ).show();
                }
            }

            @Override
            public void onFailure(
                    Call<AuthResponse> call,
                    Throwable t
            ) {

                Log.e(
                        TAG,
                        "Login request failed: "
                                + t.getClass().getName()
                                + " | "
                                + t.getMessage(),
                        t
                );

                btnLogin.setEnabled(true);
                btnLogin.setText("Login");

                String message;

                if (t instanceof java.net.SocketTimeoutException) {
                    message = "Connection timed out. Please try again.";
                } else if (t instanceof java.net.UnknownHostException) {
                    message = "Unable to reach server.";
                } else if (t instanceof java.net.ConnectException) {
                    message = "Could not connect to server.";
                } else if (t instanceof javax.net.ssl.SSLException) {
                    message = "Secure connection failed.";
                } else {
                    message = "Network error: "
                            + t.getClass().getSimpleName();
                }

                Toast.makeText(
                        LoginActivity.this,
                        message,
                        Toast.LENGTH_LONG
                ).show();
            }
        });
    }

    private void issueDeviceToken() {

        btnLogin.setEnabled(false);
        btnLogin.setText("Pairing Device...");

        String deviceName =
                Build.MANUFACTURER + " " + Build.MODEL;

        String androidVer =
                Build.VERSION.RELEASE;

        String appVer = "1.0";

        Log.d(TAG, "Starting device pairing...");
        Log.d(TAG, "Device: " + deviceName);
        Log.d(TAG, "Android: " + androidVer);

        DeviceTokenRequest request =
                new DeviceTokenRequest(
                        deviceName,
                        androidVer,
                        appVer
                );

        authApi.issueDeviceToken(request).enqueue(
                new Callback<DeviceTokenResponse>() {

                    @Override
                    public void onResponse(
                            Call<DeviceTokenResponse> call,
                            Response<DeviceTokenResponse> response
                    ) {

                        Log.d(
                                TAG,
                                "Device pairing HTTP code: "
                                        + response.code()
                        );

                        if (response.isSuccessful()
                                && response.body() != null) {

                            DeviceTokenResponse tokenResponse =
                                    response.body();

                            Log.d(
                                    TAG,
                                    "Device pairing successful."
                            );

                            // Save the device token securely
                            String rawToken = tokenResponse.getToken();
                            android.util.Log.d("DEVICE_AUTH_DEBUG", "device token received = " + (rawToken != null));
                            if (rawToken != null) {
                                android.util.Log.d("DEVICE_AUTH_DEBUG", "token length = " + rawToken.length());
                            }
                            
                            sessionManager.saveDeviceToken(rawToken);
                            android.util.Log.d("DEVICE_AUTH_DEBUG", "token saved = true");

                            String readBack = sessionManager.getDeviceToken();
                            android.util.Log.d("DEVICE_AUTH_DEBUG", "token read-back available = " + (readBack != null));
                            if (readBack != null) {
                                android.util.Log.d("DEVICE_AUTH_DEBUG", "token read-back length = " + readBack.length());
                            }

                            // We keep the JWT saved so SyncWorker can use it for silent re-pairing if the device token gets revoked

                            Toast.makeText(
                                    LoginActivity.this,
                                    "Device Paired Successfully",
                                    Toast.LENGTH_SHORT
                            ).show();

                            startActivity(
                                    new Intent(
                                            LoginActivity.this,
                                            MainActivity.class
                                    )
                            );

                            finish();

                        } else {

                            String errorBody =
                                    readErrorBody(response);

                            Log.e(
                                    TAG,
                                    "Device pairing failed. HTTP "
                                            + response.code()
                                            + " | "
                                            + errorBody
                            );

                            handlePairingError(
                                    "Pairing failed (" + response.code() + ")"
                            );
                        }
                    }

                    @Override
                    public void onFailure(
                            Call<DeviceTokenResponse> call,
                            Throwable t
                    ) {

                        Log.e(
                                TAG,
                                "Device pairing request failed: "
                                        + t.getClass().getName()
                                        + " | "
                                        + t.getMessage(),
                                t
                        );

                        handlePairingError(
                                "Pairing network error: "
                                        + t.getClass().getSimpleName()
                        );
                    }
                }
        );
    }

    private void handlePairingError(String message) {

        btnLogin.setEnabled(true);
        btnLogin.setText("Login");

        sessionManager.clearSession();

        Toast.makeText(
                LoginActivity.this,
                message,
                Toast.LENGTH_LONG
        ).show();
    }

    private String readErrorBody(Response<?> response) {

        if (response.errorBody() == null) {
            return "No error body";
        }

        try {
            return response.errorBody().string();
        } catch (IOException e) {
            return "Unable to read error body: "
                    + e.getMessage();
        }
    }
}
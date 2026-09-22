package com.bhanu.smsreader.auth;

import android.content.Context;
import android.content.SharedPreferences;

import androidx.security.crypto.EncryptedSharedPreferences;
import androidx.security.crypto.MasterKey;

import java.io.IOException;
import java.security.GeneralSecurityException;

public class SessionManager {

    private static final String PREF_NAME = "secure_prefs";
    private static final String KEY_JWT = "jwt_token";
    private static final String KEY_DEVICE_TOKEN = "device_token";
    private static final String KEY_USER_NAME = "user_name";

    private static SessionManager instance;
    private final SharedPreferences sharedPreferences;

    private SessionManager(Context context) {
        try {
            MasterKey masterKey = new MasterKey.Builder(context)
                    .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
                    .build();

            sharedPreferences = EncryptedSharedPreferences.create(
                    context.getApplicationContext(),
                    PREF_NAME,
                    masterKey,
                    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
            );
        } catch (GeneralSecurityException | IOException e) {
            throw new RuntimeException("Could not initialize secure storage", e);
        }
    }

    public static synchronized SessionManager getInstance(Context context) {
        if (instance == null) {
            instance = new SessionManager(context.getApplicationContext());
        }
        return instance;
    }

    public void saveJwt(String jwt) {
        sharedPreferences.edit().putString(KEY_JWT, jwt).apply();
    }

    public String getJwt() {
        return sharedPreferences.getString(KEY_JWT, null);
    }

    public void saveDeviceToken(String deviceToken) {
        sharedPreferences.edit().putString(KEY_DEVICE_TOKEN, deviceToken).apply();
    }

    public String getDeviceToken() {
        return sharedPreferences.getString(KEY_DEVICE_TOKEN, null);
    }

    public void saveUserName(String name) {
        sharedPreferences.edit().putString(KEY_USER_NAME, name).apply();
    }

    public String getUserName() {
        return sharedPreferences.getString(KEY_USER_NAME, "User");
    }

    public void clearSession() {
        sharedPreferences.edit().clear().apply();
    }
}

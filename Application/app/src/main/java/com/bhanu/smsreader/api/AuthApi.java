package com.bhanu.smsreader.api;

import com.bhanu.smsreader.models.AuthResponse;
import com.bhanu.smsreader.models.DeviceTokenRequest;
import com.bhanu.smsreader.models.DeviceTokenResponse;
import com.bhanu.smsreader.models.LoginRequest;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.PATCH;
import retrofit2.http.POST;
import retrofit2.http.Path;

public interface AuthApi {

    @POST("auth/login")
    Call<AuthResponse> login(@Body LoginRequest request);

    @POST("auth/device-token")
    Call<DeviceTokenResponse> issueDeviceToken(@Body DeviceTokenRequest request);
    
    @PATCH("auth/devices/{id}/sync-status")
    Call<Void> updateSyncStatus(@Path("id") Long deviceId, @Body Object request);
}

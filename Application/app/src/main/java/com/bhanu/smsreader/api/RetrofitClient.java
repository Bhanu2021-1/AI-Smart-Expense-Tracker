package com.bhanu.smsreader.api;

import android.content.Context;

import com.bhanu.smsreader.auth.SessionManager;

import java.util.concurrent.TimeUnit;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class RetrofitClient {
    // Replace with your actual backend URL (or emulator localhost 10.0.2.2)
    private static final String BASE_URL = "https://expensebackend-nzy9.onrender.com/api/";
    private static Retrofit retrofit = null;

    public static Retrofit getClient(Context context) {
        if (retrofit == null) {
            SessionManager sessionManager = SessionManager.getInstance(context);

            OkHttpClient client = new OkHttpClient.Builder()
                    .connectTimeout(30, TimeUnit.SECONDS)
                    .readTimeout(30, TimeUnit.SECONDS)
                    .writeTimeout(30, TimeUnit.SECONDS)
                    .addInterceptor(chain -> {
                        Request original = chain.request();
                        Request.Builder requestBuilder = original.newBuilder();
                        
                        // Use Device Token if available, else JWT
                        String deviceToken = sessionManager.getDeviceToken();
                        String jwt = sessionManager.getJwt();
                        
                        if (deviceToken != null && !deviceToken.isEmpty()) {
                            android.util.Log.d("DEVICE_AUTH_DEBUG", "Authorization header source = DEVICE_TOKEN");
                            requestBuilder.header("Authorization", "Bearer " + deviceToken);
                        } else if (jwt != null && !jwt.isEmpty()) {
                            android.util.Log.d("DEVICE_AUTH_DEBUG", "Authorization header source = JWT");
                            requestBuilder.header("Authorization", "Bearer " + jwt);
                        } else {
                            android.util.Log.d("DEVICE_AUTH_DEBUG", "Authorization header source = NONE");
                        }

                        Request request = requestBuilder.build();
                        return chain.proceed(request);
                    })
                    .build();

            retrofit = new Retrofit.Builder()
                    .baseUrl(BASE_URL)
                    .addConverterFactory(GsonConverterFactory.create())
                    .client(client)
                    .build();
        }
        return retrofit;
    }
}

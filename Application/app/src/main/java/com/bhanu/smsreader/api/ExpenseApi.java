package com.bhanu.smsreader.api;

import com.bhanu.smsreader.models.ExpenseDto;

import java.util.List;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Query;

public interface ExpenseApi {

    @GET("expenses")
    Call<List<ExpenseDto>> getExpenses(@Query("category") String category);

    @POST("expenses")
    Call<ExpenseDto> createExpense(@Body ExpenseDto request);
}

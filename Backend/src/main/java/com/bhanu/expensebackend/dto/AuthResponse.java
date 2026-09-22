package com.bhanu.expensebackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String token;

    @Builder.Default
    private String tokenType = "Bearer";

    /** Token validity in seconds (not milliseconds). */
    private Long expiresIn;

    private String name;
    private String email;
    private Long userId;
}

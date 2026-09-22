package com.bhanu.expensebackend.dto;

import com.bhanu.expensebackend.entity.ExpenseSource;
import com.bhanu.expensebackend.entity.TransactionType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.Instant;

/**
 * Request body for creating or updating an expense.
 *
 * Validation (via @Valid) is applied on POST only.
 * PUT requests use this same DTO without @Valid, so all fields are effectively optional.
 *
 * BACKWARDS COMPATIBILITY:
 * The Android app currently sends: { "amount": X, "note": "...", "category": "..." }
 * All extra fields (merchant, smsHash, source, referenceId) are optional.
 */
@Data
public class ExpenseRequest {

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be greater than 0")
    private Double amount;

    private String note;

    private String category;

    /** Merchant name extracted from SMS — never invent this value. */
    private String merchant;

    /** MANUAL or SMS. Defaults to MANUAL if not provided. */
    private ExpenseSource source;

    /**
     * SHA-256 fingerprint of the originating SMS body.
     * Used for server-side idempotency — prevents duplicate expenses.
     * Only set by the Android app; null for manually-created expenses.
     */
    private String smsHash;

    /** Bank/UPI reference number parsed from the SMS, if available. */
    private String referenceId;

    /** Transaction direction: DEBIT or CREDIT */
    private TransactionType transactionType;

    /**
     * Transaction timestamp.
     * If null, the server defaults to the current time (@PrePersist).
     */
    private Instant date;
}

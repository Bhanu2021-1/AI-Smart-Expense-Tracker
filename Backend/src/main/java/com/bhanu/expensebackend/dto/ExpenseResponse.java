package com.bhanu.expensebackend.dto;

import com.bhanu.expensebackend.entity.ExpenseSource;
import com.bhanu.expensebackend.entity.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * API response for a single expense.
 *
 * SECURITY: user_id is intentionally omitted from the response.
 * The client already knows which user they are — there is no reason to return it.
 *
 * BACKWARDS COMPATIBILITY:
 * id, amount, note, category, date are present in the same structure as before,
 * so the existing React frontend continues to work without modification.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseResponse {
    private Long id;
    private Double amount;
    private String note;
    private String category;
    private String merchant;
    private ExpenseSource source;
    private String referenceId;
    private TransactionType transactionType;
    private Instant date;
}

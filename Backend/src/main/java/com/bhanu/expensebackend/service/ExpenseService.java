package com.bhanu.expensebackend.service;

import com.bhanu.expensebackend.dto.ExpenseRequest;
import com.bhanu.expensebackend.dto.ExpenseResponse;
import com.bhanu.expensebackend.entity.Expense;
import com.bhanu.expensebackend.entity.ExpenseSource;
import com.bhanu.expensebackend.entity.User;
import com.bhanu.expensebackend.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Business logic for expense CRUD operations.
 *
 * SECURITY: Every method that reads, modifies, or deletes an expense verifies
 * ownership by requiring both the expense ID and the authenticated user's ID.
 * The user ID is ALWAYS sourced from the security context — never from the
 * client-supplied request body.
 *
 * IDEMPOTENCY: SMS-sourced expenses include a SHA-256 smsHash. If a request
 * arrives with a hash that already exists in the database, a 409 is returned
 * and no duplicate record is created.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;

    // Known categories for normalization
    private static final Set<String> KNOWN_CATEGORIES = Set.of(
            "food", "rent", "travel", "shopping", "bills"
    );

    // ─── Queries ───────────────────────────────────────────────────────────────

    /**
     * Returns all expenses for the authenticated user, newest first.
     * Optionally filtered by category and/or date range.
     *
     * Note: Date filtering is applied in-memory for Phase 1.
     * Phase 5 will replace this with a JPA Specification for efficiency.
     */
    public List<ExpenseResponse> getExpenses(Long userId, String category,
                                              LocalDateTime startDate, LocalDateTime endDate) {
        List<Expense> expenses;

        if (category != null && !category.isBlank()) {
            expenses = expenseRepository
                    .findAllByUserIdAndCategoryIgnoreCaseOrderByDateDesc(userId, category);
        } else {
            expenses = expenseRepository.findAllByUserIdOrderByDateDesc(userId);
        }

        return expenses.stream()
                .filter(e -> startDate == null || !e.getDate().isBefore(startDate))
                .filter(e -> endDate == null || !e.getDate().isAfter(endDate))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /** Returns a single expense, verifying it belongs to the authenticated user. */
    public ExpenseResponse getExpenseById(Long id, Long userId) {
        return toResponse(findOwned(id, userId));
    }

    // ─── Mutations ─────────────────────────────────────────────────────────────

    public ExpenseResponse createExpense(ExpenseRequest request, User user) {
        // Server-side idempotency check for SMS expenses
        if (request.getSmsHash() != null && !request.getSmsHash().isBlank()) {
            if (expenseRepository.existsBySmsHash(request.getSmsHash())) {
                log.warn("Duplicate SMS expense rejected: smsHash={}", request.getSmsHash());
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "This SMS transaction has already been recorded");
            }
        }

        Expense expense = new Expense();
        expense.setUser(user);
        expense.setAmount(request.getAmount());
        expense.setNote(request.getNote());
        expense.setCategory(normalizeCategory(request.getCategory()));
        expense.setMerchant(request.getMerchant());
        expense.setSource(request.getSource() != null ? request.getSource() : ExpenseSource.MANUAL);
        expense.setTransactionType(request.getTransactionType() != null ? request.getTransactionType() : com.bhanu.expensebackend.entity.TransactionType.DEBIT);
        expense.setSmsHash(request.getSmsHash());
        expense.setReferenceId(request.getReferenceId());
        if (request.getDate() != null) {
            expense.setDate(LocalDateTime.ofInstant(request.getDate(), ZoneOffset.UTC));
        }

        Expense saved = expenseRepository.save(expense);
        log.debug("Expense created: id={}, user={}, amount={}", saved.getId(), user.getId(), saved.getAmount());
        return toResponse(saved);
    }

    /**
     * Partial update — only non-null fields in the request are applied.
     * The source field is intentionally not updatable (it records how the expense was created).
     */
    public ExpenseResponse updateExpense(Long id, ExpenseRequest request, Long userId) {
        Expense expense = findOwned(id, userId);

        if (request.getAmount() != null)   expense.setAmount(request.getAmount());
        if (request.getNote() != null)     expense.setNote(request.getNote());
        if (request.getCategory() != null) expense.setCategory(normalizeCategory(request.getCategory()));
        if (request.getMerchant() != null) expense.setMerchant(request.getMerchant());
        if (request.getTransactionType() != null) expense.setTransactionType(request.getTransactionType());
        if (request.getDate() != null)     expense.setDate(LocalDateTime.ofInstant(request.getDate(), ZoneOffset.UTC));

        return toResponse(expenseRepository.save(expense));
    }

    public void deleteExpense(Long id, Long userId) {
        Expense expense = findOwned(id, userId);
        expenseRepository.delete(expense);
        log.debug("Expense deleted: id={}, user={}", id, userId);
    }

    // ─── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Fetches an expense and verifies ownership in one query.
     * Throws 404 whether the expense doesn't exist OR belongs to a different user —
     * this avoids leaking information about other users' expense IDs.
     */
    private Expense findOwned(Long id, Long userId) {
        return expenseRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Expense not found"));
    }

    /**
     * Normalizes a raw category string to one of the known categories.
     * Unknown or null values map to "Other".
     * This keeps category data consistent regardless of case from the client.
     */
    private String normalizeCategory(String category) {
        if (category == null || category.isBlank()) return "Other";
        String lower = category.trim().toLowerCase();
        if (!KNOWN_CATEGORIES.contains(lower)) return "Other";
        // Capitalize first letter
        return Character.toUpperCase(lower.charAt(0)) + lower.substring(1);
    }

    /** Maps a persisted Expense entity to the API response DTO. */
    public ExpenseResponse toResponse(Expense expense) {
        return ExpenseResponse.builder()
                .id(expense.getId())
                .amount(expense.getAmount())
                .note(expense.getNote())
                .category(expense.getCategory())
                .merchant(expense.getMerchant())
                // Existing rows (before auth) may have null source — treat as MANUAL
                .source(expense.getSource() != null ? expense.getSource() : ExpenseSource.MANUAL)
                .referenceId(expense.getReferenceId())
                .transactionType(expense.getTransactionType() != null ? expense.getTransactionType() : com.bhanu.expensebackend.entity.TransactionType.DEBIT)
                .date(expense.getDate() != null ? expense.getDate().toInstant(ZoneOffset.UTC) : null)
                .build();
    }
}

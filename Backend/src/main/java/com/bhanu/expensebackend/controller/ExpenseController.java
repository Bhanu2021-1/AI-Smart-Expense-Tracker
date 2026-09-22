package com.bhanu.expensebackend.controller;

import com.bhanu.expensebackend.dto.ExpenseRequest;
import com.bhanu.expensebackend.dto.ExpenseResponse;
import com.bhanu.expensebackend.entity.User;
import com.bhanu.expensebackend.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * REST endpoints for expense management.
 *
 * All endpoints require authentication (configured in SecurityConfig).
 * The authenticated user is injected via @AuthenticationPrincipal — the user ID
 * is NEVER read from the request body to prevent privilege escalation.
 *
 * @CrossOrigin has been removed — CORS is handled globally in SecurityConfig.
 *
 * BREAKING CHANGE NOTE:
 * As of Phase 1, all endpoints require a valid Authorization: Bearer <token> header.
 * The existing React frontend (Phase 2) and Android app (Phase 4) will be updated to
 * provide this header. Until then, they will receive 401 responses.
 */
@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    /**
     * Get all expenses for the authenticated user.
     * Supports optional filtering by category and date range.
     *
     * GET /api/expenses
     * GET /api/expenses?category=Food
     * GET /api/expenses?startDate=2026-09-01T00:00:00&endDate=2026-09-30T23:59:59
     */
    @GetMapping
    public ResponseEntity<List<ExpenseResponse>> getExpenses(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(required = false) String category,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        return ResponseEntity.ok(
                expenseService.getExpenses(currentUser.getId(), category, startDate, endDate));
    }

    /**
     * Get a single expense by ID.
     * Returns 404 if the expense does not exist or belongs to a different user.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ExpenseResponse> getExpenseById(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {

        return ResponseEntity.ok(expenseService.getExpenseById(id, currentUser.getId()));
    }

    /**
     * Create a new expense.
     *
     * Used by:
     * - React frontend (manual entry, with JWT auth)
     * - Android SMS receiver (after Phase 4, with device token auth)
     *
     * For SMS expenses, include smsHash for idempotency protection.
     */
    @PostMapping
    public ResponseEntity<ExpenseResponse> createExpense(
            @Valid @RequestBody ExpenseRequest request,
            @AuthenticationPrincipal User currentUser) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(expenseService.createExpense(request, currentUser));
    }

    /**
     * Partially update an existing expense.
     * Only non-null fields in the request body are applied.
     * Returns 404 if not found or owned by a different user.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ExpenseResponse> updateExpense(
            @PathVariable Long id,
            @RequestBody ExpenseRequest request,   // No @Valid — all fields optional for PATCH-style update
            @AuthenticationPrincipal User currentUser) {

        return ResponseEntity.ok(
                expenseService.updateExpense(id, request, currentUser.getId()));
    }

    /**
     * Delete an expense.
     * Returns 404 if not found or owned by a different user.
     * Returns 204 No Content on success.
     *
     * NOTE: This endpoint was missing from the original controller and caused
     * the delete button in the React UI to silently fail. Now fixed.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {

        expenseService.deleteExpense(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }
}
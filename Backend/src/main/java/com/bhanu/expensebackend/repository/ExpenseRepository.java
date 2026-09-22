package com.bhanu.expensebackend.repository;

import com.bhanu.expensebackend.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    // ─── User-scoped fetch queries ──────────────────────────────────────────

    /** All expenses for a user, newest first. */
    List<Expense> findAllByUserIdOrderByDateDesc(Long userId);

    /** Expenses for a user filtered by category (case-insensitive), newest first. */
    List<Expense> findAllByUserIdAndCategoryIgnoreCaseOrderByDateDesc(Long userId, String category);

    /**
     * Fetch a single expense that belongs to a specific user.
     * Returns empty if the expense exists but belongs to a different user.
     * This is the ownership-enforcement query used by GET/{id}, PUT, DELETE.
     */
    Optional<Expense> findByIdAndUserId(Long id, Long userId);

    /** Total number of expenses for a user. */
    long countByUserId(Long userId);

    // ─── Date-range queries (used by Phase 5 analytics) ────────────────────

    List<Expense> findAllByUserIdAndDateBetweenOrderByDateDesc(
            Long userId, LocalDateTime start, LocalDateTime end);

    // ─── Idempotency ────────────────────────────────────────────────────────

    /**
     * Checks whether an expense with this SMS fingerprint already exists.
     * If true, the incoming SMS request is a duplicate and should be rejected.
     */
    boolean existsBySmsHash(String smsHash);
}
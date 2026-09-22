package com.bhanu.expensebackend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Represents a single financial expense.
 *
 * MIGRATION SAFETY:
 *  - user_id is nullable so existing rows (created before auth was added) are not rejected.
 *  - source is nullable for the same reason; @PrePersist defaults it to MANUAL for new rows.
 *  - sms_hash unique constraint prevents duplicate expenses from the same SMS.
 *
 * IMPORTANT: Never trust a client-provided user ID. The owning user is always
 * resolved from the authenticated security context in ExpenseService.
 */
@Entity
@Data
@EqualsAndHashCode(exclude = "user")
@ToString(exclude = "user")
@NoArgsConstructor
@AllArgsConstructor
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The owner of this expense.
     * Nullable for migration safety — existing orphan rows have user_id = NULL.
     * Once the first user account is created, a manual migration can assign orphans.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    private User user;

    /** Must be > 0. Validated at the DTO layer before reaching the entity. */
    private Double amount;

    private String note;

    private String category;

    /** Extracted merchant name from the SMS (never invented — only set when detected). */
    private String merchant;

    /**
     * How the expense was created.
     * Nullable for migration safety — existing rows get treated as MANUAL in responses.
     * @PrePersist defaults this to MANUAL for all new rows.
     */
    @Enumerated(EnumType.STRING)
    private ExpenseSource source;

    /**
     * SHA-256 fingerprint of the originating SMS body.
     * UNIQUE constraint prevents duplicate expenses from the same SMS message.
     * NULL for manually-added expenses (no uniqueness check applied to NULLs).
     */
    @Column(name = "sms_hash", unique = true, length = 64)
    private String smsHash;

    /** Bank/UPI transaction reference number parsed from the SMS, if available. */
    @Column(name = "reference_id")
    private String referenceId;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type")
    private TransactionType transactionType;

    private LocalDateTime date;

    @PrePersist
    public void prePersist() {
        // Allow callers to provide a specific timestamp; default to now
        if (this.date == null) {
            this.date = LocalDateTime.now();
        }
        // Default source to MANUAL for new rows; existing rows keep null (handled in service)
        if (this.source == null) {
            this.source = ExpenseSource.MANUAL;
        }
        // Default transactionType to DEBIT for migration safety
        if (this.transactionType == null) {
            this.transactionType = TransactionType.DEBIT;
        }
    }
}
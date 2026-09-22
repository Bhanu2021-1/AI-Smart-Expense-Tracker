package com.bhanu.expensebackend.entity;

/**
 * Indicates how an expense was created.
 * MANUAL = added by the user via the web/mobile UI.
 * SMS    = automatically detected from a bank debit SMS.
 */
public enum ExpenseSource {
    MANUAL,
    SMS
}

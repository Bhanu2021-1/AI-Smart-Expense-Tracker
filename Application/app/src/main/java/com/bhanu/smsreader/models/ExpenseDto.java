package com.bhanu.smsreader.models;

import java.math.BigDecimal;

public class ExpenseDto {
    private Long id;
    private BigDecimal amount;
    private String note;
    private String category;
    private String merchant;
    private String source;
    private String referenceId;
    private String smsHash;
    private String date;

    public ExpenseDto() {}

    public ExpenseDto(BigDecimal amount, String note, String category, String merchant, String source, String smsHash, String date) {
        this.amount = amount;
        this.note = note;
        this.category = category;
        this.merchant = merchant;
        this.source = source;
        this.smsHash = smsHash;
        this.date = date;
    }

    public Long getId() { return id; }
    public BigDecimal getAmount() { return amount; }
    public String getNote() { return note; }
    public String getCategory() { return category; }
    public String getMerchant() { return merchant; }
    public String getSource() { return source; }
    public String getSmsHash() { return smsHash; }
    public String getDate() { return date; }
}

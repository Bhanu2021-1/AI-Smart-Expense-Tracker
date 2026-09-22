package com.bhanu.smsreader;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class SmsParser {

    private static final Pattern AMOUNT_PATTERN = Pattern.compile(
            "(?:Rs\\.?|INR)?\\s*(\\d{1,3}(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*(?:rs|/-)?",
            Pattern.CASE_INSENSITIVE
    );

    // Simple heuristic to find merchant names (usually after "at " or "to " in Indian SMS)
    private static final Pattern MERCHANT_PATTERN = Pattern.compile(
            "(?:at|to|info)\\s+([A-Za-z0-9\\s&\\*\\.]+?)(?=\\s+(?:on|ref|upi|card|$))",
            Pattern.CASE_INSENSITIVE
    );

    public static ParsedSms parse(String body, String sender, long timestamp) {
        if (body == null) return null;
        
        String lowerBody = body.toLowerCase();
        
        String direction = "UNKNOWN";
        if (lowerBody.contains("credited") || lowerBody.contains("credit") || 
            lowerBody.contains("deposited") || lowerBody.contains("received") || 
            lowerBody.contains("amount credited") || lowerBody.contains("a/c credited") ||
            lowerBody.contains("added")) {
            direction = "CREDIT";
        } else if (lowerBody.contains("debit") || lowerBody.contains("debited") || 
                   lowerBody.contains("withdrawn") || lowerBody.contains("spent") || 
                   lowerBody.contains("amount debited") || lowerBody.contains("paid")) {
            direction = "DEBIT";
        }

        if (direction.equals("UNKNOWN")) {
            return null; // Not an expense or income
        }

        Matcher amountMatcher = AMOUNT_PATTERN.matcher(body);
        if (!amountMatcher.find()) return null;

        String amountStr = amountMatcher.group(1).replace(",", "");
        
        Matcher merchantMatcher = MERCHANT_PATTERN.matcher(body);
        String merchant = "Unknown Merchant";
        if (merchantMatcher.find()) {
            merchant = merchantMatcher.group(1).trim();
        } else if (sender != null && sender.length() > 2) {
            // Extract from sender ID e.g. "AD-HDFCBK" -> "HDFCBK"
            String[] parts = sender.split("-");
            merchant = parts[parts.length - 1];
        }

        String category = categorizeMerchant(merchant);
        
        String smsHash = generateHash(body + timestamp);

        android.util.Log.d("SMS_DEBUG", "transaction direction = " + direction);

        return new ParsedSms(amountStr, merchant, category, smsHash, lowerBody, direction);
    }

    private static String categorizeMerchant(String merchant) {
        String m = merchant.toLowerCase();
        if (m.contains("swiggy") || m.contains("zomato") || m.contains("kfc") || m.contains("food")) return "Food";
        if (m.contains("amazon") || m.contains("flipkart") || m.contains("myntra")) return "Shopping";
        if (m.contains("uber") || m.contains("ola") || m.contains("irctc")) return "Travel";
        if (m.contains("jio") || m.contains("airtel") || m.contains("bill") || m.contains("bescom")) return "Bills";
        return "Other";
    }

    private static String generateHash(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder(2 * hash.length);
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not supported", e);
        }
    }

    public static class ParsedSms {
        public final String amount;
        public final String merchant;
        public final String category;
        public final String smsHash;
        public final String originalBody;
        public final String transactionType;

        public ParsedSms(String amount, String merchant, String category, String smsHash, String originalBody, String transactionType) {
            this.amount = amount;
            this.merchant = merchant;
            this.category = category;
            this.smsHash = smsHash;
            this.originalBody = originalBody;
            this.transactionType = transactionType;
        }
    }
}

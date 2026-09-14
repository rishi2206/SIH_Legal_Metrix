package com.interconn.integration;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * OCR + Gemini output is free text (e.g. "Rs. 149.00", "12/2026",
 * "Best before 18 months from packaging"), so values are parsed
 * defensively: unparseable input becomes null instead of an
 * exception, letting the supervisor fill the field in manually.
 */
public final class AiFieldParser {

    private static final Pattern PRICE_PATTERN =
            Pattern.compile("(\\d+(?:[.,]\\d+)?)");

    private static final List<DateTimeFormatter> DATE_FORMATTERS = List.of(
            DateTimeFormatter.ofPattern("yyyy-MM-dd", Locale.ENGLISH),
            DateTimeFormatter.ofPattern("dd-MM-yyyy", Locale.ENGLISH),
            DateTimeFormatter.ofPattern("dd/MM/yyyy", Locale.ENGLISH),
            DateTimeFormatter.ofPattern("d-M-yyyy", Locale.ENGLISH),
            DateTimeFormatter.ofPattern("d/M/yyyy", Locale.ENGLISH),
            DateTimeFormatter.ofPattern("d MMM yyyy", Locale.ENGLISH),
            DateTimeFormatter.ofPattern("d MMMM yyyy", Locale.ENGLISH)
    );

    private static final List<DateTimeFormatter> MONTH_YEAR_FORMATTERS = List.of(
            DateTimeFormatter.ofPattern("MM/yyyy", Locale.ENGLISH),
            DateTimeFormatter.ofPattern("MM-yyyy", Locale.ENGLISH),
            DateTimeFormatter.ofPattern("MMM yyyy", Locale.ENGLISH),
            DateTimeFormatter.ofPattern("MMMM yyyy", Locale.ENGLISH)
    );

    private AiFieldParser() {
    }

    public static BigDecimal parseMrp(String rawValue) {

        if (rawValue == null || rawValue.isBlank()) {
            return null;
        }

        String normalized = rawValue.replace(",", "");

        Matcher matcher = PRICE_PATTERN.matcher(normalized);

        if (!matcher.find()) {
            return null;
        }

        try {
            return new BigDecimal(matcher.group(1));
        } catch (NumberFormatException e) {
            return null;
        }
    }

    public static LocalDate parseDate(String rawValue) {

        if (rawValue == null || rawValue.isBlank()) {
            return null;
        }

        String normalized = rawValue.trim();

        for (DateTimeFormatter formatter : DATE_FORMATTERS) {
            try {
                return LocalDate.parse(normalized, formatter);
            } catch (Exception ignored) {
                // try the next pattern
            }
        }

        // Month + year only (no day of month available on the label).
        for (DateTimeFormatter formatter : MONTH_YEAR_FORMATTERS) {
            try {
                java.time.YearMonth yearMonth =
                        java.time.YearMonth.parse(normalized, formatter);
                return yearMonth.atDay(1);
            } catch (Exception ignored) {
                // try the next pattern
            }
        }

        return null;
    }

    public static String blankToNull(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }
}

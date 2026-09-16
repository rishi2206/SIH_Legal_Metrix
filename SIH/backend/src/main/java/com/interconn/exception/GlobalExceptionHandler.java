package com.interconn.exception;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.interconn.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log =
            LoggerFactory.getLogger(GlobalExceptionHandler.class);

    private final ObjectMapper objectMapper;

    public GlobalExceptionHandler(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @ExceptionHandler(RuntimeException.class)
    public void handleRuntimeException(
            RuntimeException exception,
            HttpServletRequest request,
            HttpServletResponse response) throws IOException {

        log.warn(
                "Handled RuntimeException on {}: {}",
                request.getRequestURI(),
                exception.getMessage(),
                exception
        );

        writeError(
                response,
                HttpStatus.BAD_REQUEST,
                "Bad Request",
                exception.getMessage(),
                request.getRequestURI()
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public void handleValidationException(
            MethodArgumentNotValidException exception,
            HttpServletRequest request,
            HttpServletResponse response) throws IOException {

        String message = exception.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error ->
                        error.getField() + ": " +
                                error.getDefaultMessage()
                )
                .collect(Collectors.joining(", "));

        log.warn(
                "Validation error on {}: {}",
                request.getRequestURI(),
                message
        );

        writeError(
                response,
                HttpStatus.BAD_REQUEST,
                "Validation Error",
                message,
                request.getRequestURI()
        );
    }

    @ExceptionHandler(Exception.class)
    public void handleException(
            Exception exception,
            HttpServletRequest request,
            HttpServletResponse response) throws IOException {

        log.error(
                "Unhandled exception on {}",
                request.getRequestURI(),
                exception
        );

        writeError(
                response,
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Internal Server Error",
                "An unexpected error occurred.",
                request.getRequestURI()
        );
    }

    private void writeError(
            HttpServletResponse response,
            HttpStatus status,
            String error,
            String message,
            String path) throws IOException {

        ErrorResponse body = new ErrorResponse(
                LocalDateTime.now(),
                status.value(),
                error,
                message,
                path
        );

        if (response.isCommitted()) {
            log.warn(
                    "Response already committed for {}, cannot write error body.",
                    path
            );
            return;
        }

        // NOTE: do NOT call response.reset() here — it wipes out headers
        // already set earlier in the filter chain, including the
        // Access-Control-Allow-Origin CORS header added by Spring's CORS
        // filter. That caused every error response (400/500) to look like
        // a CORS failure in the browser even though CORS was configured
        // correctly. Just set status/content-type directly instead.
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(
                objectMapper.writeValueAsString(body));
        response.getWriter().flush();
    }
}
package tech.jhipster.controlcenter.web.rest.errors;

import io.github.jhipster.web.util.HeaderUtil;
import java.util.List;
import java.util.stream.Collectors;
import javax.annotation.Nonnull;
import javax.annotation.Nullable;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.support.WebExchangeBindException;
import org.springframework.web.server.ServerWebExchange;
import org.zalando.problem.DefaultProblem;
import org.zalando.problem.Problem;
import org.zalando.problem.ProblemBuilder;
import org.zalando.problem.Status;
import org.zalando.problem.spring.webflux.advice.ProblemHandling;
import org.zalando.problem.spring.webflux.advice.security.SecurityAdviceTrait;
import org.zalando.problem.violations.ConstraintViolationProblem;
import reactor.core.publisher.Mono;

/**
 * Controller advice to translate the server side exceptions to client-friendly json structures.
 * The error response follows RFC7807 - Problem Details for HTTP APIs (https://tools.ietf.org/html/rfc7807).
 */
@ControllerAdvice
public class ExceptionTranslator implements ProblemHandling, SecurityAdviceTrait {
    private static final String FIELD_ERRORS_KEY = "fieldErrors";
    private static final String MESSAGE_KEY = "message";
    private static final String PATH_KEY = "path";
    private static final String VIOLATIONS_KEY = "violations";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    /**
     * Post-process the Problem payload to add the message key for the front-end if needed.
     */
    @Override
    public Mono<ResponseEntity<Problem>> process(@Nullable ResponseEntity<Problem> entity, ServerWebExchange request) {
        if (entity == null) {
            return Mono.empty();
        }
        Problem problem = entity.getBody();
        if (!(problem instanceof ConstraintViolationProblem || problem instanceof DefaultProblem)) {
            return Mono.just(entity);
        }
        ProblemBuilder builder = Problem
            .builder()
            .withType(Problem.DEFAULT_TYPE.equals(problem.getType()) ? ErrorConstants.DEFAULT_TYPE : problem.getType())
            .withStatus(problem.getStatus())
            .withTitle(problem.getTitle())
            .with(PATH_KEY, request.getRequest().getPath().value());

        if (problem instanceof ConstraintViolationProblem) {
            builder
                .with(VIOLATIONS_KEY, ((ConstraintViolationProblem) problem).getViolations())
                .with(MESSAGE_KEY, ErrorConstants.ERR_VALIDATION);
        } else {
            builder.withCause(((DefaultProblem) problem).getCause()).withDetail(problem.getDetail()).withInstance(problem.getInstance());
            problem.getParameters().forEach(builder::with);
            if (!problem.getParameters().containsKey(MESSAGE_KEY) && problem.getStatus() != null) {
                builder.with(MESSAGE_KEY, "error.http." + problem.getStatus().getStatusCode());
            }
        }
        return Mono.just(new ResponseEntity<>(builder.build(), entity.getHeaders(), entity.getStatusCode()));
    }

    @Override
    public Mono<ResponseEntity<Problem>> handleBindingResult(WebExchangeBindException ex, @Nonnull ServerWebExchange request) {
        BindingResult result = ex.getBindingResult();
        List<FieldErrorVM> fieldErrors = result
            .getFieldErrors()
            .stream()
            .map(f -> new FieldErrorVM(f.getObjectName().replaceFirst("DTO$", ""), f.getField(), f.getCode()))
            .collect(Collectors.toList());

        Problem problem = Problem
            .builder()
            .withType(ErrorConstants.CONSTRAINT_VIOLATION_TYPE)
            .withTitle("Data binding and validation failure")
            .withStatus(Status.BAD_REQUEST)
            .with(MESSAGE_KEY, ErrorConstants.ERR_VALIDATION)
            .with(FIELD_ERRORS_KEY, fieldErrors)
            .build();
        return create(ex, problem, request);
    }

    @ExceptionHandler
    public Mono<ResponseEntity<Problem>> handleBadRequestAlertException(BadRequestAlertException ex, ServerWebExchange request) {
        return create(
            ex,
            request,
            HeaderUtil.createFailureAlert(applicationName, false, ex.getEntityName(), ex.getErrorKey(), ex.getMessage())
        );
    }
}

package tech.jhipster.controlcenter.web.rest;

import tech.jhipster.controlcenter.JhipsterControlCenterApp;
import tech.jhipster.controlcenter.security.AuthoritiesConstants;
import tech.jhipster.controlcenter.web.rest.errors.ExceptionTranslator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.reactive.server.WebTestClient;

/**
 * Integration tests for the {@link AccountResource} REST controller.
 */
@SpringBootTest(classes = JhipsterControlCenterApp.class)
public class AccountResourceIT {

    @Autowired
    private ExceptionTranslator exceptionTranslator;

    private WebTestClient webTestClient;

    @BeforeEach
    public void setup() {
        AccountResource accountUserMockResource = new AccountResource();
        this.webTestClient = WebTestClient.bindToController(accountUserMockResource)
            .controllerAdvice(exceptionTranslator)
            .build();
    }

    @Test
    @WithMockUser(username = "test", roles = "ADMIN")
    public void testGetExistingAccount() {
        webTestClient.get().uri("/api/account")
            .accept(MediaType.APPLICATION_JSON)
            .exchange()
            .expectStatus().isOk()
            .expectHeader().contentType(MediaType.APPLICATION_JSON_UTF8)
            .expectBody()
            .jsonPath("$.login").isEqualTo("test")
            .jsonPath("$.authorities").isEqualTo(AuthoritiesConstants.ADMIN);
    }

    @Test
    public void testGetUnknownAccount() {
        webTestClient.get().uri("/api/account")
            .accept(MediaType.APPLICATION_JSON)
            .exchange()
            .expectStatus().is5xxServerError();
    }
}

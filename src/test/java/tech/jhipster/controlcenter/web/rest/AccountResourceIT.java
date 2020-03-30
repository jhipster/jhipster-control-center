package tech.jhipster.controlcenter.web.rest;

import tech.jhipster.controlcenter.JhipsterControlCenterApp;
import tech.jhipster.controlcenter.security.AuthoritiesConstants;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.reactive.server.WebTestClient;
import static tech.jhipster.controlcenter.web.rest.AccountResourceIT.TEST_USER_LOGIN;

/**
 * Integration tests for the {@link AccountResource} REST controller.
 */
@AutoConfigureWebTestClient
@WithMockUser(value = TEST_USER_LOGIN)
@SpringBootTest(classes = JhipsterControlCenterApp.class)
public class AccountResourceIT {
    static final String TEST_USER_LOGIN = "test";

    @Autowired
    private WebTestClient accountWebTestClient;

    @Test
    @WithMockUser(username = TEST_USER_LOGIN, authorities = AuthoritiesConstants.ADMIN)
    public void testGetExistingAccount() {
        accountWebTestClient.get().uri("/api/account")
            .accept(MediaType.APPLICATION_JSON)
            .exchange()
            .expectStatus().isOk()
            .expectHeader().contentType(MediaType.APPLICATION_JSON_UTF8)
            .expectBody()
            .jsonPath("$.login").isEqualTo(TEST_USER_LOGIN)
            .jsonPath("$.authorities").isEqualTo(AuthoritiesConstants.ADMIN);
    }
}

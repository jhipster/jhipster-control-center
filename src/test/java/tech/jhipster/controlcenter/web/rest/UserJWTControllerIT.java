package tech.jhipster.controlcenter.web.rest;

import tech.jhipster.controlcenter.JhipsterControlCenterApp;
import tech.jhipster.controlcenter.security.jwt.TokenProvider;
import tech.jhipster.controlcenter.web.rest.errors.ExceptionTranslator;
import tech.jhipster.controlcenter.web.rest.vm.LoginVM;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.test.web.reactive.server.WebTestClient;

/**
 * Integration tests for the {@link UserJWTController} REST controller.
 */
@SpringBootTest(classes = JhipsterControlCenterApp.class)
public class UserJWTControllerIT {

    @Autowired
    private TokenProvider tokenProvider;

    @Autowired
    private ReactiveAuthenticationManager authenticationManager;

    @Autowired
    private ExceptionTranslator exceptionTranslator;

    private WebTestClient webTestClient;

    @BeforeEach
    public void setup() {
        UserJWTController userJWTController = new UserJWTController(tokenProvider, authenticationManager);
        this.webTestClient = WebTestClient.bindToController(userJWTController)
            .controllerAdvice(exceptionTranslator)
            .build();
    }

    @Test
    public void testAuthorize() throws Exception {
        LoginVM login = new LoginVM();
        login.setUsername("test");
        login.setPassword("test");
        webTestClient.post().uri("/api/authenticate")
            .contentType(TestUtil.APPLICATION_JSON)
            .syncBody(TestUtil.convertObjectToJsonBytes(login))
            .exchange()
            .expectStatus().isOk()
            .expectHeader().valueMatches("Authorization", "Bearer .+")
            .expectBody()
            .jsonPath("$.id_token").isNotEmpty();
    }

    @Test
    public void testAuthorizeWithRememberMe() throws Exception {
        LoginVM login = new LoginVM();
        login.setUsername("test");
        login.setPassword("test");
        login.setRememberMe(true);
        webTestClient.post().uri("/api/authenticate")
            .contentType(TestUtil.APPLICATION_JSON)
            .syncBody(TestUtil.convertObjectToJsonBytes(login))
            .exchange()
            .expectStatus().isOk()
            .expectHeader().valueMatches("Authorization", "Bearer .+")
            .expectBody()
            .jsonPath("$.id_token").isNotEmpty();
    }

    @Test
    public void testAuthorizeFails() throws Exception {
        LoginVM login = new LoginVM();
        login.setUsername("wrong-user");
        login.setPassword("wrong password");
        webTestClient.post().uri("/api/authenticate")
            .contentType(TestUtil.APPLICATION_JSON)
            .syncBody(TestUtil.convertObjectToJsonBytes(login))
            .exchange()
            .expectStatus().isUnauthorized()
            .expectHeader().doesNotExist("Authorization")
            .expectBody()
            .jsonPath("$.id_token").doesNotExist();
    }
}

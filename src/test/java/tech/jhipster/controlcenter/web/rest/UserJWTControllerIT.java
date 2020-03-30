package tech.jhipster.controlcenter.web.rest;

import tech.jhipster.controlcenter.JhipsterControlCenterApp;
import tech.jhipster.controlcenter.web.rest.vm.LoginVM;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.reactive.server.WebTestClient;

/**
 * Integration tests for the {@link UserJWTController} REST controller.
 */
@AutoConfigureWebTestClient
@SpringBootTest(classes = JhipsterControlCenterApp.class)
public class UserJWTControllerIT {

    @Autowired
    private WebTestClient webTestClient;

    @Test
    public void testAuthorize() throws Exception {
        LoginVM login = new LoginVM();
        login.setUsername("test");
        login.setPassword("test");
        webTestClient.post().uri("/api/authenticate")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(TestUtil.convertObjectToJsonBytes(login))
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
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(TestUtil.convertObjectToJsonBytes(login))
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
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(TestUtil.convertObjectToJsonBytes(login))
            .exchange()
            .expectStatus().isUnauthorized()
            .expectHeader().doesNotExist("Authorization")
            .expectBody()
            .jsonPath("$.id_token").doesNotExist();
    }
}

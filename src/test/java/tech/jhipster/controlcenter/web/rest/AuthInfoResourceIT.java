package tech.jhipster.controlcenter.web.rest;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.reactive.server.WebTestClient;
import tech.jhipster.controlcenter.JhipsterControlCenterApp;
import tech.jhipster.controlcenter.config.Oauth2SecurityConfigurationTest;
import tech.jhipster.controlcenter.security.AuthoritiesConstants;

/**
 * Integration tests for the {@link AuthInfoResource} REST controller.
 */
@AutoConfigureWebTestClient
@SpringBootTest(classes = { JhipsterControlCenterApp.class })
@ActiveProfiles(profiles = "oauth2-test")
@Import(Oauth2SecurityConfigurationTest.class)
public class AuthInfoResourceIT {
    @Autowired
    private WebTestClient webTestClient;

    private static final String issuer = "http://localhost:9080/auth/realms/jhipster";

    private static final String clientId = "web_app";

    @Test
    @WithMockUser(authorities = AuthoritiesConstants.USER)
    public void testGetAuthInfoEmpty() {
        webTestClient
            .get()
            .uri("/api/auth-info")
            .accept(MediaType.APPLICATION_JSON)
            .exchange()
            .expectStatus()
            .isOk()
            .expectBody()
            .jsonPath("$.issuer")
            .isEqualTo(issuer)
            .jsonPath("$.clientId")
            .isEqualTo(clientId);
    }

    @Test
    public void testAuthInfoVM() {
        AuthInfoResource.AuthInfoVM authInfo = new AuthInfoResource.AuthInfoVM("", "");
        authInfo.setIssuer(issuer);
        authInfo.setClientId(clientId);
        assertEquals(issuer, authInfo.getIssuer());
        assertEquals(clientId, authInfo.getClientId());
    }
}

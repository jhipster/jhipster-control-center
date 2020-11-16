package tech.jhipster.controlcenter.web.rest;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.reactive.server.WebTestClient;
import tech.jhipster.controlcenter.JhipsterControlCenterApp;
import tech.jhipster.controlcenter.security.AuthoritiesConstants;

/**
 * Integration tests for the {@link ServiceDiscoveryResource} REST controller.
 * A simple service with an instance is provided in test/resources/application.yml.
 */
@AutoConfigureWebTestClient
@SpringBootTest(classes = { JhipsterControlCenterApp.class })
public class ServiceDiscoveryResourceIT {
    @Autowired
    private WebTestClient webTestClient;

    @Test
    @WithMockUser(authorities = AuthoritiesConstants.ADMIN)
    public void testGetAllServiceInstances() {
        webTestClient
            .get()
            .uri("/api/services/instances")
            .accept(MediaType.APPLICATION_JSON)
            .exchange()
            .expectStatus()
            .isOk()
            .expectHeader()
            .contentType(MediaType.APPLICATION_JSON)
            .expectBody()
            .jsonPath("$.length()")
            .isEqualTo(1);
    }

    @Test
    @WithMockUser(authorities = AuthoritiesConstants.ADMIN)
    public void testGetServiceInstance() {
        webTestClient
            .get()
            .uri("/api/services/{serviceId}", "service-test")
            .exchange()
            .expectStatus()
            .isOk()
            .expectHeader()
            .contentType(MediaType.APPLICATION_JSON)
            .expectBody()
            .jsonPath("$[0].serviceId")
            .isEqualTo("service-test")
            .jsonPath("$[0].instanceId")
            .isEqualTo("instance-test");
    }
}

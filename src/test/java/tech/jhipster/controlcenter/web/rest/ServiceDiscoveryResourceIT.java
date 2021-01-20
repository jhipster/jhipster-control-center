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
import tech.jhipster.controlcenter.web.rest.vm.ServiceInstanceVM;

/**
 * Integration tests for the {@link ServiceDiscoveryResource} REST controller.
 * A simple service with an instance is provided in test/resources/application.yml.
 */
@AutoConfigureWebTestClient
@SpringBootTest(classes = { JhipsterControlCenterApp.class })
class ServiceDiscoveryResourceIT {

    @Autowired
    private WebTestClient webTestClient;

    @Test
    @WithMockUser(authorities = AuthoritiesConstants.ADMIN)
    void shouldGetAllServiceInstances() {
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
    void shouldAddServiceInstance() throws Exception {
        ServiceInstanceVM instanceTest = new ServiceInstanceVM();
        instanceTest.setServiceId("serviceTest");
        instanceTest.setUrl("http://localhost:8081");

        webTestClient
            .post()
            .uri("/api/services/instances")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(TestUtil.convertObjectToJsonBytes(instanceTest))
            .exchange()
            .expectStatus()
            .isCreated()
            .expectBody()
            .consumeWith(System.out::println)
            .jsonPath("$.serviceId")
            .isEqualTo("serviceTest")
            .jsonPath("$.host")
            .isEqualTo("localhost")
            .jsonPath("$.port")
            .isEqualTo("8081")
            .jsonPath("$.secure")
            .isEqualTo(false);
    }

    @Test
    @WithMockUser(authorities = AuthoritiesConstants.ADMIN)
    void shouldGetServiceInstance() {
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

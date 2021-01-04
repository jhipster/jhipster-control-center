/*
 * Copyright 2020-2021 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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

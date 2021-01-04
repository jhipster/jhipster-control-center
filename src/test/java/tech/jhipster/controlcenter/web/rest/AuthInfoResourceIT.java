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
    public void testGetAuthInfo() {
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

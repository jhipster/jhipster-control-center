package tech.jhipster.controlcenter.config;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.AutoConfigurations;
import org.springframework.boot.autoconfigure.security.oauth2.client.reactive.ReactiveOAuth2ClientAutoConfiguration;
import org.springframework.boot.autoconfigure.security.reactive.ReactiveSecurityAutoConfiguration;
import org.springframework.boot.test.context.runner.ReactiveWebApplicationContextRunner;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ReactiveClientRegistrationRepository;

class OAuth2ClientDiscoveryTest {

    private HttpServer discoveryServer;
    private String issuer;
    private final AtomicInteger discoveryRequests = new AtomicInteger();
    private Map<String, Object> metadata;

    @BeforeEach
    void serveProviderMetadata() throws Exception {
        discoveryServer = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        issuer = "http://127.0.0.1:" + discoveryServer.getAddress().getPort() + "/auth/realms/jhipster";
        metadata = new LinkedHashMap<>();
        metadata.put("issuer", issuer);
        metadata.put("authorization_endpoint", issuer + "/protocol/openid-connect/auth");
        metadata.put("token_endpoint", issuer + "/protocol/openid-connect/token");
        metadata.put("jwks_uri", issuer + "/protocol/openid-connect/certs");
        metadata.put("response_types_supported", List.of("code"));
        metadata.put("subject_types_supported", List.of("public"));
        metadata.put("id_token_signing_alg_values_supported", List.of("RS256"));
        discoveryServer.createContext(
            "/auth/realms/jhipster/.well-known/openid-configuration",
            exchange -> {
                discoveryRequests.incrementAndGet();
                byte[] response = new ObjectMapper().writeValueAsBytes(metadata);
                exchange.getResponseHeaders().set("Content-Type", "application/json");
                exchange.sendResponseHeaders(200, response.length);
                try (java.io.OutputStream stream = exchange.getResponseBody()) {
                    stream.write(response);
                }
            }
        );
        discoveryServer.start();
    }

    @AfterEach
    void stopProvider() {
        if (discoveryServer != null) {
            discoveryServer.stop(0);
        }
    }

    private ReactiveWebApplicationContextRunner clientContext() {
        return new ReactiveWebApplicationContextRunner()
            .withConfiguration(AutoConfigurations.of(ReactiveSecurityAutoConfiguration.class, ReactiveOAuth2ClientAutoConfiguration.class))
            .withPropertyValues(
                "spring.security.oauth2.client.provider.oidc.issuer-uri=" + issuer,
                "spring.security.oauth2.client.registration.oidc.client-id=web_app",
                "spring.security.oauth2.client.registration.oidc.client-secret=web_app",
                "spring.security.oauth2.client.registration.oidc.scope=openid,profile,email"
            );
    }

    @Test
    void startsReactiveClientWithMtlsDiscoveryMetadata() {
        metadata.put("mtls_endpoint_aliases", Map.of("token_endpoint", issuer + "/mtls/token"));
        assertClientStarts();
    }

    @Test
    void startsReactiveClientWithoutMtlsDiscoveryMetadata() {
        assertClientStarts();
    }

    private void assertClientStarts() {
        clientContext()
            .run(
                context -> {
                    assertThat(context).hasNotFailed().hasSingleBean(ReactiveClientRegistrationRepository.class);
                    ClientRegistration client = context
                        .getBean(ReactiveClientRegistrationRepository.class)
                        .findByRegistrationId("oidc")
                        .block(Duration.ofSeconds(5));
                    assertThat(client).isNotNull();
                    assertThat(client.getClientId()).isEqualTo("web_app");
                    assertThat(client.getScopes()).containsExactlyInAnyOrder("openid", "profile", "email");
                    assertThat(client.getProviderDetails().getIssuerUri()).isEqualTo(issuer);
                    assertThat(client.getProviderDetails().getTokenUri()).isEqualTo(metadata.get("token_endpoint"));
                    assertThat(client.getProviderDetails().getConfigurationMetadata().get("mtls_endpoint_aliases"))
                        .isEqualTo(metadata.get("mtls_endpoint_aliases"));
                    assertThat(discoveryRequests.get()).isPositive();
                }
            );
    }

    @Test
    void rejectsDiscoveryForAnotherIssuer() {
        metadata.put("issuer", issuer + "/different");
        clientContext()
            .run(
                context -> {
                    assertThat(context).hasFailed();
                    assertThat(context.getStartupFailure())
                        .hasRootCauseInstanceOf(IllegalStateException.class)
                        .hasRootCauseMessage(
                            "The Issuer \"" +
                            issuer +
                            "/different\" provided in the configuration metadata did not match the requested issuer \"" +
                            issuer +
                            "\""
                        );
                    assertThat(discoveryRequests.get()).isPositive();
                }
            );
    }
}

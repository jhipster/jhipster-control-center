package tech.jhipster.controlcenter.config;

import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrations;

import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Regression test for #174: Keycloak 15+ advertises a nested {@code mtls_endpoint_aliases}
 * object in its OIDC discovery document. Spring's {@link ClientRegistrations#fromIssuerLocation}
 * decodes that document with Jackson before handing it to nimbus's {@code OIDCProviderMetadata},
 * so nested members arrive as plain {@link java.util.LinkedHashMap} rather than
 * {@code net.minidev.json.JSONObject}. nimbus 8.36.1 (the version transitively pulled in by
 * spring-security-oauth2-client 5.4.5) rejects that with
 * "ParseException: Unexpected type of JSON object member with key mtls_endpoint_aliases", which
 * blocks the control-center from booting against Keycloak 15+. Later 9.x releases parse nested
 * members leniently regardless of their concrete Map type.
 */
class OidcProviderMetadataMtlsEndpointAliasesTest {

    private HttpServer server;
    private int port;

    @BeforeEach
    void start() throws Exception {
        server = HttpServer.create(new InetSocketAddress("localhost", 0), 0);
        port = server.getAddress().getPort();
        String issuer = "http://localhost:" + port;
        String body = "{"
            + "\"issuer\":\"" + issuer + "\","
            + "\"authorization_endpoint\":\"" + issuer + "/auth\","
            + "\"token_endpoint\":\"" + issuer + "/token\","
            + "\"jwks_uri\":\"" + issuer + "/certs\","
            + "\"userinfo_endpoint\":\"" + issuer + "/userinfo\","
            + "\"response_types_supported\":[\"code\"],"
            + "\"subject_types_supported\":[\"public\"],"
            + "\"id_token_signing_alg_values_supported\":[\"RS256\"],"
            + "\"mtls_endpoint_aliases\":{"
            + "  \"token_endpoint\":\"" + issuer + "/token\","
            + "  \"userinfo_endpoint\":\"" + issuer + "/userinfo\""
            + "}"
            + "}";
        server.createContext("/.well-known/openid-configuration", exchange -> {
            byte[] resp = body.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, resp.length);
            exchange.getResponseBody().write(resp);
            exchange.close();
        });
        server.start();
    }

    @AfterEach
    void stop() {
        server.stop(0);
    }

    @Test
    void parsesDiscoveryDocumentContainingMtlsEndpointAliases() {
        String issuer = "http://localhost:" + port;
        ClientRegistration registration = ClientRegistrations.fromIssuerLocation(issuer)
            .registrationId("keycloak")
            .clientId("test-client")
            .clientSecret("test-secret")
            .build();
        assertThat(registration.getProviderDetails().getTokenUri()).isEqualTo(issuer + "/token");
        assertThat(registration.getProviderDetails().getUserInfoEndpoint().getUri()).isEqualTo(issuer + "/userinfo");
    }
}

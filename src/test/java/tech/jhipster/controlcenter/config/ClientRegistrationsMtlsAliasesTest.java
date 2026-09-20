package tech.jhipster.controlcenter.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;

import com.sun.net.httpserver.HttpServer;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrations;

/**
 * End-to-end coverage for
 * <a href="https://github.com/jhipster/jhipster-control-center/issues/174">#174</a> through the
 * entry point that actually fails at startup.
 *
 * <p>{@code OidcMetadataMtlsAliasesTest} pins the parsing behaviour directly. This test drives
 * {@link ClientRegistrations#fromIssuerLocation(String)}, the call that
 * {@code ReactiveClientRegistrationRepository} makes on boot, against a discovery document served
 * over HTTP. That path reads the document with Jackson into a {@code Map} and hands Nimbus a
 * shallow {@code JSONObject} copy, which is what leaves {@code mtls_endpoint_aliases} as a
 * {@code java.util.LinkedHashMap} and produces the reported failure.
 */
class ClientRegistrationsMtlsAliasesTest {

    private HttpServer server;

    private String issuer;

    @BeforeEach
    void startDiscoveryEndpoint() throws Exception {
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        int port = server.getAddress().getPort();
        issuer = "http://127.0.0.1:" + port + "/auth/realms/jhipster";

        byte[] body = discoveryDocument(issuer).getBytes(StandardCharsets.UTF_8);
        server.createContext(
            "/auth/realms/jhipster/.well-known/openid-configuration",
            exchange -> {
                exchange.getResponseHeaders().add("Content-Type", "application/json");
                exchange.sendResponseHeaders(200, body.length);
                try (OutputStream out = exchange.getResponseBody()) {
                    out.write(body);
                }
            }
        );
        server.start();
    }

    @AfterEach
    void stopDiscoveryEndpoint() {
        if (server != null) {
            server.stop(0);
        }
    }

    /**
     * A Keycloak-shaped discovery document. Single quotes are used for readability and swapped for
     * JSON double quotes before returning.
     */
    private static String discoveryDocument(String issuer) {
        StringBuilder json = new StringBuilder();
        json.append("{");
        json.append("'issuer': '").append(issuer).append("',");
        json.append("'authorization_endpoint': '").append(issuer).append("/protocol/openid-connect/auth',");
        json.append("'token_endpoint': '").append(issuer).append("/protocol/openid-connect/token',");
        json.append("'userinfo_endpoint': '").append(issuer).append("/protocol/openid-connect/userinfo',");
        json.append("'jwks_uri': '").append(issuer).append("/protocol/openid-connect/certs',");
        json.append("'response_types_supported': ['code', 'id_token', 'token id_token'],");
        json.append("'subject_types_supported': ['public', 'pairwise'],");
        json.append("'id_token_signing_alg_values_supported': ['RS256'],");
        json.append("'scopes_supported': ['openid', 'profile', 'email'],");
        json.append("'mtls_endpoint_aliases': {");
        json.append("'token_endpoint': '").append(issuer).append("/protocol/openid-connect/token/mtls',");
        json.append("'authorization_endpoint': '").append(issuer).append("/protocol/openid-connect/auth/mtls'");
        json.append("}");
        json.append("}");
        return json.toString().replace('\'', '"');
    }

    @Test
    void buildsAClientRegistrationFromAKeycloakDiscoveryDocument() {
        assertThatCode(() -> ClientRegistrations.fromIssuerLocation(issuer).clientId("web_app").clientSecret("secret").build())
            .doesNotThrowAnyException();
    }

    @Test
    void resolvesTheEndpointsTheApplicationNeeds() {
        ClientRegistration registration = ClientRegistrations
            .fromIssuerLocation(issuer)
            .clientId("web_app")
            .clientSecret("secret")
            .build();

        assertThat(registration.getProviderDetails().getIssuerUri()).isEqualTo(issuer);
        assertThat(registration.getProviderDetails().getTokenUri()).isEqualTo(issuer + "/protocol/openid-connect/token");
        assertThat(registration.getProviderDetails().getAuthorizationUri())
            .isEqualTo(issuer + "/protocol/openid-connect/auth");
        assertThat(registration.getProviderDetails().getJwkSetUri()).isEqualTo(issuer + "/protocol/openid-connect/certs");
    }
}

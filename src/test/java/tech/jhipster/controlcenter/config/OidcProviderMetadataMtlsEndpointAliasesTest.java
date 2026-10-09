package tech.jhipster.controlcenter.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;

import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrations;

/**
 * Regression for <a href="https://github.com/jhipster/jhipster-control-center/issues/174">#174</a>.
 *
 * <p>Keycloak 15+ advertises {@code mtls_endpoint_aliases} in the OIDC discovery document.
 * Older {@code com.nimbusds:oauth2-oidc-sdk} lines reject nested members that arrive as
 * {@code java.util.LinkedHashMap}, which aborts {@code ClientRegistrations.fromIssuerLocation}
 * during control-center startup.
 */
class OidcProviderMetadataMtlsEndpointAliasesTest {

    private HttpServer server;
    private String issuer;

    @BeforeEach
    void startDiscoveryServer() throws IOException {
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        int port = server.getAddress().getPort();
        issuer = "http://127.0.0.1:" + port + "/auth/realms/jhipster";
        String discoveryJson =
            "{"
                + "\"issuer\":\""
                + issuer
                + "\","
                + "\"authorization_endpoint\":\""
                + issuer
                + "/protocol/openid-connect/auth\","
                + "\"token_endpoint\":\""
                + issuer
                + "/protocol/openid-connect/token\","
                + "\"jwks_uri\":\""
                + issuer
                + "/protocol/openid-connect/certs\","
                + "\"userinfo_endpoint\":\""
                + issuer
                + "/protocol/openid-connect/userinfo\","
                + "\"end_session_endpoint\":\""
                + issuer
                + "/protocol/openid-connect/logout\","
                + "\"response_types_supported\":[\"code\"],"
                + "\"subject_types_supported\":[\"public\"],"
                + "\"id_token_signing_alg_values_supported\":[\"RS256\"],"
                + "\"mtls_endpoint_aliases\":{"
                + "\"token_endpoint\":\""
                + issuer
                + "/protocol/openid-connect/token/mtls\","
                + "\"revocation_endpoint\":\""
                + issuer
                + "/protocol/openid-connect/revoke/mtls\""
                + "}"
                + "}";
        byte[] body = discoveryJson.getBytes(StandardCharsets.UTF_8);
        server.createContext(
            "/auth/realms/jhipster/.well-known/openid-configuration",
            exchange -> {
                exchange.getResponseHeaders().add("Content-Type", "application/json");
                exchange.sendResponseHeaders(200, body.length);
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(body);
                }
            }
        );
        server.start();
    }

    @AfterEach
    void stopDiscoveryServer() {
        if (server != null) {
            server.stop(0);
        }
    }

    @Test
    void fromIssuerLocationParsesDiscoveryDocumentWithMtlsEndpointAliases() {
        assertThatCode(
                () -> {
                    ClientRegistration registration = ClientRegistrations
                        .fromIssuerLocation(issuer)
                        .clientId("web_app")
                        .clientSecret("web_app")
                        .build();
                    assertThat(registration.getProviderDetails().getIssuerUri()).isEqualTo(issuer);
                    assertThat(registration.getProviderDetails().getAuthorizationUri())
                        .contains("/protocol/openid-connect/auth");
                }
            )
            .doesNotThrowAnyException();
    }
}

package tech.jhipster.controlcenter.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;

import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrations;

/**
 * Regression test for <a
 * href="https://github.com/jhipster/jhipster-control-center/issues/174">#174</a>.
 *
 * <p>Modern Keycloak releases (and other OIDC providers) advertise an
 * {@code mtls_endpoint_aliases} object in their discovery document. Older
 * versions of {@code com.nimbusds:oauth2-oidc-sdk} (7.x, the version
 * transitively brought in by spring-security 5.4.x) fail to parse that field
 * and throw {@code ParseException: Unexpected type of JSON object member with
 * key mtls_endpoint_aliases}, blocking the control-center from booting against
 * Keycloak 15+.
 *
 * <p>The fix is the 9.x version pin in {@code pom.xml}. This test serves a
 * minimal OIDC discovery document — populated with {@code
 * mtls_endpoint_aliases} — from an in-process HTTP server and verifies that
 * {@link ClientRegistrations#fromIssuerLocation(String)} parses it without
 * throwing.
 */
class OidcProviderMetadataParsingTest {

    @Test
    void parsesOidcMetadataContainingMtlsEndpointAliases() throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        try {
            int port = server.getAddress().getPort();
            String issuer = "http://127.0.0.1:" + port + "/auth/realms/jhipster";
            String metadata = oidcDiscoveryDocument(issuer, port);

            server.createContext(
                "/",
                exchange -> {
                    byte[] body = metadata.getBytes(StandardCharsets.UTF_8);
                    exchange.getResponseHeaders().add("Content-Type", "application/json");
                    exchange.sendResponseHeaders(200, body.length);
                    exchange.getResponseBody().write(body);
                    exchange.close();
                }
            );
            server.start();

            assertThatCode(() -> {
                ClientRegistration registration = ClientRegistrations
                    .fromIssuerLocation(issuer)
                    .clientId("web_app")
                    .clientSecret("web_app")
                    .build();

                assertThat(registration.getProviderDetails().getIssuerUri()).isEqualTo(issuer);
                assertThat(registration.getProviderDetails().getTokenUri())
                    .isEqualTo(issuer + "/protocol/openid-connect/token");
                assertThat(registration.getProviderDetails().getAuthorizationUri())
                    .isEqualTo(issuer + "/protocol/openid-connect/auth");
                assertThat(registration.getProviderDetails().getJwkSetUri())
                    .isEqualTo(issuer + "/protocol/openid-connect/certs");
            })
                .doesNotThrowAnyException();
        } finally {
            server.stop(0);
        }
    }

    /**
     * Minimal OIDC discovery document that includes the {@code
     * mtls_endpoint_aliases} object Keycloak advertises starting with version
     * 15. The field must be a JSON object whose values are endpoint URIs.
     */
    private static String oidcDiscoveryDocument(String issuer, int port) {
        return (
            "{" +
            "\"issuer\":\"" + issuer + "\"," +
            "\"authorization_endpoint\":\"" + issuer + "/protocol/openid-connect/auth\"," +
            "\"token_endpoint\":\"" + issuer + "/protocol/openid-connect/token\"," +
            "\"jwks_uri\":\"" + issuer + "/protocol/openid-connect/certs\"," +
            "\"response_types_supported\":[\"code\"]," +
            "\"subject_types_supported\":[\"public\"]," +
            "\"id_token_signing_alg_values_supported\":[\"RS256\"]," +
            "\"mtls_endpoint_aliases\":{" +
            "\"token_endpoint\":\"https://127.0.0.1:" + port + "/auth/realms/jhipster/protocol/openid-connect/token\"," +
            "\"revocation_endpoint\":\"https://127.0.0.1:" + port + "/auth/realms/jhipster/protocol/openid-connect/revoke\"," +
            "\"introspection_endpoint\":\"https://127.0.0.1:" + port + "/auth/realms/jhipster/protocol/openid-connect/introspect\"" +
            "}" +
            "}"
        );
    }
}

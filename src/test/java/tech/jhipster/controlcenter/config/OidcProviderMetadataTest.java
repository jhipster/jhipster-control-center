package tech.jhipster.controlcenter.config;

import static org.assertj.core.api.Assertions.assertThat;

import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrations;

class OidcProviderMetadataTest {

    @Test
    void oauth2ClientRegistrationAcceptsKeycloakMtlSEndpointAliases() throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        try {
            int port = server.getAddress().getPort();
            String issuer = "http://127.0.0.1:" + port + "/auth/realms/jhipster";
            String metadata = oidcMetadataWithMtlSEndpointAliases(issuer, port);

            server.createContext(
                "/",
                exchange -> {
                    byte[] response = metadata.getBytes(StandardCharsets.UTF_8);
                    exchange.getResponseHeaders().add("Content-Type", "application/json");
                    exchange.sendResponseHeaders(200, response.length);
                    exchange.getResponseBody().write(response);
                    exchange.close();
                }
            );
            server.start();

            ClientRegistration registration = ClientRegistrations
                .fromIssuerLocation(issuer)
                .clientId("web_app")
                .clientSecret("web_app")
                .build();

            assertThat(registration.getProviderDetails().getIssuerUri()).isEqualTo(issuer);
        } finally {
            server.stop(0);
        }
    }

    private static String oidcMetadataWithMtlSEndpointAliases(String issuer, int port) {
        return (
            "{" +
            "\"issuer\":\"" +
            issuer +
            "\"," +
            "\"authorization_endpoint\":\"" +
            issuer +
            "/protocol/openid-connect/auth\"," +
            "\"token_endpoint\":\"" +
            issuer +
            "/protocol/openid-connect/token\"," +
            "\"jwks_uri\":\"" +
            issuer +
            "/protocol/openid-connect/certs\"," +
            "\"response_types_supported\":[\"code\"]," +
            "\"subject_types_supported\":[\"public\"]," +
            "\"id_token_signing_alg_values_supported\":[\"RS256\"]," +
            "\"mtls_endpoint_aliases\":{\"token_endpoint\":\"https://127.0.0.1:" +
            port +
            "/auth/realms/jhipster/protocol/openid-connect/token\"}" +
            "}"
        );
    }
}

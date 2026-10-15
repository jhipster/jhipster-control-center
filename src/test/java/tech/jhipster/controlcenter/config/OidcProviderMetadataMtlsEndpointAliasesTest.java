package tech.jhipster.controlcenter.config;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nimbusds.oauth2.sdk.as.AuthorizationServerEndpointMetadata;
import com.nimbusds.openid.connect.sdk.op.OIDCProviderMetadata;
import com.sun.net.httpserver.HttpServer;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import net.minidev.json.JSONObject;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrations;
import org.springframework.security.oauth2.client.registration.ReactiveClientRegistrations;

class OidcProviderMetadataMtlsEndpointAliasesTest {

    private static final String DISCOVERY_JSON_TEMPLATE =
        "{\n" +
        "  \"issuer\": \"%s\",\n" +
        "  \"authorization_endpoint\": \"%s/protocol/openid-connect/auth\",\n" +
        "  \"token_endpoint\": \"%s/protocol/openid-connect/token\",\n" +
        "  \"userinfo_endpoint\": \"%s/protocol/openid-connect/userinfo\",\n" +
        "  \"jwks_uri\": \"%s/protocol/openid-connect/certs\",\n" +
        "  \"response_types_supported\": [\"code\", \"id_token\", \"token id_token\"],\n" +
        "  \"subject_types_supported\": [\"public\", \"pairwise\"],\n" +
        "  \"id_token_signing_alg_values_supported\": [\"RS256\"],\n" +
        "  \"mtls_endpoint_aliases\": {\n" +
        "    \"token_endpoint\": \"%s/protocol/openid-connect/token\",\n" +
        "    \"revocation_endpoint\": \"%s/protocol/openid-connect/revoke\",\n" +
        "    \"introspection_endpoint\": \"%s/protocol/openid-connect/token/introspect\"\n" +
        "  }\n" +
        "}";

    @Test
    void shouldParseOidcMetadataWithJacksonDeserializedMtlsEndpointAliases() throws Exception {
        String issuer = "https://keycloak.example.com/auth/realms/jhipster";
        String json = String.format(DISCOVERY_JSON_TEMPLATE, issuer, issuer, issuer, issuer, issuer, issuer, issuer, issuer);

        ObjectMapper mapper = new ObjectMapper();
        Map<String, Object> configuration = mapper.readValue(json, new TypeReference<Map<String, Object>>() {});

        assertThat(configuration.get("mtls_endpoint_aliases"))
            .isInstanceOf(Map.class)
            .isNotInstanceOf(JSONObject.class);

        OIDCProviderMetadata metadata = OIDCProviderMetadata.parse(new JSONObject(configuration));

        assertThat(metadata.getIssuer().getValue()).isEqualTo(issuer);
        AuthorizationServerEndpointMetadata mtlsAliases = metadata.getMtlsEndpointAliases();
        assertThat(mtlsAliases).isNotNull();
        assertThat(mtlsAliases.getTokenEndpointURI())
            .isEqualTo(URI.create(issuer + "/protocol/openid-connect/token"));
        assertThat(mtlsAliases.getRevocationEndpointURI())
            .isEqualTo(URI.create(issuer + "/protocol/openid-connect/revoke"));
        assertThat(mtlsAliases.getIntrospectionEndpointURI())
            .isEqualTo(URI.create(issuer + "/protocol/openid-connect/token/introspect"));
    }

    @Test
    void shouldBuildClientRegistrationFromIssuerWithMtlsEndpointAliases() throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        try {
            int port = server.getAddress().getPort();
            String issuer = "http://127.0.0.1:" + port + "/auth/realms/jhipster";
            byte[] responseBytes = String
                .format(DISCOVERY_JSON_TEMPLATE, issuer, issuer, issuer, issuer, issuer, issuer, issuer, issuer)
                .getBytes(StandardCharsets.UTF_8);

            server.createContext(
                "/auth/realms/jhipster/.well-known/openid-configuration",
                exchange -> {
                    exchange.getResponseHeaders().add("Content-Type", "application/json");
                    exchange.sendResponseHeaders(200, responseBytes.length);
                    try (OutputStream os = exchange.getResponseBody()) {
                        os.write(responseBytes);
                    }
                }
            );
            server.start();

            ClientRegistration syncRegistration = ClientRegistrations
                .fromOidcIssuerLocation(issuer)
                .registrationId("oidc")
                .clientId("web_app")
                .build();
            assertThat(syncRegistration.getProviderDetails().getIssuerUri()).isEqualTo(issuer);
            assertThat(syncRegistration.getProviderDetails().getConfigurationMetadata())
                .containsKey("mtls_endpoint_aliases");

            ClientRegistration reactiveRegistration = ReactiveClientRegistrations
                .fromOidcIssuerLocation(issuer)
                .registrationId("oidc")
                .clientId("web_app")
                .build();
            assertThat(reactiveRegistration.getProviderDetails().getIssuerUri()).isEqualTo(issuer);
            assertThat(reactiveRegistration.getProviderDetails().getConfigurationMetadata())
                .containsKey("mtls_endpoint_aliases");
        } finally {
            server.stop(0);
        }
    }
}

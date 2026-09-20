package tech.jhipster.controlcenter.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;

import com.nimbusds.oauth2.sdk.as.AuthorizationServerEndpointMetadata;
import com.nimbusds.openid.connect.sdk.op.OIDCProviderMetadata;
import java.net.URI;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import net.minidev.json.JSONObject;
import org.junit.jupiter.api.Test;

/**
 * Regression coverage for
 * <a href="https://github.com/jhipster/jhipster-control-center/issues/174">#174</a>.
 *
 * <p>Keycloak 12 and later advertise an {@code mtls_endpoint_aliases} object in their OpenID
 * Connect discovery document, and the control center fails to start against them with
 * {@code ParseException: Unexpected type of JSON object member with key mtls_endpoint_aliases}.
 *
 * <p>The failure depends on <em>how</em> the document reaches Nimbus, not on the document
 * itself. {@code ClientRegistrations} does not hand Nimbus the raw JSON text: it reads the
 * discovery document into a {@code Map} with Jackson and then calls
 * {@code OIDCProviderMetadata.parse(new JSONObject(map))}. That constructor copies only the top
 * level, so the nested {@code mtls_endpoint_aliases} value stays a {@code java.util.LinkedHashMap}
 * rather than becoming a {@code net.minidev.json.JSONObject}. Older {@code oauth2-oidc-sdk}
 * releases require that nested member to be a {@code JSONObject} exactly and reject the map.
 *
 * <p>This is why parsing the same document from a {@code String} always succeeds — the SDK's own
 * parser produces {@code JSONObject} for nested members — and why the test below deliberately
 * reproduces the shallow-map shape instead.
 */
class OidcMetadataMtlsAliasesTest {

    private static final String ISSUER = "http://keycloak:9080/auth/realms/jhipster";

    private static final String MTLS_TOKEN_ENDPOINT = ISSUER + "/protocol/openid-connect/token/mtls";

    private static final String MTLS_AUTHORIZATION_ENDPOINT = ISSUER + "/protocol/openid-connect/auth/mtls";

    private static List<String> array(String... values) {
        // Jackson presents discovery arrays as Java lists on the startup path.
        return new ArrayList<>(Arrays.asList(values));
    }

    /**
     * Builds the discovery document the way {@code ClientRegistrations} presents it to Nimbus:
     * a top-level {@link JSONObject} shallow-copied from a Jackson map, whose nested
     * {@code mtls_endpoint_aliases} member is still a plain {@link LinkedHashMap}.
     *
     * @param withMtlsAliases whether to advertise the {@code mtls_endpoint_aliases} object.
     */
    private static JSONObject discoveryDocumentAsSpringSecurityBuildsIt(boolean withMtlsAliases) {
        Map<String, Object> document = new LinkedHashMap<>();
        document.put("issuer", ISSUER);
        document.put("authorization_endpoint", ISSUER + "/protocol/openid-connect/auth");
        document.put("token_endpoint", ISSUER + "/protocol/openid-connect/token");
        document.put("jwks_uri", ISSUER + "/protocol/openid-connect/certs");
        document.put("response_types_supported", array("code", "id_token", "token id_token"));
        document.put("subject_types_supported", array("public", "pairwise"));
        document.put("id_token_signing_alg_values_supported", array("RS256"));

        if (withMtlsAliases) {
            Map<String, Object> aliases = new LinkedHashMap<>();
            aliases.put("token_endpoint", MTLS_TOKEN_ENDPOINT);
            aliases.put("authorization_endpoint", MTLS_AUTHORIZATION_ENDPOINT);
            document.put("mtls_endpoint_aliases", aliases);
        }

        return new JSONObject(document);
    }

    @Test
    void parsesMetadataWhenMtlsEndpointAliasesArrivesAsAPlainMap() {
        JSONObject document = discoveryDocumentAsSpringSecurityBuildsIt(true);

        assertThat(document.get("mtls_endpoint_aliases"))
            .as("the nested member must stay a plain map to reproduce the reported failure")
            .isInstanceOf(Map.class)
            .isNotInstanceOf(JSONObject.class);

        assertThatCode(() -> OIDCProviderMetadata.parse(document)).doesNotThrowAnyException();
    }

    @Test
    void retainsMtlsEndpointAliasesInsteadOfDiscardingThem() throws Exception {
        OIDCProviderMetadata metadata = OIDCProviderMetadata.parse(discoveryDocumentAsSpringSecurityBuildsIt(true));

        assertThat(metadata.getIssuer().getValue()).isEqualTo(ISSUER);

        AuthorizationServerEndpointMetadata aliases = metadata.getMtlsEndpointAliases();
        assertThat(aliases).as("mtls_endpoint_aliases must be parsed, not skipped").isNotNull();
        assertThat(aliases.getTokenEndpointURI()).isEqualTo(URI.create(MTLS_TOKEN_ENDPOINT));
        assertThat(aliases.getAuthorizationEndpointURI()).isEqualTo(URI.create(MTLS_AUTHORIZATION_ENDPOINT));
    }

    @Test
    void stillParsesDiscoveryDocumentWithoutMtlsEndpointAliases() throws Exception {
        OIDCProviderMetadata metadata = OIDCProviderMetadata.parse(discoveryDocumentAsSpringSecurityBuildsIt(false));

        assertThat(metadata.getIssuer().getValue()).isEqualTo(ISSUER);
        assertThat(metadata.getMtlsEndpointAliases()).isNull();
    }
}

package tech.jhipster.controlcenter.security.oauth2;

import static org.assertj.core.api.Assertions.assertThat;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.gen.RSAKeyGenerator;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import java.time.Instant;
import java.util.Date;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.NimbusReactiveJwtDecoder;

/**
 * Guard for the Nimbus dependency versions pinned for
 * <a href="https://github.com/jhipster/jhipster-control-center/issues/174">#174</a>.
 *
 * <p>{@code oauth2-oidc-sdk} 9.x is built against nimbus-jose-jwt 9.x, but
 * {@code spring-security-oauth2-jose} 5.4.x expects nimbus-jose-jwt 8.x: from 9.x on,
 * {@code Header.toJSONObject()} returns a {@code Map} instead of a {@code JSONObject} and JWT
 * decoding fails with {@code NoSuchMethodError}. Bumping nimbus-jose-jwt without moving the
 * Spring Security generation breaks ID token validation, so keep this test passing when
 * changing those versions.
 */
class NimbusJoseJwtCompatibilityTest {

    @Test
    void shouldDecodeIdTokenSignedByThePinnedNimbusVersion() throws Exception {
        RSAKey signingKey = new RSAKeyGenerator(2048).keyID("jhipster-control-center").generate();
        JWTClaimsSet claims = new JWTClaimsSet.Builder()
            .subject("jhipster-control-center")
            .issuer("https://jhipster.org")
            .issueTime(Date.from(Instant.now().minusSeconds(30)))
            .expirationTime(Date.from(Instant.now().plusSeconds(3600)))
            .build();
        SignedJWT idToken = new SignedJWT(new JWSHeader.Builder(JWSAlgorithm.RS256).keyID(signingKey.getKeyID()).build(), claims);
        idToken.sign(new RSASSASigner(signingKey));

        NimbusReactiveJwtDecoder jwtDecoder = NimbusReactiveJwtDecoder.withPublicKey(signingKey.toRSAPublicKey()).build();
        Jwt decodedIdToken = jwtDecoder.decode(idToken.serialize()).block();

        assertThat(decodedIdToken).isNotNull();
        assertThat(decodedIdToken.getSubject()).isEqualTo("jhipster-control-center");
        assertThat(decodedIdToken.getIssuer().toString()).isEqualTo("https://jhipster.org");
    }
}

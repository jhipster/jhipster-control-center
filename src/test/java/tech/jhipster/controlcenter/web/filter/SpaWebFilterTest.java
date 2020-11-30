package tech.jhipster.controlcenter.web.filter;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.URI;
import java.time.Duration;
import org.junit.jupiter.api.Test;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;
import reactor.util.annotation.NonNull;

/**
 * Tests for the {@link SpaWebFilter}.
 */
public class SpaWebFilterTest {
    private final SpaWebFilter spaWebFilter = new SpaWebFilter();
    private final TestWebFilterChain filterChain = new TestWebFilterChain();

    @Test
    public void testFilterPass() {
        String[] authorizedPath = { "/api", "/management", "/login", "/gateway", "/services", "/swagger", "/v2/api-docs" };

        for (String path : authorizedPath) {
            MockServerHttpRequest.BaseBuilder<?> request = MockServerHttpRequest.get(path);
            MockServerWebExchange exchange = MockServerWebExchange.from(request);
            spaWebFilter.filter(exchange, filterChain).block(Duration.ZERO);
            assertThat(this.filterChain.getUri()).hasPath(path);
        }
    }

    @Test
    public void testFilterGoToIndex() {
        String[] someWrongPath = { "/test", "//test", "/test/test" };

        for (String wrongPath : someWrongPath) {
            MockServerHttpRequest.BaseBuilder<?> request = MockServerHttpRequest.get(wrongPath);
            MockServerWebExchange exchange = MockServerWebExchange.from(request);
            spaWebFilter.filter(exchange, filterChain).block(Duration.ZERO);
            assertThat(this.filterChain.getUri()).hasPath("/index.html");
        }
    }

    private static class TestWebFilterChain implements WebFilterChain {
        private URI uri;

        public URI getUri() {
            return uri;
        }

        @Override
        @NonNull
        public Mono<Void> filter(ServerWebExchange exchange) {
            this.uri = exchange.getRequest().getURI();
            return Mono.empty();
        }
    }
}

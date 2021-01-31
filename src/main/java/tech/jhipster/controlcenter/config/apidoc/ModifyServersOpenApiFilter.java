package tech.jhipster.controlcenter.config.apidoc;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import java.nio.charset.Charset;
import java.util.List;
import org.reactivestreams.Publisher;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferFactory;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.core.io.buffer.DefaultDataBufferFactory;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.http.server.reactive.ServerHttpResponseDecorator;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Component
public class ModifyServersOpenApiFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();
        if (path.startsWith("/gateway") && path.contains("/v3/api-docs")) {
            ServerHttpResponse originalResponse = exchange.getResponse();
            DataBufferFactory bufferFactory = originalResponse.bufferFactory();
            ServerHttpResponseDecorator decoratedResponse = createModifyServersOpenApiInterceptor(path, originalResponse, bufferFactory);

            // replace response with decorator
            return chain.filter(exchange.mutate().response(decoratedResponse).build());
        } else {
            return chain.filter(exchange);
        }
    }

    @Override
    public int getOrder() {
        return -1;
    }

    public ModifyServersOpenApiInterceptor createModifyServersOpenApiInterceptor(
        String path,
        ServerHttpResponse originalResponse,
        DataBufferFactory bufferFactory
    ) {
        return new ModifyServersOpenApiInterceptor(path, originalResponse, bufferFactory);
    }

    public class ModifyServersOpenApiInterceptor extends ServerHttpResponseDecorator {

        private final String path;
        private final ServerHttpResponse originalResponse;
        private final DataBufferFactory bufferFactory;
        private String rewritedBody = "";

        private ModifyServersOpenApiInterceptor(String path, ServerHttpResponse originalResponse, DataBufferFactory bufferFactory) {
            super(originalResponse);
            this.path = path;
            this.originalResponse = originalResponse;
            this.bufferFactory = bufferFactory;
        }

        public String getRewritedBody() {
            return rewritedBody;
        }

        @Override
        public Mono<Void> writeWith(Publisher<? extends DataBuffer> body) {
            this.rewritedBody = "";
            if (body instanceof Flux) {
                Flux<? extends DataBuffer> fluxBody = (Flux<? extends DataBuffer>) body;

                return super.writeWith(fluxBody.buffer().map(dataBuffers -> rewriteBodyWithServers(dataBuffers)));
            }
            // when body is not a flux
            return super.writeWith(body);
        }

        private DataBuffer rewriteBodyWithServers(List<? extends DataBuffer> dataBuffers) {
            DataBufferFactory dataBufferFactory = new DefaultDataBufferFactory();
            DataBuffer join = dataBufferFactory.join(dataBuffers);
            byte[] content = new byte[join.readableByteCount()];
            join.read(content);

            // release memory
            DataBufferUtils.release(join);
            String strBody = new String(content, Charset.forName("UTF-8"));

            // create custom server
            Gson g = new Gson();
            JsonObject jsonBody = g.fromJson(strBody, JsonObject.class);
            JsonObject serversToJson = new JsonObject();
            serversToJson.addProperty("url", path.replace("/v3/api-docs", ""));
            serversToJson.addProperty("description", "added by global filter");

            // add custom server
            JsonArray servers = new JsonArray();
            servers.add(serversToJson);
            jsonBody.add("servers", servers);

            this.rewritedBody = jsonBody.toString();
            originalResponse.getHeaders().setContentLength(this.rewritedBody.getBytes().length);
            return bufferFactory.wrap(this.rewritedBody.getBytes());
        }
    }
}

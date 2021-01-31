package tech.jhipster.controlcenter.web.rest;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import javax.validation.Valid;
import org.springframework.cloud.client.DefaultServiceInstance;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.cloud.client.discovery.simple.SimpleDiscoveryProperties;
import org.springframework.cloud.context.scope.refresh.RefreshScopeRefreshedEvent;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tech.jhipster.controlcenter.web.rest.vm.ServiceInstanceVM;

/**
 * Controller for viewing service discovery data.
 */
@RestController
@RequestMapping("/api")
public class ServiceDiscoveryResource {

    private final DiscoveryClient discoveryClient;

    private final SimpleDiscoveryProperties simpleDiscoveryProperties;

    private final Environment env;

    private final ApplicationEventPublisher publisher;

    public ServiceDiscoveryResource(
        DiscoveryClient discoveryClient,
        SimpleDiscoveryProperties simpleDiscoveryProperties,
        Environment env,
        ApplicationEventPublisher publisher
    ) {
        this.discoveryClient = discoveryClient;
        this.simpleDiscoveryProperties = simpleDiscoveryProperties;
        this.env = env;
        this.publisher = publisher;
    }

    /**
     * GET /service-discovery/instances : Get all service instances
     * registered to the service discovery provider.
     */
    @GetMapping("/services/instances")
    public ResponseEntity<List<ServiceInstance>> getAllServiceInstances() {
        Map<String, List<ServiceInstance>> instances = discoveryClient
            .getServices()
            .stream()
            .collect(Collectors.toMap(Function.identity(), discoveryClient::getInstances));
        List<ServiceInstance> res = instances.values().stream().flatMap(Collection::stream).collect(Collectors.toList());
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    /**
     * POST /service-discovery/instances : add a static service instance.
     */
    @PostMapping("/services/instances")
    public ResponseEntity<ServiceInstance> addStaticServiceInstance(@Valid @RequestBody ServiceInstanceVM serviceInstanceVM)
        throws URISyntaxException, IOException {
        if (Arrays.stream(this.env.getActiveProfiles()).anyMatch("static"::equals)) {
            // create static instance
            URI uri = new URI(serviceInstanceVM.getUrl());
            DefaultServiceInstance staticInstance = new DefaultServiceInstance();
            staticInstance.setUri(uri);
            staticInstance.setServiceId(serviceInstanceVM.getServiceId());
            staticInstance.setInstanceId(serviceInstanceVM.getServiceId());

            // add static instance in our discovery client
            Map<String, List<DefaultServiceInstance>> instances = new HashMap<>();
            instances.putAll(simpleDiscoveryProperties.getInstances());
            instances.put(staticInstance.getServiceId(), List.of(staticInstance));
            simpleDiscoveryProperties.setInstances(instances);

            // send a spring application event to refresh beans
            publisher.publishEvent(new RefreshScopeRefreshedEvent());

            return new ResponseEntity<>(staticInstance, HttpStatus.CREATED);
        } else {
            return new ResponseEntity<>(HttpStatus.METHOD_NOT_ALLOWED);
        }
    }

    /**
     * GET /service/{serviceId} : Get service instances for a given service ID.
     */
    @GetMapping("/services/{serviceId}")
    public ResponseEntity<List<ServiceInstance>> getAllServiceInstancesForServiceId(@PathVariable String serviceId) {
        return new ResponseEntity<>(discoveryClient.getInstances(serviceId), HttpStatus.OK);
    }

    /**
     * DELETE /service/{serviceId} : remove a static service instance for a given service ID.
     */
    @DeleteMapping("/services/{serviceId}")
    public ResponseEntity<Void> removeStaticServiceInstance(@PathVariable String serviceId) {
        if (Arrays.stream(this.env.getActiveProfiles()).anyMatch("static"::equals)) {
            // remove static instance in our discovery client
            simpleDiscoveryProperties.getInstances().remove(serviceId);

            // send a spring application event to refresh beans
            publisher.publishEvent(new RefreshScopeRefreshedEvent());

            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.METHOD_NOT_ALLOWED);
        }
    }
}

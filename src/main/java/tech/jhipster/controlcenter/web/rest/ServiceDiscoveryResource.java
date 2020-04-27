package tech.jhipster.controlcenter.web.rest;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller for viewing service discovery data.
 */
@RestController
@RequestMapping("/api")
public class ServiceDiscoveryResource {
    private final Logger log = LoggerFactory.getLogger(ServiceDiscoveryResource.class);

    private final DiscoveryClient discoveryClient;

    public ServiceDiscoveryResource(DiscoveryClient discoveryClient) {
        this.discoveryClient = discoveryClient;
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
     * GET /service/{serviceId} : Get service instances for a given service ID.
     */
    @GetMapping("/services/{serviceId}")
    public ResponseEntity<List<ServiceInstance>> getAllServiceInstancesForServiceId(@PathVariable String serviceId) {
        return new ResponseEntity<>(discoveryClient.getInstances(serviceId), HttpStatus.OK);
    }
}

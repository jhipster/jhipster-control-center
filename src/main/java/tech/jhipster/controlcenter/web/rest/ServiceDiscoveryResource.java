package tech.jhipster.controlcenter.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import javax.validation.Valid;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.cloud.client.discovery.simple.SimpleDiscoveryProperties;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

    private final Environment env;

    private final DiscoveryClient discoveryClient;

    private List<ServiceInstance> staticInstances;

    public ServiceDiscoveryResource(Environment env, DiscoveryClient discoveryClient) {
        this.env = env;
        this.discoveryClient = discoveryClient;
        this.staticInstances = new ArrayList<>();
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
        if (Arrays.stream(this.env.getActiveProfiles()).anyMatch("static"::equals)) {
            res.addAll(staticInstances);
        }
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    /**
     * POST /service-discovery/instances : add a static service instance.
     */
    @PostMapping("/services/instances")
    public ResponseEntity<ServiceInstance> addServiceInstance(@Valid @RequestBody ServiceInstanceVM serviceInstanceVM)
        throws URISyntaxException {
        URI uri = new URI(serviceInstanceVM.getUrl());
        SimpleDiscoveryProperties.SimpleServiceInstance instance = new SimpleDiscoveryProperties.SimpleServiceInstance(uri);
        instance.setServiceId(serviceInstanceVM.getServiceId());
        staticInstances.add(instance);
        return new ResponseEntity<>(instance, HttpStatus.CREATED);
    }

    /**
     * GET /service/{serviceId} : Get service instances for a given service ID.
     */
    @GetMapping("/services/{serviceId}")
    public ResponseEntity<List<ServiceInstance>> getAllServiceInstancesForServiceId(@PathVariable String serviceId) {
        return new ResponseEntity<>(discoveryClient.getInstances(serviceId), HttpStatus.OK);
    }
}

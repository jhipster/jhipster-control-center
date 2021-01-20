package tech.jhipster.controlcenter.web.rest.vm;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

/**
 * View Model object for storing static instances
 */
public class ServiceInstanceVM {

    @NotNull
    @Size(min = 1, max = 250)
    private String serviceId;

    @NotNull
    @Size(min = 1, max = 250)
    private String url;

    public String getServiceId() {
        return serviceId;
    }

    public void setServiceId(String serviceId) {
        this.serviceId = serviceId;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ServiceInstanceVM{" +
            "serviceId='" + serviceId + '\'' +
            "url='" + url +
            '}';
    }
}

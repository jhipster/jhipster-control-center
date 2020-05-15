# Central configuration sources details

The JHipster-Registry will use the following directories as its configuration source :

- localhost-config : when running the registry in docker with the jhipster-registry.yml docker-compose file
- docker-config : when running the registry and the app both in docker with the app.yml docker-compose file

For more info, refer to https://www.jhipster.tech/jhipster-registry/#spring-cloud-config

When running the consul.yml or app.yml docker-compose files, files located in `central-server-config/`
will get automatically loaded in Consul's K/V store. Adding or editing files will trigger a reloading.

For more info, refer to https://www.jhipster.tech/consul/

#!/bin/bash
set -euo pipefail

docker_compose() {
    if command -v docker-compose >/dev/null 2>&1; then
        docker-compose "$@"
        return
    fi

    docker compose "$@"
}

#-------------------------------------------------------------------------------
# Start docker container
#-------------------------------------------------------------------------------

if [[ "$JHI_APP" == *"eureka"* ]] && [[ -a src/main/docker/jhipster-registry.yml ]]; then
    docker_compose -f src/main/docker/jhipster-registry.yml up -d
    sleep 10
    docker ps -a
fi

if [[ "$JHI_APP" == *"consul"* ]] && [[ -a src/main/docker/consul.yml ]]; then
    docker_compose -f src/main/docker/consul.yml up -d
    sleep 10
    docker ps -a
fi

if [[ "$JHI_APP" == *"oauth2"* ]] && [[ -a src/main/docker/keycloak.yml ]]; then
    docker_compose -f src/main/docker/keycloak.yml up -d
    sleep 10
    docker ps -a
fi

#-------------------------------------------------------------------------------
# Run the application
#-------------------------------------------------------------------------------

java \
    -jar ./target/jhipster-control-center-*.jar \
    jhipster-control-center-*.jar \
    --spring.profiles.active="$JHI_PROFILE" & \

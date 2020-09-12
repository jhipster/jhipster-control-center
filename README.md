# jhipsterControlCenter

This application was generated using JHipster 6.10.1, you can find documentation and help at [https://www.jhipster.tech/documentation-archive/v6.10.1](https://www.jhipster.tech/documentation-archive/v6.10.1).

## JHipster Control Center

### Specific Spring profiles

In order to work properly, the Control Center has to be started with a spring profile corresponding to a Spring Cloud discovery backend

- `eureka`: Connect to an Eureka server and fetch its registered instances, configured in `application-eureka.yml`
- `consul`: Connect to a Consul server and fetch its registered instances, configured in `application-consul.yml`
- `static`: Uses a static list of instances provided as properties, configured in `application-static.yml`
- `oauth2`: Uses the OAuth stateful security mechanism using the Keycloack OpenID Connect Server, configured in `application-oauth2.yml`
- `kubernetes`: Experimental kubernetes integration, configured in `application-kubernetes.yml`. Refer to [this sample repo for detailed instructions](https://github.com/cedric-lamalle/jhipster-control-center-k8s-sample)

### Control Center API

- `localhost:7419/api/services/instances`: get registered instances
- `localhost:7419/management/gateway/routes`: get Spring Cloud Gateway routes
- `localhost:7419/gateway/<serviceName>/<instanceName>/<urlPath>`: proxy request to `instanceName`'s urlPath.
  For example, when using Eureka, it would look like: `localhost:7419/gateway/eurekaservice1/eurekaservice1:3d38fb89771e502111b495064d739ef8/management/info`

## Running locally

### Step 1 : Run server used by Spring Cloud discovery backend

Eureka,Consul and Keycloak docker-compose files exist under `src/main/docker` to ease testing the project.

- for Consul : run `docker-compose -f src/main/docker/consul.yml up -d`
- for Eureka : run `docker-compose -f src/main/docker/jhipster-registry.yml up -d`
- for OAuth security mechanism (using Keycloak) mode: run `docker-compose -f src/main/docker/keycloak.yml up -d`

For Kubernetes: refer to [this sample repository](https://github.com/cedric-lamalle/jhipster-control-center-k8s-sample)
### Step 2 : Run the cloned project

- For development, using the JWT security mechanism (the default), run `./mvnw -Dspring.profiles.active=consul,dev` or `./mvnw -Dspring.profiles.active=eureka,dev`.
- For development, using the OAuth security mechanism, run `./mvnw -Dspring.profiles.active=consul,dev,oauth2` or `./mvnw -Dspring.profiles.active=eureka,dev,oauth2`. Make sure the Keycloak server is up and running.
- To just start in development run `./mvnw` and `npm install && npm start` in another terminal pane for hot reload of client side code.

## Running from Docker

A container image has been made available on Docker hub.To use it, run `docker pull jhipster/jhipster-control-center` and `docker run -d --name jhcc -p 7419:7419 jhipster/jhipster-control-center:latest`

## Development

Before you can build this project, you must install and configure the following dependencies on your machine:

1. [Node.js][]: We use Node to run a development web server and build the project.
   Depending on your system, you can install Node either from source or as a pre-packaged bundle.

After installing Node, you should be able to run the following command to install development tools.
You will only need to run this command when dependencies change in [package.json](package.json).

    npm install

We use npm scripts and [Webpack][] as our build system.

Run the following commands in two separate terminals to create a blissful development experience where your browser
auto-refreshes when files change on your hard drive.

    ./mvnw
    npm start

Npm is also used to manage CSS and JavaScript dependencies used in this application. You can upgrade dependencies by
specifying a newer version in [package.json](package.json). You can also run `npm update` and `npm install` to manage dependencies.
Add the `help` flag on any command to see how you can use it. For example, `npm help update`.

The `npm run` command will list all of the scripts available to run for this project.

### Service workers

Service workers are commented by default, to enable them please uncomment the following code.

- The service worker registering script in index.html

```html
<script>
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').then(function () {
      console.log('Service Worker Registered');
    });
  }
</script>
```

Note: workbox creates the respective service worker and dynamically generate the `service-worker.js`

### Managing dependencies

For example, to add [Leaflet][] library as a runtime dependency of your application, you would run following command:

    npm install --save --save-exact leaflet

To benefit from TypeScript type definitions from [DefinitelyTyped][] repository in development, you would run following command:

    npm install --save-dev --save-exact @types/leaflet

Then you would import the JS and CSS files specified in library's installation instructions so that [Webpack][] knows about them:
Edit [src/main/webapp/app/main.ts](src/main/webapp/app/main.ts) file:

```
import 'leaflet/dist/leaflet.js';
```

Edit [src/main/webapp/content/scss/vendor.scss](src/main/webapp/content/scss/vendor.scss) file:

```
@import '~leaflet/dist/leaflet.scss';
```

Note: there are still few other things remaining to do for Leaflet that we won't detail here.

For further instructions on how to develop with JHipster, have a look at [Using JHipster in development][].

### Using vue-cli

You can also use [Vue CLI][] to display the project using vue UI.

For example, the following command:

    vue ui

will generate open Vue Project Manager. From there, you'll be able to manage your project as any other Vue.js projects.

## Building for production

### Packaging as jar

To build the final jar and optimize the jhipsterControlCenter application for production, run:

    ./mvnw -Pprod clean verify

This will concatenate and minify the client CSS and JavaScript files. It will also modify `index.html` so it references these new files.
To ensure everything worked, run:

    java -jar target/*.jar

Then navigate to [http://localhost:7419](http://localhost:7419) in your browser.

Refer to [Using JHipster in production][] for more details.

### Packaging as war

To package your application as a war in order to deploy it to an application server, run:

    ./mvnw -Pprod,war clean verify

## Testing

To launch your application's tests, run:
./mvnw verify

### Client tests

Unit tests are run by [Jest][] and written with [Jasmine][]. They're located in [src/test/javascript/](src/test/javascript/) and can be run with:
npm test

For more information, refer to the [Running tests page][].

### Code quality

Sonar is used to analyse code quality. You can start a local Sonar server (accessible on http://localhost:9001) with:

```
docker-compose -f src/main/docker/sonar.yml up -d
```

You can run a Sonar analysis with using the [sonar-scanner](https://docs.sonarqube.org/display/SCAN/Analyzing+with+SonarQube+Scanner) or by using the maven plugin.
Then, run a Sonar analysis:

```
./mvnw -Pprod clean verify sonar:sonar
```

If you need to re-run the Sonar phase, please be sure to specify at least the `initialize` phase since Sonar properties are loaded from the sonar-project.properties file.

```
./mvnw initialize sonar:sonar
```

or
For more information, refer to the [Code quality page][].

## Using Docker to simplify development (optional)

You can use Docker to improve your JHipster development experience. A number of docker-compose configuration are available in the [src/main/docker](src/main/docker) folder to launch required third party services.

You can also fully dockerize your application and all the services that it depends on.
To achieve this, first build a docker image of your app by running:
./mvnw -Pprod verify jib:dockerBuild
Then run:
docker-compose -f src/main/docker/app.yml up -d
For more information refer to [Using Docker and Docker-Compose][], this page also contains information on the docker-compose sub-generator (`jhipster docker-compose`), which is able to generate docker configurations for one or several JHipster applications.

## Continuous Integration (optional)

To configure CI for your project, run the ci-cd sub-generator (`jhipster ci-cd`), this will let you generate configuration files for a number of Continuous Integration systems. Consult the [Setting up Continuous Integration][] page for more information.

[jhipster homepage and latest documentation]: https://www.jhipster.tech
[jhipster 6.10.1 archive]: https://www.jhipster.tech/documentation-archive/v6.10.1
[using jhipster in development]: https://www.jhipster.tech/documentation-archive/v6.10.1/development/
[using docker and docker-compose]: https://www.jhipster.tech/documentation-archive/v6.10.1/docker-compose
[using jhipster in production]: https://www.jhipster.tech/documentation-archive/v6.10.1/production/
[running tests page]: https://www.jhipster.tech/documentation-archive/v6.10.1/running-tests/
[code quality page]: https://www.jhipster.tech/documentation-archive/v6.10.1/code-quality/
[setting up continuous integration]: https://www.jhipster.tech/documentation-archive/v6.10.1/setting-up-ci/
[node.js]: https://nodejs.org/
[yarn]: https://yarnpkg.org/
[webpack]: https://webpack.github.io/
[vue cli]: https://cli.vuejs.org/
[browsersync]: https://www.browsersync.io/
[jest]: https://facebook.github.io/jest/
[jasmine]: https://jasmine.github.io/2.0/introduction.html
[protractor]: https://www.protractortest.org/
[leaflet]: https://leafletjs.com/
[definitelytyped]: https://definitelytyped.org/

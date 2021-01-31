# jhipsterControlCenter

This application was generated using JHipster 7.0.0-beta.1, you can find documentation and help at [https://www.jhipster.tech/documentation-archive/v7.0.0-beta.1](https://www.jhipster.tech/documentation-archive/v7.0.0-beta.1).

## JHipster Control Center

[![Application CI][github-application-ci]][github-actions] [![Docker Pulls][docker-hub-pulls]][docker-hub-url]

[![sonar-quality-gate][sonar-quality-gate]][sonar-url] [![sonar-coverage][sonar-coverage]][sonar-url] [![sonar-bugs][sonar-bugs]][sonar-url] [![sonar-vulnerabilities][sonar-vulnerabilities]][sonar-url]

### Specific Spring profiles

In order to work properly, the Control Center has to be started with a spring profile corresponding to a Spring Cloud discovery backend

- `eureka`: Connect to an Eureka server and fetch its registered instances, configured in `application-eureka.yml`
- `consul`: Connect to a Consul server and fetch its registered instances, configured in `application-consul.yml`
- `static`: Uses a static list of instances provided as properties, configured in `application-static.yml`
- `kubernetes`: To be developed

### Control Center API

- `localhost:7419/api/services/instances`: get registered instances
- `localhost:7419/management/gateway/routes`: get Spring Cloud Gateway routes
- `localhost:7419/gateway/<serviceName>/<instanceName>/<urlPath>`: proxy request to `instanceName`'s urlPath.
  For example, when using Eureka, it would look like: `localhost:7419/gateway/eurekaservice1/eurekaservice1:3d38fb89771e502111b495064d739ef8/management/info`

## Running locally

### Step 1 : Run server used by Spring Cloud discovery backend

Eureka and Consul docker-compose files exist under `src/main/docker` to ease testing the project.

- for Consul : run `docker-compose -f src/main/docker/consul.yml up -d`
- for Eureka : run `docker-compose -f src/main/docker/jhipster-registry.yml up -d`
- Otherwise, to use a static list of instances, you can directly go to the next step.

### Step 2 : Choose your authentication profile

There is 2 types of authentication.

- JWT : This is the default authentication, if you choose this one, you have to do nothing.
- OAuth2 : To use OAuth2 authentication, you have to launch Keycloak. Run `docker-compose -f src/main/docker/keycloak.yml up -d`

### Step 3 : Run the cloned project

Run the Control Center according to the specific spring profiles you want, here are some examples:

- For development with JWT and Consul, run ./mvnw -Dspring.profiles.active=consul,dev
- For development with JWT and Eureka, run./mvnw -Dspring.profiles.active=eureka,dev
- For development with JWT and a static list of instances, run ./mvnw -Dspring.profiles.active=static,dev
- For development with OAuth2 and Consul, run ./mvnw -Dspring.profiles.active=consul,dev,oauth2
- For development with OAuth2 and Eureka, run ./mvnw -Dspring.profiles.active=eureka,dev,oauth2
- To just start in development run ./mvnw and in another terminal run npm start for hot reload of client side code

## Running from Docker

A container image has been made available on Docker hub.To use it, run `docker pull jhipster/jhipster-control-center` and `docker run -d --name jhcc -p 7419:7419 jhipster/jhipster-control-center:latest`

## Development

Before you can build this project, you must install and configure the following dependencies on your machine:

1. [Node.js][]: We use Node to run a development web server and build the project.
   Depending on your system, you can install Node either from source or as a pre-packaged bundle.

After installing Node, you should be able to run the following command to install development tools.
You will only need to run this command when dependencies change in [package.json](package.json).

```
    npm install
```

We use npm scripts and [Webpack][] as our build system.

Run the following commands in two separate terminals to create a blissful development experience where your browser
auto-refreshes when files change on your hard drive.

```
./mvnw
npm start
```

Npm is also used to manage CSS and JavaScript dependencies used in this application. You can upgrade dependencies by
specifying a newer version in [package.json](package.json). You can also run `npm update` and `npm install` to manage dependencies.
Add the `help` flag on any command to see how you can use it. For example, `npm help update`.

The `npm run` command will list all of the scripts available to run for this project.

### PWA Support

JHipster ships with PWA (Progressive Web App) support, and it's turned off by default. One of the main components of a PWA is a service worker.

The service worker initialization code is commented out by default. To enable it, uncomment the following code in `src/main/webapp/index.html`:

```html
<script>
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').then(function () {
      console.log('Service Worker Registered');
    });
  }
</script>
```

Note: [Workbox](https://developers.google.com/web/tools/workbox/) powers JHipster's service worker. It dynamically generates the `service-worker.js` file.

### Managing dependencies

For example, to add [Leaflet][] library as a runtime dependency of your application, you would run following command:

```
    npm install --save --save-exact leaflet
```

To benefit from TypeScript type definitions from [DefinitelyTyped][] repository in development, you would run following command:

```
    npm install --save-dev --save-exact @types/leaflet
```

Then you would import the JS and CSS files specified in library's installation instructions so that [Webpack][] knows about them:
Note: There are still a few other things remaining to do for Leaflet that we won't detail here.

For further instructions on how to develop with JHipster, have a look at [Using JHipster in development][].

## Building for production

### Packaging as jar

To build the final jar and optimize the jhipsterControlCenter application for production, run:

```
./mvnw -Pprod clean verify
```

This will concatenate and minify the client CSS and JavaScript files. It will also modify `index.html` so it references these new files.
To ensure everything worked, run:

```
java -jar target/*.jar
```

Then navigate to [http://localhost:7419](http://localhost:7419) in your browser.

Refer to [Using JHipster in production][] for more details.

### Packaging as war

To package your application as a war in order to deploy it to an application server, run:

```
./mvnw -Pprod,war clean verify
```

## Testing

To launch your application's tests, run:

```
./mvnw verify
```

### Client tests

Unit tests are run by [Jest][]. They're located in [src/test/javascript/](src/test/javascript/) and can be run with:

```
npm test
```

For more information, refer to the [Running tests page][].

### Code quality

Sonar is used to analyse code quality. You can start a local Sonar server (accessible on http://localhost:9001) with:

```
docker-compose -f src/main/docker/sonar.yml up -d
```

Note: we have turned off authentication in [src/main/docker/sonar.yml](src/main/docker/sonar.yml) for out of the box experience while trying out SonarQube, for real use cases turn it back on.

You can run a Sonar analysis with using the [sonar-scanner](https://docs.sonarqube.org/display/SCAN/Analyzing+with+SonarQube+Scanner) or by using the maven plugin.

Then, run a Sonar analysis:

```
./mvnw -Pprod clean verify sonar:sonar
```

If you need to re-run the Sonar phase, please be sure to specify at least the `initialize` phase since Sonar properties are loaded from the sonar-project.properties file.

```
./mvnw initialize sonar:sonar
```

For more information, refer to the [Code quality page][].

## Using Docker to simplify development (optional)

You can use Docker to improve your JHipster development experience. A number of docker-compose configuration are available in the [src/main/docker](src/main/docker) folder to launch required third party services.

You can also fully dockerize your application and all the services that it depends on.
To achieve this, first build a docker image of your app by running:

```
./mvnw -Pprod verify jib:dockerBuild
```

Then run:

```
docker-compose -f src/main/docker/app.yml up -d
```

For more information refer to [Using Docker and Docker-Compose][], this page also contains information on the docker-compose sub-generator (`jhipster docker-compose`), which is able to generate docker configurations for one or several JHipster applications.

## Continuous Integration (optional)

To configure CI for your project, run the ci-cd sub-generator (`jhipster ci-cd`), this will let you generate configuration files for a number of Continuous Integration systems. Consult the [Setting up Continuous Integration][] page for more information.

[jhipster homepage and latest documentation]: https://www.jhipster.tech
[jhipster 7.0.0-beta.1 archive]: https://www.jhipster.tech/documentation-archive/v7.0.0-beta.1
[using jhipster in development]: https://www.jhipster.tech/documentation-archive/v7.0.0-beta.1/development/
[using docker and docker-compose]: https://www.jhipster.tech/documentation-archive/v7.0.0-beta.1/docker-compose
[using jhipster in production]: https://www.jhipster.tech/documentation-archive/v7.0.0-beta.1/production/
[running tests page]: https://www.jhipster.tech/documentation-archive/v7.0.0-beta.1/running-tests/
[code quality page]: https://www.jhipster.tech/documentation-archive/v7.0.0-beta.1/code-quality/
[setting up continuous integration]: https://www.jhipster.tech/documentation-archive/v7.0.0-beta.1/setting-up-ci/
[node.js]: https://nodejs.org/
[webpack]: https://webpack.github.io/
[browsersync]: https://www.browsersync.io/
[jest]: https://facebook.github.io/jest/
[leaflet]: https://leafletjs.com/
[definitelytyped]: https://definitelytyped.org/
[github-actions]: https://github.com/jhipster/jhipster-control-center/actions
[github-application-ci]: https://github.com/jhipster/jhipster-control-center/workflows/Application%20CI/badge.svg
[sonar-url]: https://sonarcloud.io/dashboard?id=jhipster_jhipster-control-center
[sonar-quality-gate]: https://sonarcloud.io/api/project_badges/measure?project=jhipster_jhipster-control-center&metric=alert_status
[sonar-coverage]: https://sonarcloud.io/api/project_badges/measure?project=jhipster_jhipster-control-center&metric=coverage
[sonar-bugs]: https://sonarcloud.io/api/project_badges/measure?project=jhipster_jhipster-control-center&metric=bugs
[sonar-vulnerabilities]: https://sonarcloud.io/api/project_badges/measure?project=jhipster_jhipster-control-center&metric=vulnerabilities
[docker-hub-url]: https://hub.docker.com/r/jhipster/jhipster-control-center
[docker-hub-pulls]: https://img.shields.io/docker/pulls/jhipster/jhipster-control-center.svg

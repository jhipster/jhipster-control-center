import { Route } from '@/shared/routes/routes.service';
import { Bean, Properties, PropertySource } from '@/applications/configuration/configuration.service';
import { Instance } from '@/applications/instance/instance.service';

const inst: Instance = {
  serviceId: 'app1',
  instanceId: 'app1-id',
  uri: 'http://127.0.0.01:8080',
  host: '127.0.0.1',
  port: 8080,
  secure: false,
  metadata: {},
};

const instanceList: Array<Instance> = [inst];

const jhcc_profiles = {
  'display-ribbon-on-profiles': 'dev',
  activeProfiles: ['dev', 'swagger'],
};

const instancesRoute = [
  { uri: 'http://127.0.0.01:8081', route_id: 'test2/test2-id' },
  { uri: 'http://127.0.0.01:8080', route_id: 'test/test-id' },
];

const jhcc_route = {
  path: '',
  predicate: '',
  filters: [],
  serviceId: 'JHIPSTER-CONTROL-CENTER',
  instanceId: 'JHIPSTER-CONTROL-CENTER',
  instanceUri: '',
  order: 0,
} as Route;

const service_test_route = {
  path: 'service-test/service-test:number',
  predicate: '',
  filters: [],
  serviceId: 'service-test',
  instanceId: 'service-test-instance',
  instanceUri: '',
  order: 0,
} as Route;

const routes: Route[] = [jhcc_route, service_test_route];

const bean_a: Bean = {
  prefix: 'prefix-a',
  properties: {},
} as Bean;

const bean_b: Bean = {
  prefix: 'prefix-b',
  properties: {},
} as Bean;

const bean_c: Bean = {
  prefix: 'prefix-c',
  properties: {},
} as Bean;

const bean_d: Bean = {
  prefix: 'prefix-d',
  properties: {},
} as Bean;

const jhcc_beans: Bean[] = [bean_a, bean_b];

const service_test_beans: Bean[] = [bean_c, bean_d];

const property_a: PropertySource = {
  name: 'property_a',
  properties: {},
};

const property_b: PropertySource = {
  name: 'property_b',
  properties: {},
};

const property_source: PropertySource[] = [property_a, property_b];

export {
  inst,
  instanceList,
  jhcc_profiles,
  instancesRoute,
  jhcc_route,
  service_test_route,
  routes,
  bean_a,
  bean_b,
  bean_c,
  bean_d,
  jhcc_beans,
  service_test_beans,
  property_source,
};

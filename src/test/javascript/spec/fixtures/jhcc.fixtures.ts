import { Route } from '@/shared/routes/routes.service';
import { Bean, PropertySource } from '@/applications/configuration/configuration.service';
import { Instance } from '@/applications/instance/instance.service';
import { Log } from '@/applications/loggers/loggers.service';
import CachesService, { Cache } from '@/applications/caches/caches.service';

const stubbedModal = {
  template: '<div></div>',
  methods: {
    show: () => jest.fn(),
  },
};

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
  activeProfiles: ['dev', 'api-docs'],
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

const jhcc_health = {
  status: 'UP',
  components: {
    consul: {
      status: 'UP',
      details: {
        leader: '127.0.0.1:8300',
        services: {
          consul: [],
          store: ['profile=dev', 'version=0.0.1-SNAPSHOT', 'git-version=', 'git-commit=', 'git-branch=', 'secure=false'],
        },
      },
    },
    discoveryComposite: {
      status: 'UP',
      components: {
        discoveryClient: {
          status: 'UP',
          details: {
            services: ['consul', 'store'],
          },
        },
      },
    },
    diskSpace: {
      status: 'UP',
      details: {
        total: 502468108288,
        free: 387328499712,
        threshold: 10485760,
      },
    },
    hystrix: {
      status: 'UP',
    },
    ping: {
      status: 'UP',
    },
    reactiveDiscoveryClients: {
      status: 'UP',
      components: {
        'Simple Reactive Discovery Client': {
          status: 'UP',
          details: {
            services: [],
          },
        },
        'Spring Cloud Consul Reactive Discovery Client': {
          status: 'UP',
          details: {
            services: ['consul', 'store'],
          },
        },
      },
    },
    refreshScope: {
      status: 'UP',
    },
  },
};

const jhcc_health_element = {
  consul: {
    status: 'UP',
    details: {
      leader: '127.0.0.1:8300',
      services: {
        consul: [],
        store: ['profile=dev', 'version=0.0.1-SNAPSHOT', 'git-version=', 'git-commit=', 'git-branch=', 'secure=false'],
      },
    },
  },
};

const jhcc_logfile = 'some logs write in logfile of jhcc';

const jhcc_logfile_error =
  'No available logfile. Please note that it is not available by default, you need to set up the Spring Boot properties below! \n' +
  'Please check:\n ' +
  '- if the microservice is up\n ' +
  '- if these properties are set: \n ' +
  '    - logging.file.path\n ' +
  '    - logging.file.name (to avoid using the same spring.log)\n\n' +
  'See:\n ' +
  '- https://docs.spring.io/spring-boot/docs/current/reference/html/production-ready-endpoints.html\n ' +
  '- https://docs.spring.io/spring-boot/docs/current/reference/html/howto-logging.html';

const log = new Log('jhcc', 'DEBUG');

const jhcc_logs: Log[] = [log];

const jhcc_metrics = {
  jvm: {
    'PS Eden Space': {
      committed: 5.57842432e8,
      max: 6.49592832e8,
      used: 4.20828184e8,
    },
    'Code Cache': {
      committed: 2.3461888e7,
      max: 2.5165824e8,
      used: 2.2594368e7,
    },
    'Compressed Class Space': {
      committed: 1.2320768e7,
      max: 1.073741824e9,
      used: 1.1514008e7,
    },
    'PS Survivor Space': {
      committed: 1.5204352e7,
      max: 1.5204352e7,
      used: 1.2244376e7,
    },
    'PS Old Gen': {
      committed: 1.10624768e8,
      max: 1.37887744e9,
      used: 4.1390776e7,
    },
    Metaspace: {
      committed: 9.170944e7,
      max: -1.0,
      used: 8.7377552e7,
    },
  },
  databases: {
    min: {
      value: 10.0,
    },
    max: {
      value: 10.0,
    },
    idle: {
      value: 10.0,
    },
    usage: {
      '0.0': 0.0,
      '1.0': 0.0,
      max: 0.0,
      totalTime: 4210.0,
      mean: 701.6666666666666,
      '0.5': 0.0,
      count: 6,
      '0.99': 0.0,
      '0.75': 0.0,
      '0.95': 0.0,
    },
    pending: {
      value: 0.0,
    },
    active: {
      value: 0.0,
    },
    acquire: {
      '0.0': 0.0,
      '1.0': 0.0,
      max: 0.0,
      totalTime: 0.884426,
      mean: 0.14740433333333333,
      '0.5': 0.0,
      count: 6,
      '0.99': 0.0,
      '0.75': 0.0,
      '0.95': 0.0,
    },
    creation: {
      '0.0': 0.0,
      '1.0': 0.0,
      max: 0.0,
      totalTime: 27.0,
      mean: 3.0,
      '0.5': 0.0,
      count: 9,
      '0.99': 0.0,
      '0.75': 0.0,
      '0.95': 0.0,
    },
    connections: {
      value: 10.0,
    },
  },
  'http.server.requests': {
    all: {
      count: 5,
    },
    percode: {
      '200': {
        max: 0.0,
        mean: 298.9012628,
        count: 5,
      },
    },
  },
  cache: {
    usersByEmail: {
      'cache.gets.miss': 0.0,
      'cache.puts': 0.0,
      'cache.gets.hit': 0.0,
      'cache.removals': 0.0,
      'cache.evictions': 0.0,
    },
    usersByLogin: {
      'cache.gets.miss': 1.0,
      'cache.puts': 1.0,
      'cache.gets.hit': 1.0,
      'cache.removals': 0.0,
      'cache.evictions': 0.0,
    },
    'tech.jhipster.domain.Authority': {
      'cache.gets.miss': 0.0,
      'cache.puts': 2.0,
      'cache.gets.hit': 0.0,
      'cache.removals': 0.0,
      'cache.evictions': 0.0,
    },
    'tech.jhipster.domain.User.authorities': {
      'cache.gets.miss': 0.0,
      'cache.puts': 1.0,
      'cache.gets.hit': 0.0,
      'cache.removals': 0.0,
      'cache.evictions': 0.0,
    },
    'tech.jhipster.domain.User': {
      'cache.gets.miss': 0.0,
      'cache.puts': 1.0,
      'cache.gets.hit': 0.0,
      'cache.removals': 0.0,
      'cache.evictions': 0.0,
    },
  },
  garbageCollector: {
    'jvm.gc.max.data.size': 1.37887744e9,
    'jvm.gc.pause': {
      '0.0': 0.0,
      '1.0': 0.0,
      max: 0.0,
      totalTime: 242.0,
      mean: 242.0,
      '0.5': 0.0,
      count: 1,
      '0.99': 0.0,
      '0.75': 0.0,
      '0.95': 0.0,
    },
    'jvm.gc.memory.promoted': 2.992732e7,
    'jvm.gc.memory.allocated': 1.26362872e9,
    classesLoaded: 17393.0,
    'jvm.gc.live.data.size': 3.1554408e7,
    classesUnloaded: 0.0,
  },
  services: {
    '/management/info': {
      GET: {
        max: 0.0,
        mean: 104.952893,
        count: 1,
      },
    },
    '/api/authenticate': {
      POST: {
        max: 0.0,
        mean: 909.53003,
        count: 1,
      },
    },
    '/api/account': {
      GET: {
        max: 0.0,
        mean: 141.209628,
        count: 1,
      },
    },
    '/**': {
      GET: {
        max: 0.0,
        mean: 169.4068815,
        count: 2,
      },
    },
  },
  processMetrics: {
    'system.load.average.1m': 3.63,
    'system.cpu.usage': 0.5724934148485453,
    'system.cpu.count': 4.0,
    'process.start.time': 1.548140811306e12,
    'process.files.open': 205.0,
    'process.cpu.usage': 0.003456347568026252,
    'process.uptime': 88404.0,
    'process.files.max': 1048576.0,
  },
  threads: [
    { name: 'test1', threadState: 'RUNNABLE' },
    { name: 'test2', threadState: 'WAITING' },
    { name: 'test3', threadState: 'TIMED_WAITING' },
    { name: 'test4', threadState: 'BLOCKED' },
  ],
};

const jhcc_metrics_caches = CachesService.parseJsonToArrayOfCacheMetrics(jhcc_metrics['cache']);

const jhcc_caches_json = {
  cacheManagers: {
    cacheManager: {
      caches: {
        usersByEmail: { target: 'org.redisson.jcache.JCache' },
        'com.mycompany.myapp.domain.User': { target: 'org.redisson.jcache.JCache' },
        usersByLogin: { target: 'org.redisson.jcache.JCache' },
        'com.mycompany.myapp.domain.Authority': { target: 'org.redisson.jcache.JCache' },
        'com.mycompany.myapp.domain.User.authorities': { target: 'org.redisson.jcache.JCache' },
      },
    },
  },
};

const jhcc_caches = CachesService.parseJsonToArrayOfCache(jhcc_caches_json);

export {
  stubbedModal,
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
  jhcc_health,
  jhcc_health_element,
  jhcc_logfile,
  jhcc_logfile_error,
  jhcc_logs,
  jhcc_metrics,
  jhcc_metrics_caches,
  jhcc_caches_json,
  jhcc_caches,
};

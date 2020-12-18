// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.common with an alias.
import Vue from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import App from './app.vue';
import Vue2Filters from 'vue2-filters';
import { ToastPlugin } from 'bootstrap-vue';
import router from './router';
import * as config from './shared/config/config';
import * as bootstrapVueConfig from './shared/config/config-bootstrap-vue';
import JhiItemCountComponent from './shared/jhi-item-count.vue';
import JhiSortIndicatorComponent from './shared/sort/jhi-sort-indicator.vue';
import InfiniteLoading from 'vue-infinite-loading';

import LoginService from './account/login.service';
import AccountService from './account/account.service';

import '../content/scss/vendor.scss';

// jhcc-custom begin
import { RefreshService } from '@/shared/refresh/refresh.service';
import InstanceService from '@/applications/instance/instance.service';
import RoutesService from '@/shared/routes/routes.service';
import LoggersService from '@/applications/loggers/loggers.service';
import MetricService from '@/applications/metric/metric.service';
import { ModalPlugin } from 'bootstrap-vue';
import InstanceHealthService from '@/applications/health/health.service';
import LogfileService from '@/applications/logfile/logfile.service';
import InstanceConfigurationService from '@/applications/configuration/configuration.service';
import CachesService from '@/applications/caches/caches.service';
// jhcc-custom end

/* tslint:disable */

// jhipster-needle-add-entity-service-to-main-import - JHipster will import entities services here

/* tslint:enable */
Vue.config.productionTip = false;
config.initVueApp(Vue);
config.initFortAwesome(Vue);
bootstrapVueConfig.initBootstrapVue(Vue);
Vue.use(Vue2Filters);
// jhcc-custom begin
Vue.use(ToastPlugin);
Vue.use(ModalPlugin);
// jhcc-custom end
Vue.component('font-awesome-icon', FontAwesomeIcon);
Vue.component('jhi-item-count', JhiItemCountComponent);
Vue.component('jhi-sort-indicator', JhiSortIndicatorComponent);
Vue.component('infinite-loading', InfiniteLoading);
const store = config.initVueXStore(Vue);

const loginService = new LoginService();
const accountService = new AccountService(store, (<any>Vue).cookie, router);

// jhcc-custom begin
const refreshService = new RefreshService(store);
const routesService = new RoutesService(store);
// jhcc-custom end
router.beforeEach((to, from, next) => {
  if (!to.matched.length) {
    next('/not-found');
  }

  if (to.meta && to.meta.authorities && to.meta.authorities.length > 0) {
    accountService.hasAnyAuthorityAndCheckAuth(to.meta.authorities).then(value => {
      if (!value) {
        sessionStorage.setItem('requested-url', to.fullPath);
        next('/forbidden');
      } else {
        next();
      }
    });
  } else {
    // no authorities, so just proceed
    next();
  }
});

/* tslint:disable */
const app = new Vue({
  el: '#app',
  components: { App },
  template: '<App/>',
  router,
  provide: {
    loginService: () => loginService,
    // jhipster-needle-add-entity-service-to-main - JHipster will import entities services here
    accountService: () => accountService,

    // jhcc-custom begin
    instanceService: () => new InstanceService(),
    refreshService: () => refreshService,
    routesService: () => routesService,
    loggersService: () => new LoggersService(),
    metricService: () => new MetricService(),
    instanceHealthService: () => new InstanceHealthService(),
    logfileService: () => new LogfileService(),
    instanceConfigurationService: () => new InstanceConfigurationService(),
    cachesService: () => new CachesService(),
    // jhcc-custom end
  },
  store,
});

// jhcc-custom
if (window.Cypress) {
  window.app = app;
}

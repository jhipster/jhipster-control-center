import Vue from 'vue';
import Component from 'vue-class-component';
import Router from 'vue-router';
import { Authority } from '@/shared/security/authority';

Component.registerHooks([
  'beforeRouteEnter',
  'beforeRouteLeave',
  'beforeRouteUpdate' // for vue-router 2.2+
]);
const Home = () => import('../core/home/home.vue');
const Error = () => import('../core/error/error.vue');
const JhiConfigurationComponent = () => import('../admin/configuration/configuration.vue');
const JhiDocsComponent = () => import('../admin/docs/docs.vue');
const JhiHealthComponent = () => import('../admin/health/health.vue');
const JhiInstanceHealthComponent = () => import('../applications/health/health.vue');
const JhiLogsComponent = () => import('../admin/logs/logs.vue');
const JhiMetricsComponent = () => import('../admin/metrics/metrics.vue');

// jhcc-custom begin
const InstanceComponent = () => import('../applications/instance/instance.vue');
const LoggersComponent = () => import('../applications/loggers/loggers.vue');
// jhcc-custom end

/* tslint:disable */
// jhipster-needle-add-entity-to-router-import - JHipster will import entities to the router here

Vue.use(Router);

// prettier-ignore
export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/forbidden',
      name: 'Forbidden',
      component: Error,
      meta: { error403: true }
    },
    {
      path: '/not-found',
      name: 'NotFound',
      component: Error,
      meta: { error404: true }
    },
    {
      path: '/admin/docs',
      name: 'JhiDocsComponent',
      component: JhiDocsComponent,
      meta: { authorities: [Authority.ADMIN] }
    },

    {
      path: '/admin/jhi-health',
      name: 'JhiHealthComponent',
      component: JhiHealthComponent,
      meta: { authorities: [Authority.ADMIN] }
    },
    {
      path: '/admin/logs',
      name: 'JhiLogsComponent',
      component: JhiLogsComponent,
      meta: { authorities: [Authority.ADMIN] }
    },
    {
      path: '/admin/jhi-metrics',
      name: 'JhiMetricsComponent',
      component: JhiMetricsComponent,
      meta: { authorities: [Authority.ADMIN] }
    },
    {
      path: '/admin/jhi-configuration',
      name: 'JhiConfigurationComponent',
      component: JhiConfigurationComponent,
      meta: { authorities: [Authority.ADMIN] }
    },
    // jhcc-custom begin
    {
      path: '/applications/instances',
      name: 'InstanceComponent',
      component: InstanceComponent,
      meta: { authorities: [Authority.ADMIN] }
    },
    {
      path: '/applications/loggers',
      name: 'LoggersComponent',
      component: LoggersComponent,
      meta: { authorities: [Authority.ADMIN] }
    },
    {
      path: '/applications/health',
      name: 'JhiInstanceHealthComponent',
      component: JhiInstanceHealthComponent,
      meta: { authorities: [Authority.ADMIN]}
    }
    // jhcc-custom end
    // jhipster-needle-add-entity-to-router - JHipster will add entities to the router here
  ]
});

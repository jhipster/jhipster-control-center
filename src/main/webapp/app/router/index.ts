import Vue from 'vue';
import Component from 'vue-class-component';
Component.registerHooks([
  'beforeRouteEnter',
  'beforeRouteLeave',
  'beforeRouteUpdate', // for vue-router 2.2+
]);
import Router from 'vue-router';
import { Authority } from '@/shared/security/authority';
const Home = () => import('@/core/home/home.vue');
const Error = () => import('@/core/error/error.vue');
import entities from '@/router/entities';
import pages from '@/router/pages';

// jhcc-custom begin
const InstanceComponent = () => import('../applications/instance/instance.vue');
const LoggersComponent = () => import('../applications/loggers/loggers.vue');
const MetricComponent = () => import('../applications/metric/metric.vue');
const HealthComponent = () => import('../applications/health/health.vue');
const LogfileComponent = () => import('../applications/logfile/logfile.vue');
const ConfigurationComponent = () => import('../applications/configuration/configuration.vue');
const DocsComponent = () => import('../applications/docs/docs.vue');
const CachesComponent = () => import('../applications/caches/caches.vue');
const LiquibaseComponent = () => import('../applications/liquibase/liquibase.vue');
// jhcc-custom end

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
    ...entities,
    ...pages,
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
      path: '/applications/metric',
      name: 'MetricComponent',
      component: MetricComponent,
      meta: { authorities: [Authority.ADMIN] }
    },
    {
      path: '/applications/health',
      name: 'InstanceHealthComponent',
      component: HealthComponent,
      meta:  {authorities : [Authority.ADMIN]}
    },
    {
      path: '/applications/logfile',
      name: 'LogfileComponent',
      component: LogfileComponent,
      meta:  {authorities : [Authority.ADMIN]}
    },
    {
      path: '/applications/configuration',
      name: 'InstanceConfigurationComponent',
      component: ConfigurationComponent,
      meta:  {authorities : [Authority.ADMIN]}
    },
    {
      path: '/applications/docs',
      name: 'DocsComponent',
      component: DocsComponent,
      meta:  {authorities : [Authority.ADMIN]}
    },
    {
      path: '/applications/caches',
      name: 'CachesComponent',
      component: CachesComponent,
      meta:  {authorities : [Authority.ADMIN]}
    },
    {
      path: '/applications/liquibase',
      name: 'LiquibaseComponent',
      component: LiquibaseComponent,
      meta:  {authorities : [Authority.ADMIN]}
    },
  ]
});

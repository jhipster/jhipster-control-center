import Vue from 'vue';
import Component from 'vue-class-component';
Component.registerHooks([
  'beforeRouteEnter',
  'beforeRouteLeave',
  'beforeRouteUpdate', // for vue-router 2.2+
]);
import Router from 'vue-router';
import { Authority } from '@/shared/security/authority';
const Home = () => import('../core/home/home.vue');
const Error = () => import('../core/error/error.vue');
import pages from '@/router/pages.ts';

// jhcc-custom begin
const InstanceComponent = () => import('../applications/instance/instance.vue');
const LoggersComponent = () => import('../applications/loggers/loggers.vue');
const MetricComponent = () => import('../applications/metric/metric.vue');
const HealthComponent = () => import('../applications/health/health.vue');
const LogfileComponent = () => import('../applications/logfile/logfile.vue');
const ConfigurationComponent = () => import('../applications/configuration/configuration.vue');
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
    // jhcc-custom end
    // jhipster-needle-add-entity-to-router - JHipster will add entities to the router here
  ]
});

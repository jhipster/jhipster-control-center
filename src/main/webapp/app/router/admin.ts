import { Authority } from '@/shared/security/authority';

const JhiConfigurationComponent = () => import('@/admin/configuration/configuration.vue');
const JhiDocsComponent = () => import('@/admin/docs/docs.vue');
const JhiHealthComponent = () => import('@/admin/health/health.vue');
const JhiLogsComponent = () => import('@/admin/logs/logs.vue');
const JhiMetricsComponent = () => import('@/admin/metrics/metrics.vue');

export default [
  {
    path: '/admin/docs',
    name: 'JhiDocsComponent',
    component: JhiDocsComponent,
    meta: { authorities: [Authority.ADMIN] },
  },

  {
    path: '/admin/jhi-health',
    name: 'JhiHealthComponent',
    component: JhiHealthComponent,
    meta: { authorities: [Authority.ADMIN] },
  },
  {
    path: '/admin/logs',
    name: 'JhiLogsComponent',
    component: JhiLogsComponent,
    meta: { authorities: [Authority.ADMIN] },
  },
  {
    path: '/admin/jhi-metrics',
    name: 'JhiMetricsComponent',
    component: JhiMetricsComponent,
    meta: { authorities: [Authority.ADMIN] },
  },
  {
    path: '/admin/jhi-configuration',
    name: 'JhiConfigurationComponent',
    component: JhiConfigurationComponent,
    meta: { authorities: [Authority.ADMIN] },
  },
];

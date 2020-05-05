import { Module } from 'vuex';
import { Route } from '@/shared/routes/routes.service';

export const routesStore: Module<any, any> = {
  state: {
    route: {
      path: '',
      predicate: '',
      filters: [],
      serviceId: 'JHIPSTER-CONTROL-CENTER',
      instanceId: 'JHIPSTER-CONTROL-CENTER',
      instanceUri: '',
      order: 0
    } as Route
  },
  getters: {
    route: state => state.route
  },
  mutations: {
    setRoute(state, route) {
      state.route = route;
    }
  }
};

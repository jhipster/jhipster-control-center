import { Module } from 'vuex';

export const refreshStore: Module<any, any> = {
  state: {
    refreshTime: 0,
  },
  getters: {
    refreshTime: state => state.refreshTime,
  },
  mutations: {
    setRefreshTime(state, refreshTime) {
      state.refreshTime = refreshTime;
    },
  },
};

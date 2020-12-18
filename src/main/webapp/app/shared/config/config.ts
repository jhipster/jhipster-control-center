import Vuex from 'vuex';
import { setupAxiosInterceptors } from '@/shared/config/axios-interceptor';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons/faArrowLeft';
import { faAsterisk } from '@fortawesome/free-solid-svg-icons/faAsterisk';
import { faBan } from '@fortawesome/free-solid-svg-icons/faBan';
import { faBars } from '@fortawesome/free-solid-svg-icons/faBars';
import { faBell } from '@fortawesome/free-solid-svg-icons/faBell';
import { faBook } from '@fortawesome/free-solid-svg-icons/faBook';
import { faCloud } from '@fortawesome/free-solid-svg-icons/faCloud';
import { faCogs } from '@fortawesome/free-solid-svg-icons/faCogs';
import { faDatabase } from '@fortawesome/free-solid-svg-icons/faDatabase';
import { faEye } from '@fortawesome/free-solid-svg-icons/faEye';
import { faFlag } from '@fortawesome/free-solid-svg-icons/faFlag';
import { faHeart } from '@fortawesome/free-solid-svg-icons/faHeart';
import { faHome } from '@fortawesome/free-solid-svg-icons/faHome';
import { faList } from '@fortawesome/free-solid-svg-icons/faList';
import { faLock } from '@fortawesome/free-solid-svg-icons/faLock';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons/faPencilAlt';
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus';
import { faRoad } from '@fortawesome/free-solid-svg-icons/faRoad';
import { faSave } from '@fortawesome/free-solid-svg-icons/faSave';
import { faSearch } from '@fortawesome/free-solid-svg-icons/faSearch';
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons/faSignInAlt';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons/faSignOutAlt';
import { faSort } from '@fortawesome/free-solid-svg-icons/faSort';
import { faSortDown } from '@fortawesome/free-solid-svg-icons/faSortDown';
import { faSortUp } from '@fortawesome/free-solid-svg-icons/faSortUp';
import { faSync } from '@fortawesome/free-solid-svg-icons/faSync';
import { faTachometerAlt } from '@fortawesome/free-solid-svg-icons/faTachometerAlt';
import { faTasks } from '@fortawesome/free-solid-svg-icons/faTasks';
import { faThList } from '@fortawesome/free-solid-svg-icons/faThList';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons/faTimesCircle';
import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes';
import { faTrash } from '@fortawesome/free-solid-svg-icons/faTrash';
import { faUser } from '@fortawesome/free-solid-svg-icons/faUser';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons/faUserPlus';
import { faWrench } from '@fortawesome/free-solid-svg-icons/faWrench';
// jhcc-custom begin
import { faSitemap } from '@fortawesome/free-solid-svg-icons/faSitemap';
import { faCube } from '@fortawesome/free-solid-svg-icons/faCube';
import { faChartLine } from '@fortawesome/free-solid-svg-icons/faChartLine';
import { faAngleDoubleLeft } from '@fortawesome/free-solid-svg-icons/faAngleDoubleLeft';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons/faEllipsisV';
import { faPowerOff } from '@fortawesome/free-solid-svg-icons/faPowerOff';
import { faIndent } from '@fortawesome/free-solid-svg-icons/faIndent';
import { faLayerGroup } from '@fortawesome/free-solid-svg-icons/faLayerGroup';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons/faTrashAlt';
// jhcc-custom end

import VueCookie from 'vue-cookie';
import Vuelidate from 'vuelidate';
import Vue2Filters from 'vue2-filters';

import * as filters from '@/shared/date/filters';
import { accountStore } from '@/shared/config/store/account-store';
// jhcc-custom begin
import { refreshStore } from '@/shared/config/store/refresh-store';
import { routesStore } from '@/shared/config/store/routes-store';
// jhcc-custom end

export function initVueApp(vue) {
  vue.use(VueCookie);
  vue.use(Vuelidate);
  vue.use(Vue2Filters);
  setupAxiosInterceptors(() => console.log('Unauthorized!'));
  filters.initFilters();
}

export function initFortAwesome(vue) {
  library.add(
    faArrowLeft,
    faAsterisk,
    faBan,
    faBars,
    faBell,
    faBook,
    faCloud,
    faCogs,
    faDatabase,
    faEye,
    faFlag,
    faHeart,
    faHome,
    faList,
    faLock,
    faPencilAlt,
    faPlus,
    faRoad,
    faSave,
    faSearch,
    faSignInAlt,
    faSignOutAlt,
    faSort,
    faSortDown,
    faSortUp,
    faSync,
    faTachometerAlt,
    faTasks,
    faThList,
    faTimes,
    faTimesCircle,
    faTrash,
    faUser,
    faUserPlus,
    faWrench,
    // jhcc-custom begin
    faAngleDoubleLeft,
    faChartLine,
    faWrench,
    faSitemap,
    faCube,
    faEllipsisV,
    faPowerOff,
    faIndent,
    faLayerGroup,
    faTrashAlt
    // jhcc-custom end
  );
}

export function initVueXStore(vue) {
  vue.use(Vuex);
  return new Vuex.Store({
    modules: {
      accountStore,
      // jhcc-custom begin
      refreshStore,
      routesStore,
      // jhcc-custom end
    },
  });
}

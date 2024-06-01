import { createStore } from 'redux';

const initialState = {
  listTSPeriode: [],
  sidebarShow: true,
  periode: null,
  page: 0,
  session: JSON.parse(localStorage.getItem('session'))
};

const reducer = (state = initialState, { type, ...rest }) => {
  switch (type) {
    case 'set':
      if (rest.session) {
        localStorage.setItem('session', JSON.stringify(rest.session));
      }
      return { ...state, ...rest };

    case 'setPageMasterBilling':
      localStorage.setItem('page_master_billing', JSON.stringify(rest.page_master_billing));
      return { ...state, ...rest };

    case 'setListTSPeriode':

      return { ...state, listTSPeriode: rest.listTSPeriode };

    default:
      return state;
  }
};

const store = createStore(reducer);

export default store;

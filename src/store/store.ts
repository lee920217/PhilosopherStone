import {
  configureStore,
  Middleware,
  MiddlewareAPI,
  Dispatch,
  AnyAction,
} from '@reduxjs/toolkit';
import walletReducer, { setWallet, clearWallet } from './walletSlice';
import sporesReducer from './sporeListSlice';
import newGiftsReducer from './newGiftsSlice';
import unavailableListReducer from './unavailableListSlice';

const localStorageMiddleware: Middleware = store => next => action => {
  if (setWallet.match(action)) {
    localStorage.setItem('wallet', JSON.stringify(action.payload));
  } else if (clearWallet.match(action)) {
    localStorage.removeItem('wallet');
  }
  return next(action);
};

export const store = configureStore({
  reducer: {
    wallet: walletReducer,
    spores: sporesReducer,
    newGifts: newGiftsReducer,
    unavailableList: unavailableListReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(localStorageMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;

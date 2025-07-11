import { configureStore } from '@reduxjs/toolkit';

import { persistReducer, persistStore } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';


import authReducer from './src/features/auth.slice';
import { api } from './src/services';
const persistConfig = {
    key: 'auth',
    storage: AsyncStorage,
    whitelist: ['token', 'user'],
};
const persistedAuthReducer = persistReducer(persistConfig, authReducer);
export const store = configureStore({
    reducer: {
        auth: persistedAuthReducer,
        [api.reducerPath]: api.reducer,
    },
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
            serializableCheck: false,
        }).concat(api.middleware),
});
export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

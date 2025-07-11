import { api } from './index';

const baseUrl = '/sms';

export const injectEndpoints = api.injectEndpoints({
    endpoints: builder => ({
        sendsms: builder.mutation({
            query: (body) => ({
                url: `${baseUrl}`,
                method: 'POST',
                body,
            }),
        }),
        getsms: builder.query({
            query: (data) => ({ url: `${baseUrl}?limit=${data.limit}&page=${data.page}&application=smarttenant` }),
        }),
        getsmsBalance: builder.mutation({
            query: () => ({
                url: `${baseUrl}/balance`,
                method: 'POST',

            }),
        }),
    }),
});

export const {
    useSendsmsMutation,
    useGetsmsQuery,
    useGetsmsBalanceMutation
} = injectEndpoints;

// src/features/auth/authApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://chatcrmapi.onrender.com/api/v1/user', 
    prepareHeaders: (headers, { getState }) => {
      const token = localStorage.getItem('token');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
    tagTypes: ["User"],
  }),
  endpoints: (builder) => ({
    registerUser: builder.mutation({
      query: (userData) => ({
        url: '/sign-up',
        method: 'POST',
        body: userData,
      }),
    }),
    loginUser: builder.mutation({
      query: (data) => ({
        url: '/login',
        method: 'POST',
        body: data,
      }),
    }),
    getProfile: builder.query({
      query: () => '/profile',
    }),
    updateProfile: builder.mutation({
      query: (formData) => ({
        url: '/update-profile',
        method: 'PUT',
        body: formData,
      }),
    }),
    deleteAccount: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
    }),
    getAllAgents: builder.query({
      query: () => '/',
    }),
    getAllCustomer: builder.query({
      query: () => '/customers',
      providesTags: ["User"],
    }),
    requestOtp: builder.mutation({
      query: (data) => ({
        url: '/otp-reset-password',
        method: 'POST',
        body: data,
      }),
    }),
    resetPassword: builder.mutation({
      query: (data) => ({
        url: '/change-password-by-otp',
        method: 'POST',
        body: data,
      }),
    }),
    toggleBreak: builder.mutation({
      query: () => ({
        url: '/break',
        method: 'PUT',
      }),
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useGetAllCustomerQuery,
  useLoginUserMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useDeleteAccountMutation,
  useGetAllAgentsQuery,
  useRequestOtpMutation,
  useResetPasswordMutation,
  useToggleBreakMutation,
} = authApi;

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const roomApi = createApi({
  reducerPath: "roomApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://chatcrmapi.onrender.com/api/v1",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Room"],
  endpoints: (builder) => ({
    createCall: builder.mutation({
      query: (body) => ({
        url: "/room",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Room"],
    }),
    updateCallStatus: builder.mutation({
      query: ({ roomId, status }) => ({
        url: `/room/${roomId}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["Room"],
    }),
    getCallHistory: builder.query({
      query: () => "/room/history",
      providesTags: ["Room"],
    }),
  }),
});

export const {
  useCreateCallMutation,
  useUpdateCallStatusMutation,
  useGetCallHistoryQuery,
} = roomApi;

import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import { userLoggedIn, userLoggedOut } from "../authSlice";

const USER_API = "https://edulearn-fl5d.onrender.com/api/v1/user";

export const authApi = createApi({
    reducerPath:"authApi",
    baseQuery:fetchBaseQuery({
        baseUrl:USER_API,
        credentials:'include'
    }),
    endpoints: (builder) => ({
        registerUser: builder.mutation({
            query:(inputData)=>({
                url:"register",
                method:"POST",
                body:inputData
            })
        }),
        loginUser: builder.mutation({
            query:(inputData)=>({
                url:"login",
                method:"POST",
                body:inputData
            }),
            async onQueryStarted(_, {queryFulfilled, dispatch}) {
                try{
                    const result = await queryFulfilled;
                    dispatch(userLoggedIn({user:result.data.user}));
                }
                catch (error) {
                    console.log(error);
                }
            }
        }),
logoutUser: builder.mutation({
  query: () => ({
    url: "logout",
    method: "GET",
  }),
  async onQueryStarted(_, { queryFulfilled, dispatch }) {
    try {
      await queryFulfilled; // ✅ wait for backend response
      dispatch(userLoggedOut());
    } catch (error) {
      console.log(error);
    }
  },
}),



       loadUser: builder.query({
  query: () => ({
    url: "profile",
    method: "GET",
  }),
  async onQueryStarted(_, { queryFulfilled, dispatch }) {
    try {
      const { data } = await queryFulfilled;
      dispatch(userLoggedIn({ user: data.user }));
    } catch (error) {
      // ✅ ONLY logout if profile itself fails
      if (error?.error?.status === 401) {
        dispatch(userLoggedOut());
      }
    }
  },
}),


        updateUser: builder.mutation({
            query: (formData) => ({
                url:"profile/update",
                method:"PUT",
                body:formData,
                credentials:"include"
            })
                

            
        })
    })
});
export const {useRegisterUserMutation, useLoginUserMutation,useLogoutUserMutation, useLoadUserQuery,useUpdateUserMutation} = authApi;
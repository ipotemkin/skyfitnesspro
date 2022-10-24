import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { authApi } from '../api/auth.api'
import { RootState } from '../store'
import { FirebaseUserRESTAPI } from '../types'

const initialState: FirebaseUserRESTAPI = {
}

export const currentUserSlice = createSlice({
  name: 'currentUser',
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<FirebaseUserRESTAPI>) => {
      state = {...action.payload}
    },
    updateCurrentUser: (state, action: PayloadAction<FirebaseUserRESTAPI>) => {
      console.log('in updateCurrentUser')
      return state = {
        ...state,
        ...action.payload
      }
    },
    deleteCurrentUser: (state) => {
      return state = {...initialState}
    }
  },
  extraReducers: builder => {
    // signUp
    builder.addMatcher(
      authApi.endpoints.signUp.matchFulfilled,
      (state, { payload }) => {
        return state = {...payload}
      }
    )
    builder.addMatcher(
      authApi.endpoints.signUp.matchRejected,
      (state, { payload }) => {
        console.error('Sign-up rejected!!!')
      }
    )
    // signIn
    builder.addMatcher(
      authApi.endpoints.signIn.matchFulfilled,
      (state, { payload }) => {
        return state = {...payload}
      }
    )
    builder.addMatcher(
      authApi.endpoints.signIn.matchRejected,
      (state, { payload }) => {
        console.error('Sign-in rejected!!!')
      }
    )
    // changeEmail
    builder.addMatcher(
      authApi.endpoints.changeEmail.matchFulfilled,
      (state, { payload }) => {
        return state = {
          ...state,
          ...payload
        }
      }
    )
    builder.addMatcher(
      authApi.endpoints.changeEmail.matchRejected,
      (state, { payload }) => {
        console.error('changeEmail rejected!!!')
      }
    )
    // changePassword
    builder.addMatcher(
      authApi.endpoints.changePassword.matchFulfilled,
      (state, { payload }) => {
        return state = {
          ...state,
          ...payload
        }
      }
    )
    builder.addMatcher(
      authApi.endpoints.changePassword.matchRejected,
      (state, { payload }) => {
        console.error('changePassword rejected!!!')
      }
    )
    // refreshToken
    builder.addMatcher(
      authApi.endpoints.refreshToken.matchFulfilled,
      (state, { payload }) => {
        return state = {
          ...state,
          refreshToken: payload.refresh_token
        }
      }
    )
    builder.addMatcher(
      authApi.endpoints.refreshToken.matchRejected,
      (state, { payload }) => {
        console.error('refreshToken rejected!!!')
      }
    )
  }
})

export const {
  setCurrentUser,
  updateCurrentUser,
  deleteCurrentUser
} = currentUserSlice.actions

export const selectCurrentUser = (state: RootState) => state.currentUser

export default currentUserSlice.reducer

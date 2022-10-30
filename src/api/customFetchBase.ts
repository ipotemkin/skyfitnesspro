import { SerializedError } from '@reduxjs/toolkit'
import {
  BaseQueryFn,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError
} from '@reduxjs/toolkit/query'
import { Mutex } from 'async-mutex'

import { API_URL } from '../constants'
import { updateCurrentUser } from '../slices/currentUserSlice'
import { RootState } from '../store'
import { RefreshTokenResponse } from '../types'
import { authApi } from './auth.api'
    
// Create a new mutex
const mutex = new Mutex()

const getQueryPath = (url: string) => {
  const matchResult = url.match(/(^.*auth=)(.*)$/)
  return matchResult ? matchResult[1] : ''
} 

const updateTokenInArgs = (args: string | FetchArgs, newToken: string) => {
  if (typeof args === 'string') {
    return getQueryPath(args) + newToken
  } else {
    args.url = getQueryPath(args.url) + newToken
    return args
  }
}

const AddTokenToUrl = (args: string | FetchArgs, token: string) => {
  const queryString = '?auth=' + token
  if (typeof args === 'string') {
    return args + queryString
  } else {
    args.url = args.url + queryString
    return args
  }
}

const baseQuery = fetchBaseQuery({
  baseUrl: API_URL + '/users'
})

const customFetchBase: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {

  // wait until the mutex is available without locking it
  await mutex.waitForUnlock()
  
  const { idToken } = (api.getState() as RootState).currentUser
  if (idToken)
    args = AddTokenToUrl(args, idToken)

  let result = await baseQuery(args, api, extraOptions)

  if ([400, 401, 403].includes(result.error?.status as number)) {
    let success = false

    if (!mutex.isLocked()) {
      const release = await mutex.acquire()

      try {
        const { refreshToken } = (api.getState() as RootState).currentUser
        if (refreshToken) {
          const res: {
            data: RefreshTokenResponse } | { error: FetchBaseQueryError | SerializedError
          } = await api.dispatch(authApi.endpoints.refreshToken.initiate(refreshToken))

          if ('data' in res && res.data.id_token) {
            args = updateTokenInArgs(args, res.data.id_token)
          
            // Retry the initial query
            try {
              result = await baseQuery(args, api, extraOptions)
              success = true
            } catch {
              success = false
            }
          } 
        } 
      } finally {
        if (!success) {
          api.dispatch(updateCurrentUser({ needRelogin: true }))
        }
        // release must be called once the mutex should be released again.
        release()
      }
    } else {
      // wait until the mutex is available without locking it
      await mutex.waitForUnlock()
      
      const { idToken } = (api.getState() as RootState).currentUser
      if (idToken)
        args = updateTokenInArgs(args, idToken)
      
      result = await baseQuery(args, api, extraOptions)
    }
  }

  return result
}

export default customFetchBase
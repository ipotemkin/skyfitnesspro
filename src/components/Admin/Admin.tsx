import { onAuthStateChanged, User } from "firebase/auth"
import { DataSnapshot, onValue } from "firebase/database"
import { useEffect, useState } from "react"

import auth from "../../db/auth"
import { useAuth, useUserCourses } from "../../hooks/userHooks"
import { UserGallery } from "../PUserGallery/PUserGallery"

import { off } from 'firebase/database'
import { usersRef } from "../../db/refs"
import { useAppSelector } from "../../hooks/appHooks"
import { selectUser, setUser } from "../../slices/userSlice"
import { useDispatch } from "react-redux"

type FormData = {
  username: string
  password: string
}

export const Admin = () => {
  const [form, setForm] = useState<FormData>({ username: '', password: ''})
  const [uid, setUid] = useState<string | undefined>()
  const userCourses = useUserCourses(uid || '')
  const { signUp, signIn, logOut } = useAuth()
  const dispatch = useDispatch()

  const testUser = useAppSelector(selectUser)

  const onDataChange = (items: DataSnapshot) => {
    const usersFromDB = items.val()
    console.log('AuthDebug: usersFromDB -->', usersFromDB)
  }

  useEffect(() => {
    const listener = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        setUid(user.uid)
        dispatch(setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          isLoading: false
        }))
      }
      else setUid(undefined)
    })
    
    onValue(usersRef, onDataChange)
    
    return () => {
      listener()
      off(usersRef, 'value', onDataChange)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSignIn = () => {
    signIn(form.username, form.password)
  }
  
  const handleLogout = () => {
    logOut()
  }

  const handleSignup = () => {
    signUp(form.username, form.password)
  }

  const handleCurrentUser = () => {
    console.log('handleCurrentUser')
    console.log(auth.currentUser)
    console.log(typeof auth.currentUser)
    console.log('testUser -->', testUser)
  }

  const handleCurrentUserCourses = () => {
   const user = auth.currentUser
   if (user) {
    console.log('current user uid -->', user.uid)
    console.log('user courses -->', userCourses)
   }
  }

  const handleChangeUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
    const username = e.target.value
    setForm(prev => ({...prev, username}))
  }

  const handleChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value
    setForm(prev => ({...prev, password}))
  }
  
  return <>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 200, margin: 20 }}>
      <h3>Auth debug console</h3>
      <input type="text"
        placeholder="username (email)"
        value={form?.username}
        onChange={handleChangeUsername}
      ></input>
      <input type="text"
        placeholder="password"
        value={form?.password}
        onChange={handleChangePassword}
      ></input>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={handleSignup}>Sign Up!</button>
        <button onClick={handleSignIn}>Sign In</button>
        <button onClick={handleLogout}>Log out</button>
      </div>
      <button onClick={handleCurrentUser}>Get current user</button>
      <button onClick={handleCurrentUserCourses}>Get current user courses</button>
    </div>
    {/* {users && <UserList users={users}/>} */}
    {uid && <UserGallery uid={uid}/>}
  </>
}
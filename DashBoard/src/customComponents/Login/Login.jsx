import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../../context/UserContext/UserContext'
import { useNavigate } from 'react-router-dom'
import { Button } from '@chakra-ui/react'
import { loginClient } from '../../utils/client.utils'
import {io} from "socket.io-client"

function Login() {
  const {user,setUser,setSocket} = useContext(UserContext)
  const [username,setUserName] = useState(null)
  const [password,setPassword] = useState(null)
  const [error,setError] = useState(null)
  const navigate = useNavigate()

  useEffect(()=>{
    if(user)navigate("/")
  },[user])
  
  const handleLogin = async(event)=>{
    event.preventDefault()
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/

    // username validation
    if(!username || username.trim().length<=4){
      setError(prev=>"*Username should be atleast 5 characters wide")
      return;
    }

    // password validation
    if(!password || password.trim().length<8 || !passwordRegex.test(password)){
      setError(prev=>"*Required uppercase [A-Z] letter,lowercase [a-z] letter,Number [0-9],Special characters and must be atleast 8 characters wide")
      return;
    }
    const res = await loginClient({username,password});
    if(res.data){
      setUser(prev=>res.data);
      setSocket(prev=>{
        const tempSocket = io('http://localhost:8000',{
            query:{
                _id:res.data._id
            }
        })
        return tempSocket
      })
      navigate("/")
    }
    else alert("Invalid user credentials")
  }
  
  return (
    <div className='w-screen h-screen flex flex-col justify-center items-center bg-blue-500'>
        <div className='w-1/2 font-bold text-white text-4xl text-center mb-10 font-serif'>
            <h1>Welcome To SangRakshak Dashboard</h1>
        </div>
        <form onSubmit={handleLogin} className='w-1/3 h-80 border-2 flex flex-col items-center justify-center gap-y-8 bg-white shadow-md shadow-blue-950 rounded-md' onClick={()=>{setError(prev=>null)}}>
            <h1 className='font-serif font-bold text-2xl'>Login</h1>
            
            {/* username field */}
            <input type="text" 
            value={username} 
            placeholder='username' 
            className='w-1/2 h-10 font-serif font-bold text-xl focus:outline-none border-2 border-black rounded-md'
            onChange={(e)=>{setUserName(prev=>e.target.value)}}/>
            
            {/* password field */}
            <input type="password" 
            value={password} 
            placeholder='password' 
            className='w-1/2 h-10 font-serif font-bold text-xl focus:outline-none border-2 border-black rounded-md'
            onChange={(e)=>{setPassword(prev=>e.target.value)}}/>

            {
              error && <div className='w-full text-red-600'>
                <h2 className='text-center'>{error}</h2>
              </div>
            }
            
            {/* submit button */}
            <Button type='submit' colorScheme='blue' className='font-serif'>Submit</Button>
        </form>
    </div>
  )
}

export default Login
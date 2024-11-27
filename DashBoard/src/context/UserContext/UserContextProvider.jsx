import React,{useState,useEffect} from 'react'
import { UserContext } from './UserContext'
import { getUser } from '../../utils/client.utils'
import {io} from "socket.io-client"

function UserContextProvider({children}) {
    const [user,setUser] = useState(null)
    const [socket,setSocket] = useState(null)

    const loginUser = async()=>{
        const res = await getUser()
        if(res){
            setUser(prev=>res.data)
            setSocket(prev=>{
                const tempSocket =  io('http://localhost:8000',{
                    query:{
                        _id:res.data._id
                    }
                })
                return tempSocket
            })
        }
        else {
            setUser(prev=>null);
            setSocket(prev=>null);
        }
    }

    useEffect(()=>{
        loginUser()
    },[])

    useEffect(()=>{
        socket?.connect()
    },[socket])

    return(
        <UserContext.Provider value={{user,setUser,socket,setSocket}}>
            {children}
        </UserContext.Provider>
    )
}

export default UserContextProvider
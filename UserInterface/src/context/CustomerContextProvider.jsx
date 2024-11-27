import React, { useState,useEffect } from 'react'
import { CustomerContext } from './CustomerContext'
import {io} from "socket.io-client"

function CustomerContextProvider({children}) {
    const [module,setModule] = useState("") 
    const [socket,setSocket] = useState(null)
    useEffect(()=>{
        setSocket(prev=>{
            const tempSocket =  io('http://localhost:8000',{
                query:{
                    _id:import.meta.env.VITE_ORGID,
                    isCustomer:true
                }
            })
            return tempSocket
        })
    },[])
    return (
        <CustomerContext.Provider value={{module,setModule,socket,setSocket}}>
            {children}
        </CustomerContext.Provider>
  )
}

export default CustomerContextProvider
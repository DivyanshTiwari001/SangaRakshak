import React, { useContext, useState,useEffect } from 'react'
import NavBar from '../NavBar/NavBar'
import { Button } from '@chakra-ui/react';
import { UserContext } from '../../context/UserContext/UserContext';
import { useNavigate } from 'react-router-dom';

function Home() {
    const {user,socket} = useContext(UserContext)
    const [customer,setCustomer] = useState(
        {
            entryCustPhoto:"https://th.bing.com/th/id/OIP.IrUBHhdMo6wWLFueKNreRwHaHa?rs=1&pid=ImgDetMain",
            exitCustPhoto:"https://th.bing.com/th/id/OIP.IrUBHhdMo6wWLFueKNreRwHaHa?rs=1&pid=ImgDetMain",
            entryObjectPhoto:"https://i5.walmartimages.com/asr/76526810-91da-4917-87c1-69245968fdc7_2.f1f4cd6ed762d85ca8fcb08508c10147.jpeg",
            exitObjectPhoto:"https://i5.walmartimages.com/asr/76526810-91da-4917-87c1-69245968fdc7_2.f1f4cd6ed762d85ca8fcb08508c10147.jpeg",
            custMatch:80,
            objectMatch:48,
            reason:''
        }
    ) 
    const navigate = useNavigate()
    // just dummy variables
    
    const handleAccept = ()=>{
        socket.emit("accept")
    }
    const handleReject = ()=>{
        socket.emit("reject")
    }
    const handleReason = ()=>{
        socket.emit("ask-reason")
    }

    useEffect(()=>{
        console.log("Hello")
    },[customer])
    useEffect(()=>{
        if(!user)navigate('/login')
    },[user])

    useEffect(()=>{
        const handleEvent = async(res)=>{
            setCustomer(prev=>{
                console.log("updating")
                return Object.assign({},res.data);
        })
        }
        socket?.on("suspicious",handleEvent)
        socket?.on("reason",handleEvent)

        return ()=>{
            socket?.off("suscpicious",handleEvent)
            socket?.off("reason",handleEvent)
        }

    },[socket])

  return (
    <div className='w-full h-full flex flex-col'>
        <NavBar/>
        {/* content */}
        <div className='w-full flex flex-col mt-2'>
            <div className='w-full flex flex-row'>
                {/* person photo */}
                <div className={'w-1/2 flex flex-row justify-evenly border-2 ' + ((customer?.custMatch>=50)?'border-green-500':'border-red-500')}>
                    <div className='w-[350px] h-[350px] flex flex-col items-center'>
                        <h3 className='font-bold font-serif text-xl'>Entry</h3>
                        <img src={customer?.entryCustPhoto} alt="Old Image of Person"  className='w-[300px] h-[300px] border-2 border-green-400'/>
                    </div>
                    <div className='w-fit h-fit flex flex-col items-center'>
                        <h3 className='font-bold font-serif text-xl'>Exit</h3>
                        <img src={customer?.exitCustPhoto} alt="New Image of Person"  className='w-[300px] h-[300px] border-2 border-green-400'/>
                    </div>
                </div>
                {/* object photo */}
                <div className={'w-1/2 flex flex-row justify-evenly border-2 ' + ((customer?.objectMatch>=50)?'border-green-500':'border-red-500')}>
                    <div className='w-[350px] h-[350px] flex flex-col items-center'>
                            <h3 className='font-bold font-serif text-xl'>Entry</h3>
                            <img src={customer?.entryObjectPhoto} alt="Old Image of Object"  className='w-[300px] h-[300px] border-2 border-green-400'/>
                    </div>
                    <div className='w-fit h-fit flex flex-col items-center'>
                            <h3 className='font-bold font-serif text-xl'>Exit</h3>
                            <img src={customer?.exitObjectPhoto} alt="New Image of Object"  className='w-[300px] h-[300px] border-2 border-green-400'/>
                    </div>
                </div>
            </div>
            <div className='w-full flex flex-row'>
                {/* person matched percentage */}
                <div className='w-1/2 flex flex-row justify-center'>
                    <h3 className='font-bold font-serif text-2xl'>Matched : <span className={(customer?.custMatch<50)?'text-red-600':'text-green-600'}>{customer?.custMatch.toFixed(2)}%</span></h3>
                </div>
                {/* object matched percentage */}
                <div className='w-1/2 flex flex-row justify-center'>
                    <h3 className='font-bold font-serif text-2xl'>Matched : <span className={(customer?.objectMatch<50)?'text-red-600':'text-green-600'}>{customer?.objectMatch.toFixed(2)}%</span></h3>
                </div>
            </div>
            <div className='w-full  flex flex-col gap-10'>
                <div className='w-full  flex flex-row justify-center gap-x-10'>
                        <Button colorScheme='green' className='font-serif font-bold' onClick={handleAccept}>Accept</Button>
                        <Button colorScheme='yellow' className='font-serif font-bold' onClick={handleReason}>Ask Reason</Button>
                        <Button colorScheme='red' className='font-serif font-bold' onClick = {handleReject}>Reject</Button>
                </div>
                {
                    customer.reason && <div className='w-full flex flex-row justify-center'>
                        <audio controls key={customer.reason}>
                            <source src={customer.reason}/>
                        </audio>
                    </div>
                }
            </div>
        </div>
    </div>
  )
}

export default Home
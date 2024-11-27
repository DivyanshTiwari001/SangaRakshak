import React, { useContext } from 'react'
import { Button } from '@chakra-ui/react'
import { UserContext } from '../../context/UserContext/UserContext'
import { logoutClient } from '../../utils/client.utils'
import { useNavigate } from 'react-router-dom'

function NavBar() {
  const {user,setUser,socket,setSocket} = useContext(UserContext)
  const navigate = useNavigate()
  const handleLogout = async()=>{
    await logoutClient(user._id)
    socket.disconnect()
    setUser(prev=>null)
    setSocket(prev=>null)
    navigate("/login")
  }

  return (
    <div className='w-full h-14 border-2 flex flex-row justify-between items-center p-0 bg-blue-600 rounded-md'>
        <h2 className='font-bold font-serif text-4xl ml-12 text-white'>SangRakshak</h2>
        <Button colorScheme='blackAlpha' className='font-serif mr-12' onClick={handleLogout}>Logout</Button>
    </div>
  )
}

export default NavBar
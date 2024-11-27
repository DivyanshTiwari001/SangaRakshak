import React from "react"
import { Outlet } from "react-router-dom"
import { ChakraProvider } from '@chakra-ui/react'
import UserContextProvider from "./context/UserContext/UserContextProvider"
function App() {

  return (
    <div className="w-full h-full">
      <ChakraProvider>
        <UserContextProvider>
          <Outlet/>
        </UserContextProvider>
      </ChakraProvider>
      
    </div>
  )
}

export default App

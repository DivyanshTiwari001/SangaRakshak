import React from "react"
import { Outlet } from "react-router-dom"
import CustomerContextProvider from "./context/CustomerContextProvider"
function App() {
  return (
    <CustomerContextProvider>
      <Outlet/>
    </CustomerContextProvider>
  )
}

export default App

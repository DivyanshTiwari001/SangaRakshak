import React, { useState } from 'react'
import { CustomerContext } from './CustomerContext'


function CustomerContextProvider({children}) {
    const [module,setModule] = useState("") 
    return (
        <CustomerContext.Provider value={{module,setModule}}>
            {children}
        </CustomerContext.Provider>
  )
}

export default CustomerContextProvider
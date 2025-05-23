import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider,createBrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { Home,Login } from './customComponents/index.js'

const router = createBrowserRouter([
  {
    path:'/',
    element:<App/>,
    children:[
      {
        path:'',
        element:<Home/>
      },
      {
        path:'/login',
        element:<Login/>
      }
    ]
  }
])

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <RouterProvider router={router}></RouterProvider>
  // </StrictMode>,
)

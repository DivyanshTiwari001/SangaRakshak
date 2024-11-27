import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Home,UserEntryPage,UserExitPage } from './customComponents/index.js'


const router = createBrowserRouter(
  [
    {
      path:'/',
      element:<App/>,
      children:[
        {
          path:"",
          element:<Home/>
        },{
          path:"user-entry-page",
          element:<UserEntryPage/>
        },{
          path:"user-exit-page",
          element:<UserExitPage/>
        }
      ]
    }
  ]
)

createRoot(document.getElementById('root')).render(
    <RouterProvider router={router}/>
)

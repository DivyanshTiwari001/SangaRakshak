import React, { useEffect,useContext } from 'react'
import { CustomerContext } from '../../context/CustomerContext'
import { useNavigate } from 'react-router-dom'



function Home() {
  const {module,setModule} = useContext(CustomerContext)
  const navigate = useNavigate()
  useEffect(()=>{
    if(module!="")navigate('/user-page')
  },[module])
  return (
    !module && <div className='w-screen flex-col h-screen flex font-serif bg-blue-500 items-center'>
        <div className='w-screen flex flex-row justify-center mt-10'>
            <h1 className='text-white text-3xl font-extrabold'>Welcome To SangaRakshak User Module</h1>
        </div>
        <div className='w-[800px] h-[500px] bg-white mt-5 rounded-md shadow-md flex flex-col items-center justify-center'>
            <button className='w-[400px] h-[50px] text-white text-2xl font-bold font-serif shadow-md bg-blue-500 rounded-md hover:bg-blue-400'
            onClick={()=>{setModule(prev=>"entry")}}
            >Entry Module</button>
            <h1 className='mt-5 mb-5 font-serif text-black text-3xl font-bold'> OR </h1>
            <button className='w-[400px] h-[50px] text-white text-2xl font-bold font-serif shadow-md bg-blue-500 rounded-md hover:bg-blue-400'
            onClick={()=>{setModule(prev=>"exit")}}>Exit Module</button>
        </div>
    </div>
  )
}

export default Home
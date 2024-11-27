import React, { useRef,useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CustomerContext } from '../../context/CustomerContext'
import Webcam from 'react-webcam'

function UserPage() {
  const webcamRef = useRef(null);
  const {module} = useContext(CustomerContext)
  const [status,setStatus] = useState(false)
  const [userImage,setUserImage] = useState(null)
  const [objectImage,setObjectImage] = useState(null)
  const [objectMode,setObjectMode] = useState(false)
  const navigate = useNavigate()

  const handlePrev = async()=>{
    setObjectMode(prev=>false)
  }

  const handleNext = async()=>{
    if(objectMode==false){
      if(userImage!=null){
        setObjectMode(prev=>true)
      }
      else alert("User Image is required")
    }
    else{
      if(objectImage==null)alert("Are you sure, you're not carrying anything?")
      
      }
    setStatus(prev=>false)
  }

  const captureImage = () => {
    if (webcamRef.current) {
      const capturedImage = webcamRef.current.getScreenshot();
      if(!objectMode){
        setUserImage(prev=>capturedImage)
      }
      else{
        setObjectImage(prev=>capturedImage)
      }
      setStatus(prev=>true)
    }
  }

  useEffect(()=>{
    if(module === "")navigate("/")
    else if(module === "exit")navigate("/user-id-fetcher")
  },[module])
  return (
    module && <div className='w-screen flex-col h-screen flex font-serif bg-blue-500 items-center'>
        <div className='w-full flex flex-row justify-center mt-10 font-extrabold'>
          <h1 className='text-3xl text-white font-serif '>{objectMode?"Capture object You are Carrying" : "Please Capture Your Image"}</h1>
        </div>
        <div className='w-[800px] h-[500px] bg-white flex flex-col justify-center items-center mt-5 rounded-md shadow-md'>
            <div className='w-[400px] shadow-md rounded-md'>
                <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                style={{ width: "100%", maxWidth: "400px"}} 
             />
            </div>
            <div className='w-full flex flex-row justify-center gap-64 mt-10'>
                {objectMode && <button className="w-[150px] h-[40px] bg-blue-500 hover:bg-blue-400 text-xl font-serif font-bold text-white rounded-md shadow-md"
                onClick={handlePrev}>Previous</button>}
                <button className="w-[150px] h-[40px] bg-blue-500 hover:bg-blue-400 text-xl font-serif font-bold text-white rounded-md shadow-md" 
                onClick={captureImage}>{status?"Recapture" : "Capture"}</button>
                <button className="w-[150px] h-[40px] bg-blue-500 hover:bg-blue-400 text-xl font-serif font-bold text-white rounded-md shadow-md"
                onClick={handleNext}>Next</button>
            </div>
        </div>
    </div>
  )
}

export default UserPage
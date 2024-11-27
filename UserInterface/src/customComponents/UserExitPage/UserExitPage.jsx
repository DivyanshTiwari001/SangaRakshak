import React, { useRef,useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CustomerContext } from '../../context/CustomerContext'
import Webcam from 'react-webcam'
import QRCode from 'react-qr-code';
import { makeCustomerEntry } from '../../utils/customer';

function UserExitPage() {
  const webcamRef = useRef(null);
  const {module,socket} = useContext(CustomerContext)
  const [status,setStatus] = useState(false)
  const [userImage,setUserImage] = useState(null)
  const [objectImage,setObjectImage] = useState(null)
  const [objectMode,setObjectMode] = useState(false)
  const [customerId,setCustomerId] = useState(null)
  const [customerIdConfirmed,setCustomerIdConfirmed] = useState(false)
  const [reqStatus,setReqStatus] = useState(true)
  const navigate = useNavigate()

  const handlePrev = async()=>{
    setObjectMode(prev=>false)
  }

  const handleNext = async()=>{
    if(!reqStatus)return
    if(objectMode==false){
      if(userImage!=null){
        setObjectMode(prev=>true)
      }
      else alert("User Image is required")
    }
    else{
      setReqStatus(prev=>false)
      if(objectImage==null)alert("Are you sure, you're not carrying anything?")

      const res = await makeCustomerExit(userImage,objectImage)
    
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

  const handleDone = async()=>{
    if(customerId)setCustomerIdConfirmed(prev=>true)
    else alert("Your Id is required")
  }  

  useEffect(()=>{
    if(module === "")navigate("/")
  },[module])
  return (
    module && (customerIdConfirmed ?  <div className='w-screen flex-col h-screen flex font-serif bg-blue-500 items-center'>
        <div className='w-full flex flex-row justify-center mt-10 font-extrabold'>
          <h1 className='text-3xl text-white font-serif '>{objectMode?"Capture object You are Carrying" : "Please Capture Your Image"}</h1>
        </div>
        <div className='w-screen flex flex-row justify-center mt-5'>
          <div className='w-[70%] flex flex-row justify-end'>
            <div className='justify-self-center w-[800px] h-[500px] bg-white flex flex-col justify-center items-center  rounded-md shadow-md ml-5'>
                <div className='w-[400px] shadow-md rounded-md'>
                    <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    style={{ width: "100%", maxWidth: "400px"}} 
                />
                </div>
                <div className='w-full flex flex-row justify-center gap-5 mt-10'>
                    {objectMode && <button className="w-[180px] h-[40px] bg-blue-500 hover:bg-blue-400 text-xl font-serif font-bold text-white rounded-md shadow-md"
                    onClick={handlePrev}>Previous</button>}
                    <button className="w-[180px] h-[40px] bg-blue-500 hover:bg-blue-400 text-xl font-serif font-bold text-white rounded-md shadow-md" 
                    onClick={captureImage}>{status?"Recapture" : "Capture"}</button>
                    <button className="w-[180px] h-[40px] bg-blue-500 hover:bg-blue-400 text-xl font-serif font-bold text-white rounded-md shadow-md"
                    onClick={handleNext}>{!reqStatus?"Processing" : "Next"}</button>
                </div>
            </div>
          </div>
          <div className='w-[20%] flex flex-row justify-center items-center ml-5'>
            {userImage && <div className='w-[300px] h-[500px] flex flex-col bg-white rounded-md shadow-md items-center'>
                <div className='w-full flex flex-col items-center'>
                    <h1 className='font-bold text-xl'>User</h1>
                    <img src={userImage} alt=""  className='w-[90%] rounded-md shadow-md'/>
                </div>
                {
                  objectImage && <div className='w-full flex flex-col items-center'>
                    <h1 className='font-bold text-xl'>Object</h1>
                    <img src={objectImage} alt=""  className='w-[90%] rounded-md shadow-md'/>
                </div>
                } 
            </div>
            }
          </div>
        </div>
    </div>
    :
    <div className='w-screen flex-col h-screen flex font-serif bg-blue-500 items-center'>
         <div className='w-full flex flex-row justify-center mt-10 font-extrabold'>
          <h1 className='text-3xl text-white font-serif '>Please Enter Your ID</h1>
        </div>
        <div className='w-screen flex flex-col items-center mt-5'>
            <div className='justify-self-center w-[800px] h-[500px] bg-white flex flex-col justify-center items-center  rounded-md shadow-md ml-5'>
                <div className='w-[400px] shadow-md rounded-md'>
                    <input type="text" className='w-full h-[60px] border-3 border-black rounded-md text-2xl font-serif font-extrabold text-center' value={customerId} onChange={(e)=>{setCustomerId(prev=>e.target.value)}}/>
                </div>
                <div className='w-full flex flex-row justify-center gap-5 mt-10'>
                   <button className="w-[180px] h-[40px] bg-blue-500 hover:bg-blue-400 text-xl font-serif font-bold text-white rounded-md shadow-md"
                    onClick={handleDone}>Done</button>
                </div>
            </div>
        </div>
    </div>
    )
  )
}

export default UserExitPage
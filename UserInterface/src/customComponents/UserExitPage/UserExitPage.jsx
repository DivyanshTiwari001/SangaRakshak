import React, { useRef, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CustomerContext } from '../../context/CustomerContext'
import Webcam from 'react-webcam'
// import QRCode from 'react-qr-code';
import { makeCustomerExit, submitReason } from '../../utils/customer';
import RecordRTC from 'recordrtc';

function UserExitPage() {
  const webcamRef = useRef(null);
  const { module, socket, setModule } = useContext(CustomerContext)
  const [status, setStatus] = useState(false)
  const [userImage, setUserImage] = useState(null)
  const [objectImage, setObjectImage] = useState(null)
  const [objectMode, setObjectMode] = useState(false)
  const [xrayImage, setXrayImage] = useState(null)
  const [xrayMode, setXrayMode] = useState(false)
  const [weightMode, setWeightMode] = useState(false)
  const [objectWeight, setObjectWeight] = useState(null)
  const [customerId, setCustomerId] = useState(null)
  const [customerIdConfirmed, setCustomerIdConfirmed] = useState(false)
  const [reqStatus, setReqStatus] = useState(true)
  const [userStatus, setUserStatus] = useState(null)
  const navigate = useNavigate()
  const [isRecording, setIsRecording] = useState(false);  // Tracks if recording is in progress
  const [audioBlob, setAudioBlob] = useState(null); // Stores the audio blob for further processing
  const [recorder, setRecorder] = useState(null); // Initialize the recorder with a bit rate
  const [audioUrl, setAudioUrl] = useState('');
  // Start recording
  const startRecording = () => {
    setIsRecording(prev => true)
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const audioRecorder = new RecordRTC(stream, { type: 'audio' });
      audioRecorder.startRecording();
      setRecorder(prev => audioRecorder);
    });
  };
  // Stop recording
  const stopRecording = () => {
    recorder.stopRecording(() => {
      const audioBlob = recorder.getBlob();
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioBlob(prev => audioBlob)
      setAudioUrl(prev => audioUrl);
      setIsRecording(prev => false)
    });
  };

  // submitting the reason
  const handleReasonSubmit = async () => {
    await submitReason(customerId, audioBlob)
  }

  const handlePrev = async () => {
    if (weightMode) {
      setWeightMode(prev => false)
      setXrayMode(prev => true)
    }
    else if (xrayMode) {
      setXrayMode(prev => false)
      setObjectMode(prev => true)
    }
    else setObjectMode(prev => false)
  }

  const handleFinish = async () => {
    setModule(prev => "")
  }
  const handleNext = async () => {
    if (!reqStatus) return
    if (weightMode == false) {
      if (xrayMode == false) {
        if (objectMode == false) {
          if (userImage != null) {
            setObjectMode(prev => true)
          }
          else alert("User Image is required")
        }
        else setXrayMode(prev => true)
      }
      else setWeightMode(prev => true)
    }
    else {
      setReqStatus(prev => false)
      if (objectImage == null) alert("Are you sure, you're not carrying anything?")

      const res = await makeCustomerExit(userImage, customerId, objectImage, xrayImage,objectWeight)
      if (res.statusCode == 200) setUserStatus(prev => "accepted")

    }
    setStatus(prev => false)
  }

  const captureImage = () => {
    if (xrayMode) { }
    else if (webcamRef.current) {
      const capturedImage = webcamRef.current.getScreenshot();
      if (!objectMode) {
        setUserImage(prev => capturedImage)
      }
      else {
        setObjectImage(prev => capturedImage)
      }
      setStatus(prev => true)
    }
  }

  const handleDone = async () => {
    if (customerId) setCustomerIdConfirmed(prev => true)
    else alert("Your Id is required")
  }

  useEffect(() => {
    if (module === "") navigate("/")
    socket.on("accepted", () => {
      setUserStatus(prev => "accepted")
    })
    socket.on("rejected", () => {
      setUserStatus(prev => "rejected")
    })
    socket.on("give-reason", () => {
      setUserStatus(prev => "pending")
    })

    return () => {
      socket?.off("accepted")
      socket?.off("rejected")
      socket?.off("give-reason")
    }


  }, [module])
  return (
    !userStatus ? module && (customerIdConfirmed ? <div className='w-screen flex-col h-screen flex font-serif bg-blue-500 items-center'>
      <div className='w-full flex flex-row justify-center mt-10 font-extrabold'>
        {weightMode && <h1 className='text-3xl text-white font-serif '>Capture Weight</h1>}
        {!weightMode && !xrayMode && objectMode && <h1 className='text-3xl text-white font-serif '>Capture object You are Carrying</h1>}
        {!weightMode && xrayMode && <h1 className='text-3xl text-white font-serif '>Capture object You are Carrying with Xray Camera</h1>}
        {!objectMode && !xrayMode && !weightMode && <h1 className='text-3xl text-white font-serif '>Please Capture Your Image</h1>}
      </div>
      <div className='w-screen flex flex-row justify-center mt-5'>
        <div className='w-[70%] flex flex-row justify-end'>
          <div className='justify-self-center w-[800px] h-[500px] bg-white flex flex-col justify-center items-center  rounded-md shadow-md ml-5'>
            {
              !weightMode && <div className='w-[400px] shadow-md rounded-md'>
                {!xrayMode && <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  style={{ width: "100%", maxWidth: "400px" }}
                />}
                {
                  xrayMode && <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setXrayImage(reader.result);
                          setStatus(true);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                }

              </div>
            }
            {
              weightMode && <div className='w-[400px] shadow-md rounded-md'>
                <input type="number" step="any" placeholder="Enter weight in kgs" className='border rounded-md p-2 w-full appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [-moz-appearance:textfield]'
                  onChange={(e) => setObjectWeight(prev => e.target.value)} />
              </div>
            }
            <div className='w-full flex flex-row justify-center gap-5 mt-10'>
              {(objectMode || xrayMode || weightMode) && <button className="w-[180px] h-[40px] bg-blue-500 hover:bg-blue-400 text-xl font-serif font-bold text-white rounded-md shadow-md"
                onClick={handlePrev}>Previous</button>}
              {!weightMode && <button className="w-[180px] h-[40px] bg-blue-500 hover:bg-blue-400 text-xl font-serif font-bold text-white rounded-md shadow-md"
                onClick={captureImage}>{status ? "Recapture" : "Capture"}</button>}
              <button className="w-[180px] h-[40px] bg-blue-500 hover:bg-blue-400 text-xl font-serif font-bold text-white rounded-md shadow-md"
                onClick={handleNext}>{!reqStatus ? "Processing" : "Next"}</button>
            </div>
          </div>
        </div>
        <div className='w-[20%] flex flex-row justify-center items-center ml-5'>
          {userImage && <div className='w-[300px] h-[500px] flex flex-col bg-white rounded-md shadow-md items-center overflow-y-auto'>
            <div className='w-full flex flex-col items-center'>
              <h1 className='font-bold text-xl'>User</h1>
              <img src={userImage} alt="" className='w-[90%] rounded-md shadow-md' />
            </div>
            {
              objectImage && <div className='w-full flex flex-col items-center'>
                <h1 className='font-bold text-xl'>Object</h1>
                <img src={objectImage} alt="" className='w-[90%] rounded-md shadow-md' />
              </div>
            }
            {
              xrayImage && <div className='w-full flex flex-col items-center'>
                <h1 className='font-bold text-xl'>Object-Xray View</h1>
                <img src={xrayImage} alt="" className='w-[90%] rounded-md shadow-md' />
              </div>
            }
            {
              objectWeight && <div className='w-full flex flex-col items-center'>
                <h1 className='font-bold text-xl'>Object Weight</h1>
                <p className='w-[90%] rounded-md shadow-md text-center text-xl font-bold'>{objectWeight} Kgs</p>
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
              <input type="text" className='w-full h-[60px] border-3 border-black rounded-md text-2xl font-serif font-extrabold text-center' value={customerId} onChange={(e) => { setCustomerId(prev => e.target.value) }} />
            </div>
            <div className='w-full flex flex-row justify-center gap-5 mt-10'>
              <button className="w-[180px] h-[40px] bg-blue-500 hover:bg-blue-400 text-xl font-serif font-bold text-white rounded-md shadow-md"
                onClick={handleDone}>Done</button>
            </div>
          </div>
        </div>
      </div>
    )
      :
      (
        <div className='w-screen flex-col h-screen flex font-serif bg-blue-500 items-center'>
          <div className='w-full flex flex-row justify-center mt-10 font-extrabold'>
            <h1 className='text-3xl text-white font-serif '>{userStatus === 'accepted' ? "ThankYou For Visiting" : (userStatus === 'rejected' ? "Please Wait Here" : "Please Provide Reason for Object Mismatch")}</h1>
          </div>
          {
            userStatus !== 'pending' ? <div className='w-screen flex flex-col items-center mt-5'>
              <div className='justify-self-center w-[800px] h-[500px] bg-white flex flex-col justify-center items-center  rounded-md shadow-md ml-5'>
                <div className='w-[400px] shadow-md rounded-md'>
                  {userStatus === 'accepted' ? <h1 className='w-full h-[60px] border-3 border-black rounded-md text-2xl text-green-400 font-serif font-extrabold text-center'> Your Identity Verified Successfully </h1>
                    :
                    <h1 className='w-full h-[60px] border-3 border-black rounded-md text-2xl text-red-500 font-serif font-extrabold text-center'> Suspicion Detected!!<br />Please Wait For Authorities </h1>
                  }
                </div>
                <div className='w-full flex flex-row justify-center gap-5 mt-10'>
                  <button className="w-[180px] h-[40px] bg-blue-500 hover:bg-blue-400 text-xl font-serif font-bold text-white rounded-md shadow-md"
                    onClick={handleFinish}>Finish</button>
                </div>
              </div>
            </div>
              :
              <div className='w-screen flex flex-col items-center mt-5'>
                <div className='justify-self-center w-[800px] h-[500px] bg-white flex flex-col justify-center items-center  rounded-md shadow-md ml-5'>
                  {audioUrl && <audio controls src={audioUrl}></audio>}
                  <div className='w-full flex flex-row justify-center gap-5 mt-10'>
                    <button className="w-[180px] h-[40px] bg-blue-500 hover:bg-blue-400 text-xl font-serif font-bold text-white rounded-md shadow-md"
                      onClick={startRecording} disabled={isRecording}>Start Recording</button>
                    <button className="w-[180px] h-[40px] bg-blue-500 hover:bg-blue-400 text-xl font-serif font-bold text-white rounded-md shadow-md"
                      onClick={stopRecording} disabled={!isRecording}>Stop Recording</button>
                    <button className="w-[180px] h-[40px] bg-blue-500 hover:bg-blue-400 text-xl font-serif font-bold text-white rounded-md shadow-md"
                      onClick={handleReasonSubmit} disabled={isRecording}>Submit</button>

                  </div>
                </div>
              </div>
          }
        </div>
      )
  )
}

export default UserExitPage
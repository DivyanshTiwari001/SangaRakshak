import axios from "axios";
const baseUrl = "http://localhost:8000/api/v1/customers"

const makeCustomerEntry = async(userImage,objectImage,xrayImage,objectWeight)=>{
        const formData = new FormData();
        const blob1 = await (await fetch(userImage)).blob();
        formData.append("customerPhoto", blob1, "userImage.jpg")
        if(objectImage){
            const blob2 = await (await fetch(objectImage)).blob()
            formData.append("objectPhoto",blob2,"objectImage.jpg")
        }
        if(xrayImage){
            const blob3 = await (await fetch(xrayImage)).blob()
            formData.append("xrayPhoto",blob3,"xrayImage.jpg")
        }
        if(objectWeight){
            formData.append("objectWeight",objectWeight)
        }
        formData.append("orgId",import.meta.env.VITE_ORGID)
        const url = baseUrl + '/customer-entry'
        try{
            const res = await axios.post(url,formData,{
                headers: {
                  "Content-Type": "multipart/form-data",
                }
            })
            return res.data;
        }catch(err){
            console.log(err)
        }
}

const makeCustomerExit = async(userImage,customerId,objectImage,xrayImage,objectWeight)=>{
       const model_url = "http://localhost:8080/api/v1/customer/get-similarity"
       let entryCustPhoto = ""
       let entryObjectPhoto = ""
       let entryXrayPhoto = ""
       let customerScore = null
       let objectScore = null
       let xrayScore = null
       try{
        const url = baseUrl + '/get-customer'
        const res = await axios.post(url,{customerId})
        entryCustPhoto = res.data.data.entryCustPhoto
        entryObjectPhoto = res.data.data.entryObjectPhoto
        entryXrayPhoto = res.data.data.entryXrayPhoto
       }catch(err){
        console.log(err)
       }

       try{
            const blob1 = await (await fetch(userImage)).blob();
            const blob2 = await (await fetch(entryCustPhoto)).blob();
            const formData1 = new FormData()
            formData1.append('image1',blob1,'image1.jpg') 
            formData1.append('image2',blob2,'image2.jpg')
            if(entryObjectPhoto!==""){
                const blob3 = await (await fetch(objectImage)).blob();
                const blob4 = await (await fetch(entryObjectPhoto)).blob();
                formData1.append('image3',blob3,'image3.jpg')
                formData1.append('image4',blob4,'image4.jpg')
            } 
            if(entryXrayPhoto!==""){
                const blob5 = await (await fetch(xrayImage)).blob();
                const blob6 = await (await fetch(entryXrayPhoto)).blob();
                formData1.append('xray1',blob5,'xray1.jpg')
                formData1.append('xray2',blob6,'xray2.jpg')
            }
            const res = await axios.post(model_url,formData1)
            customerScore = res.data.custScore
            objectScore = res.data?.objectScore || 0
            xrayScore = res.data?.xrayScore || 0

            const formData2 = new FormData()
            formData2.append('customerId',customerId)
            formData2.append('customerPhoto',blob1,'userImage.jpg')
            formData2.append('custMatch',customerScore)
            if(objectImage){
                const blob3 = await (await fetch(objectImage)).blob();
                formData2.append('objectPhoto',blob3,'objectImage.jpg')
                formData2.append('objectMatch',objectScore)
            }
            if(xrayImage){
                const blob4 = await (await fetch(xrayImage)).blob();
                formData2.append('xrayPhoto',blob4,'xrayImage.jpg')
                formData2.append('xrayMatch',xrayScore)
            }
            if(objectWeight){
                formData2.append('objectWeight',objectWeight)
            }
            const url2 = baseUrl + '/customer-exit'
            const serv_res = await axios.post(url2,formData2)
            console.log(serv_res.data)
            return serv_res.data;
       }catch(err){
        console.log(err)
       }


}

const submitReason = async(customerId,audio)=>{
    const url = baseUrl + '/submit-reason'
    try{
        const formData = new FormData()
        formData.append('reason',audio, 'recorded-audio.mp3')
        formData.append('customerId',customerId)
        await axios.post(url,formData)
        console.log("callmade")
    }catch(err){
        console.log(err)
    }
}

export{
    makeCustomerEntry,
    makeCustomerExit,
    submitReason
}
import axios from "axios";
const baseUrl = "http://localhost:8000/api/v1/customers"
const baseUrl = "http://localhost:8000/api/v1/customers"

const makeCustomerEntry = async(userImage,objectImage)=>{
        const formData = new FormData();
        const blob1 = await (await fetch(userImage)).blob();
        formData.append("customerPhoto", blob1, "userImage.jpg")
        if(objectImage){
            const blob2 = await (await fetch(objectImage)).blob()
            formData.append("objectPhoto",blob2,"objectImage.jpg")
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

const makeCustomerExit = async(userImage,objectImage)=>{

}

export{
    makeCustomerEntry
}
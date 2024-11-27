import axios from "axios"

const baseUrl = "http://localhost:8000/api/v1/users"


const loginClient = async(data)=>{
    const url = baseUrl + '/login'
    const res = await axios.post(url,data,{withCredentials:true});
    return res.data;
}

const logoutClient = async()=>{
    const url = baseUrl + '/logout'
    const res = await axios.get(url,{withCredentials:true});
    return res.data;
}

const getUser = async()=>{
    const url = baseUrl + '/get-user'
    const res = await axios.get(url,{withCredentials:true})
    return res.data;
} 

export {
    loginClient,
    logoutClient,
    getUser
}
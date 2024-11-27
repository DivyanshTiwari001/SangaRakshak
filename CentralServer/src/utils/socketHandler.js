import { exitModuleIds,users } from "../constants.js"
import { ApiResponse } from "./ApiResponse.js"


const socketHandler = (socket)=>{
        socket.on("accept",()=>{
            socket.to(exitModuleIds[socket.userId]).emit("accepted",new ApiResponse(200,[],"successfully accepted"))
        })

        socket.on("reject",()=>{
            socket.to(exitModuleIds[socket.userId]).emit("rejected",new ApiResponse(200,[],"suspicion detected"))
        })

        socket.on("ask-reason",()=>{
            socket.to(exitModuleIds[socket.userId]).emit("give-reason",new ApiResponse(200,[],"required reason"))
        })


        socket.on("disconnect",async()=>{
            if(socket.handshake.query.isCustomer)delete exitModuleIds[socket.userId]
            else delete users[socket.userId]
            console.log(`Disconnected ${socket.userId}`)
        })
}

export {socketHandler}
import dotenv from "dotenv"
import  connectDB  from "./db/index.js";
import app from "./app.js"
import http from "http"
import { socketHandler } from "./utils/socketHandler.js";
import {Server} from "socket.io"
import { ApiError } from "./utils/ApiError.js";
import {exitModuleIds, users} from "./constants.js"

let globalSocket = null

dotenv.config({
    path: "./.env"
})

const server = http.createServer(app)

const io = new Server(server,
    {
        cors: {
            origin: process.env.CORS_ORIGIN,
            methods: ['GET', 'POST', 'PUT', 'DELETE']
        }
    }
)

// extracting user_id from request
io.use((socket,next)=>{
    const userId = socket.handshake.query._id

    if(!userId){
        return next(new ApiError(400,"Bad request"))
    }

    socket.userId = userId
    
    if(socket.handshake.query.isCustomer) exitModuleIds[userId] = socket.id
    else users[userId] = socket.id
    
    return next()
})

io.on("connection",(socket)=>{
    console.log("User connected : "+socket.id)
    socketHandler(socket)
})


connectDB()
.then(()=>{
    server.on("error",(error)=>{
        console.log("ERROR : ",error.message)
    })

    const port = process.env.PORT || 8000

    server.listen(port,()=>{
        console.log(`Listening at port: ${port}`)
    })

})
.catch(error=>{
    console.error("ERROR : "+error.message+"\nSTACK : "+error.stack)
})

export default io
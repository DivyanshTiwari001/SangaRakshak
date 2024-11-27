import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin:[process.env.CORS_ORIGIN_CLIENT,process.env.CORS_ORIGIN_CUSTOMER],
    credentials:true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))

app.use(cookieParser())


// routes
import userRoutes from "../src/routes/client.routes.js"
import customerRoutes from "../src/routes/customer.routes.js"


app.use("/api/v1/users",userRoutes)
app.use("/api/v1/customers",customerRoutes)


export default app;
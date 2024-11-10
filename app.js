import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app=express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({
    extended:true,
    limit:"16kb"
}))

//Allow app to use cookie 
app.use(cookieParser())

// Routes import
import userRouter from './src/router/user.route.js'

//routes declaration
app.use("/api/v1/user",userRouter)

//product route
import productRoute from './src/router/product.route.js'
app.use("/api/v1/product",productRoute);

export default app

// MODULES
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
require('dotenv/config')
const connetDB = require('./database/db')
const authRouter = require('./routes/authRoutes.js')
// APP
const app = express()
const port = process.env.PORT || 4321

// DB CONNECTION

connetDB()

// MIDDLEWARE
app.use(express.json())
app.use(cookieParser())
app.use(cors({credentials : true}))

// API ENDPOINT
app.get('/api/auth', (req,res) => {
    res.status(200)
    .json({
        status : "success",
        data : {
            message : "pass"
        }
    })
} )
// AUTH ENDPOINTS
app.use('/api/auth', authRouter)




// SERVER 
app.listen(port, () => {
    console.log(`Server start on PORT : ${port}`)
})


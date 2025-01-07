const jwt = require('jsonwebtoken')

const userAuth = async (req,res,next) => {
    const {token} = req.cookies

    if(!token)
    {
        res.json({
            status: false,
            data: {
                message: "Not Auth Login Again"
            }
        })
    }

    try {

       const tokenDecode =  jwt.verify(token, process.env.JWT)

       if(tokenDecode.id)
       {
        req.body.userId = tokenDecode.id
       }else
       {
        res.json({
            status: false,
            data: {
                message: "Not Auth Login Again"
            }
        })
       }

       next()
        
    } catch (error) {
        res.json({
            status: false,
            data: {
                message: error.message
            }
        })
    }
}


module.exports = userAuth
const userModel = require('../models/userModel.js')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const transporter = require('../mails/nodeMailer.js')

// REGISTER FUNCTION
exports.Register = async  (req,res) => {

    // GETTING USER INFO
    const {username,email,password} = req.body

    // CHECKING IF USER PROVIDE INFO
    if(!username || !email || !password)
    {
        return res.json({
            status: false,
            data: {
                message: "Missing Details"
            }
        })
    }

    // IF USER PROVIDE INFO
    try {
        // CHECKING IF USER ALREADY EXISTS
        const existingUser = await userModel.findOne({email})
        if(existingUser)
        {
           return  res.json({
                status: false,
                data: {
                    message: "USER Already Exists"
                }
            })
        }

        // CONVERT PASSWORD IN HASHEDPASSWORD
        const hashedPassword = await bcrypt.hash(password, 10)

        // CREATING USER
        const user = new userModel({username, email, password: hashedPassword})

        // SAVE USER IN DB
        await user.save()

        // JWT TOKEN IMP
        const token = jwt.sign({id: user._id}, process.env.JWT, {expiresIn: '7d'})

        // EDIT TOKEN IN THE COOKIE
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.ENV === 'production',
            sameSite: process.env.ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 
        })

        // SENDING WELCOME EMAIL
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Wellcom from 1mmun1ty',
            text: `Your account is created with this email : ${email}`
        }

        await transporter.sendMail(mailOptions)


        // RETURING RESPONSE 
        return res.json({
            status: true,
            data: {
                message: "User Created"
            }
        }) 


    } catch (error) {
        res.json({
            status: false,
            data: {
                message: error.message
            }
        })
    }
}

// LOGIN FUNCTION
exports.Login = async (req,res) => {

    // CHECKING EMAIL AND PASSWORD Are PROVIDED
    const {email, password} = req.body

    if(!email || !password)
    {
        return res.json({
            status: false,
            data: {
                message: "Email & Password Not Found!"
            }
        })
    }

   try {

     // CHECKING USER EXISTS ON EMAIL
     const user = await userModel.findOne({email})

     if(!user)
     {
         return res.json({
             status: false,
             data: {
                 message: "Invalid Email"
             }
         })
     }
     
     // CHECKING PASSWORD 
     const passwordIsMatch = await bcrypt.compare(password, user.password)

     if(!passwordIsMatch)
     {
        return res.json({
            status: false,
            data: {
                message: "Invalid Password"
            }
        }) 
     }

     // USER AUTH TOKEN
     const token = jwt.sign({id: user._id}, process.env.JWT, {expiresIn: '7d'})

        // EDIT TOKEN IN THE COOKIE
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.ENV === 'production',
            sameSite: process.env.ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 
        })

        // RETURING RESPONSE 
        return res.json({
            status: true,
            data: {
                message: "Login"
            }
        }) 

 
   } catch (error) {

    res.json({
        status: false,
        data: {
            message: error.message
        }
    })
    
   }

}

// LOGOUT FUNCTION
exports.Logout = async (req,res) => {
    // CLEARING COOKIE DATA TO LOGOUT
    try {
        
       res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.ENV === 'production',
            sameSite: process.env.ENV === 'production' ? 'none' : 'strict'
        })

       return res.json({
        status: true,
        data: {
            message: "Logout"
        }
    })
    } catch (error) {
        res.json({
            status: false,
            data: {
                message: error.message
            }
        })
        
       } 
}

// SEND VERIFICATION OPT TO USER 
exports.SendOtp = async (req,res) => {
    try {
    
        const {userId} = req.body
        const user = await userModel.findById(userId)

        // CHECKING ACCOUNT IS VERIFIED OR NOT
        if(user.isAccountVerified)
        {
            return res.json({
                status: false,
                data: {
                    message: "Account Already Verified"
                }
            }) 
        }

        // CREATING OTP
        const  otp = String(Math.floor(100000 + Math.random() * 900000))
        user.verifyOTP = otp
        user.verifyOTPExpireAt = Date.now() + 24 * 60 * 60 * 1000

        await user.save()

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account Verification OTP',
            text: `Your OPT is ${otp}  Verify mail with this OTP`
        }

        await transporter.sendMail(mailOptions)

        return res.json({
            status: true,
            data: {
                message: "Verifiction OTP Sent on Email"
            }
        })


    } catch (error) {
        res.json({
            status: false,
            data: {
                message: error.message
            }
        })
    }
}

// VERIFY EMAIL
exports.verifyEmail = async (req,res) => {

    const {userId, otp} = req.body

    if(!userId || !otp)
    {
       return  res.json({
            status: false,
            data: {
                message: "Missing Details"
            }
        })
    }

    try {

        const user  = await userModel.findById(userId)

        if(!user)
        {
            return res.json({
                status: false,
                data: {
                    message: "User Not Found"
                }
            })
        }

        if(user.verifyOTP === '' || user.verifyOTP !== otp)
        {
           return  res.json({
                status: false,
                data: {
                    message: "Invalid OTP"
                }
            })
        }

        if(user.verifyOTPExpireAt < Date.now())
        {
           return  res.json({
                status: false,
                data: {
                    message: "OPT Expired"
                }
            })
        }
        
        user.isAccountVerified = true
        user.verifyOTP = ''
        user.verifyOTPExpireAt = 0

        await user.save()

        return res.json({
            status: true,
            data: {
                message: "Email Verify Successfuly"
            }
        })

    } catch (error) {
        res.json({
            status: false,
            data: {
                message: error.message
            }
        })
    }
}

// CHECK USER CURRENTLY LOGIN OR NOT
exports.isAuthenticated = async (req,res) => {

    try {

        return res.json({
            status: true,
            
        })
        
    } catch (error) {
        res.json({
            status: false,
            data: {
                message: error.message
            }
        })
    }
}

exports.passwordResetOtp = async (req,res) => {

    const {email} = req.body

    if(!email)
    {
       return res.json({
            status: false,
            data: {
                message: "Missing Details"
            }
        }) 
    }

    try {
    

        const user = await userModel.findOne({email})

        if(!user)
        {
            return res.json({
                status: false,
                data: {
                    message: "user not found"
                }
            })
            
        }
        const  otp = String(Math.floor(100000 + Math.random() * 900000))
        user.resetOTP = otp
        user.resetOPTExpireAt = Date.now() + 15 * 60 * 1000

        await user.save()

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Password Reset OTP',
            text: `Your OPT is  ${otp}  for Reseting Password`
        }

        await transporter.sendMail(mailOptions)

        return res.json({
            status: true,
            data: {
                message: "OTP is Sent to your email"
            }
        })

    } catch (error) {
    
        res.json({
            status: false,
            data: {
                message: error.message
            }
        })
    }


}

// RESTING PASSWORD
exports.resetPassword = async (req,res) => {

    const {email , otp , newPassword} = req.body

    if(!email || !otp || !newPassword)
        {
            return res.json({
                status: false,
                data: {
                    message: "Missing Details"
                }
            })
        }  
    
    try {

        const user = await userModel.findOne({email})
        
        if(!user)
        {
            return res.json({
                status: false,
                data: {
                    message: "User no found"
                }
            })
        }
        if(user.resetOTP === "" || user.resetOTP !== otp)
        {
            return res.json({
                status: false,
                data: {
                    message: "Invlaid OTP"
                }
            })
        }

        if(user.resetOPTExpireAt < Date.now())
        {
            return res.json({
                status: false,
                data: {
                    message: "OTP Expired"
                }
            })
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)

        user.password = hashedPassword
        user.resetOTP = ''
        user.resetOPTExpireAt = 0

        await user.save()

        return res.json({
            status: true,
            data: {
                message: "Password Rest"
            }
        })
        
    } catch (error) {

        res.json({
            status: false,
            data: {
                message: error.message
            }
        })
    }
}

// GET ALL USER
exports.allUser = async (req,res ) => {

    const users = await userModel.find()

    try {
        
        res.json({
            status: true,
            data: {
                message: "All User",
                users: userModel.length,
                users
            }
        })
    } catch (error) {
        res.json({
            status: false,
            data: {
                message: error.message
            }
        }) 
    }
}

// GET USER BY ID
exports.getUser = async (req,res) => {
    try {

    const userId = req.params.id
    const user = await userModel.findById(userId)

    if(!user)
    {
        return res.json({
            status: false,
            data: {
                message: "user not fount"
            }
        }) 
    }

    res.json({
        status: true,
        data: {
            message: "user found",
            user
        }
    }) 
    
        

    } catch (error) {

        res.json({
            status: false,
            data: {
                message: error.message
            }
        })
    }
}

// DEETE USER
exports.deleteUser = async (req,res) => {
    try {
       
        const userId = req.params.id
        const user = await userModel.findByIdAndDelete(userId)

        if(!user)
        {
           return res.json({
                status: false,
                data: {
                    message: "User not Found"
                }
            })
        }

        res.json({
            status: true,
            data: {
                message: "User Deleted"
            }
        })

    } catch (error) {
        res.json({
            status: false,
            data: {
                message: error.message
            }
        })
    }
}

// UPDATE USER
exports.updateUser = async (req,res) => {

    const {email, username, password, newUserName} = req.body

    if(!email || !username || !password || !newUserName)
        {
            return res.json({
                status: false,
                data: {
                    message: "Missing Details"
                }
            })
        }  
    
    try {

        const user = await userModel.findOne({email})
        
        if(!user)
        {
            return res.json({
                status: false,
                data: {
                    message: "User no found"
                }
            })
        }
             // CHECKING PASSWORD 
     const passwordIsMatch = await bcrypt.compare(password, user.password)

     if(!passwordIsMatch)
     {
        return res.json({
            status: false,
            data: {
                message: "Invalid Password"
            }
        })
        
     }

     const existingUser = await userModel.findOne({ username: newUserName });

     if(existingUser)
     {
        return res.json({
            status: false,
            data: {
                message: "user Allready exits"
            }
        })
     }

        user.username = newUserName

        await user.save()

        return res.json({
            status: true,
            data: {
                message: "Username Update"
            }
        })
        
    } catch (error) {

        res.json({
            status: false,
            data: {
                message: error.message
            }
        })
    }
}
const express = require('express')
const authController = require('../controllers/authController.js')
const userAuth = require('../middlewares/userAuth.js')

const authRouter = express.Router()

authRouter.post('/register', authController.Register)
authRouter.post('/login', authController.Login)
authRouter.post('/logout', authController.Logout)
authRouter.post('/send-verify-otp', userAuth, authController.SendOtp)
authRouter.post('/verfiy-account', userAuth, authController.verifyEmail)
authRouter.post('/is-auth', userAuth, authController.isAuthenticated)
authRouter.post('/send-reset-otp', authController.passwordResetOtp)
authRouter.post('/reset-password', authController.resetPassword)

module.exports = authRouter
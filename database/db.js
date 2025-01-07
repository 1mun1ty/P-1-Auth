const mongoose = require('mongoose')

const connetDB = async () => {
    mongoose.connection.on('connected', () => {
        console.log('DB Connected')
    })

    await mongoose.connect(process.env.DB)
}
module.exports  = connetDB
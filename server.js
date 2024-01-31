const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config({ path: './config.env' })
const app = require('./app')

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.PASSWORD)

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(() => {
    console.log('DB connection successful')
})



const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`app running on port ${PORT}`)
})


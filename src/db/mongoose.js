const mongoose = require('mongoose')

const connectionURL = process.env.MONGODB_URL
mongoose.connect(connectionURL, 
    {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false
    })



    // const task = new Task({
    //     description: "                My second task",
    // })

    // task.save().then(() => {
    //     console.log(task)
    // }).catch((error) => {
    //     console.log("Error......", error)
    // })
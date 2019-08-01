//CRUD

// const mongodb = require('mongodb')
// const MongoClient = mongodb.MongoClient
// const ObjectID = mongodb.ObjectID
const {MongoClient, ObjectID} = require('mongodb')


const connectionURL = 'mongodb://127.0.0.1:27017'
const database = 'task-manager'

const id = new ObjectID()
console.log(id)
console.log(id.getTimestamp())



MongoClient.connect(connectionURL, { useNewUrlParser: true }, (error, client) => {
    if(error) {
        return console.log("Unable to connect to database.")
    }
    
    const db = client.db(database)

// db.collection('tasks').updateMany({

//     },
//     {
//         $set:{
//             completed: true
//         }

//     }).then((result) => {
//         console.log(result)
//     }).catch((error) => {
//         console.log(error)
//     })


    db.collection('tasks').deleteOne({
        description: 'Remember dog'
    }).then((result) => {
        console.log(result)   
    }).catch((error) => {
        console.log(error)
    })

})

const express = require('express')
const multer = require('multer')
const router = new express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')
const sharp = require('sharp')
const { sendWelcomeEmail, sendCancelEmail } = require('../emails/account')

router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try{
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()

        res.status(201).send({user, token})
    } catch (e) {
        res.status(400).send(e)
    }
    
})

router.post('/users/login', async (req, res) => {

    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        
        res.send({user, token})
    } catch(e) {
        console.log(e.message)
        res.status(400).send()
    }
})

router.post('/users/logoutall', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.status(200).send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token)=> {
            return token.token !== req.token

        })

        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()

    }
})

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

router.patch('/users/me', auth, async(req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update)=>{
        return allowedUpdates.includes(update)
    })

    if (!isValidOperation) {
        return res.status(400).send({error: 'Invalid updates!'})
    }

    const _id = req.user._id
    try{

        updates.forEach((update) => {
            req.user[update] = req.body[update]
        })

        await req.user.save()
        return res.status(200).send(req.user)

    } catch(e){
        return res.status(400).send()
    }
})


router.delete('/users/me', auth, async (req, res) => {
    try{
        // const user = await User.findByIdAndDelete(req.user._id)

        // if (!user) {
        //     return res.status(404). send()
        // }
        await req.user.remove()
        sendCancelEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch(e) {
        return res.status(500).send()
    }
})


const upload = multer({
    limits: {
        //limit of the file size in BYTES
        fileSize:1000000
    },
    //filters type cb= callback
    fileFilter(req, file, cb) {
        //checks if the file DOES NOT end with jpg, jpeg, png, gif
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('Please upload a jpg, png, or gif.'))
        }

        cb(undefined, true)
    }
})


router.post('/users/me/avatar', auth, upload.single('avatar') , async (req, res) => {
    
    //uses the sharp npm to convert all image files to png and resizes
    const buffer = await sharp(req.file.buffer).resize( {
        width: 250,
        height: 250
    }).png().toBuffer()

    // req.user.avatar = req.file.buffer
    req.user.avatar = buffer
    await req.user.save()
    res.send()
    //have to add the callback function with these four params for express to know
    // that it is error handler function
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

//deletes an avatar

router.delete('/users/me/avatar', auth, async (req, res) => {

    req.user.avatar = undefined
    await req.user.save()
    res.send()


}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

//get an image
router.get('/users/:id/avatar', async (req, res) => {

    try {
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar) {
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)

    } catch (e) {
        res.status(404).send()
    }
})

module.exports = router
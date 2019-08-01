const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const router = express.Router()



router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try{
        await task.save()
        res.status(201).send(task)
    } catch(e) {
        res.status(400).send()
    }
})

// GET TASKS - returns all tasks for a user
//can filter by completed/ not completed
//GET /tasks?limit=10&skip=1 would bring the second set of ten results
//GET /tasks? sortBy='prop name'(special character like _)'desc or asc'
router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}

    if(req.query.sortBy) {
        const parts = req.query.sortBy.split(":")
        sort[parts[0]] = parts[1].toLowerCase() === 'desc' ? -1 : 1
    }

    if(req.query.completed) {
        match.completed = req.query.completed === 'true'
        //if completed == 'true' it returns a boolean of true
        //if completed == 'false' it returns a boolean of false
    }
    try{
        //alternate way to do the search
        // const tasks = await Task.find({owner: req.user._id})
        // res.send(tasks)
        //doing the search with populate (foreign key search)
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch(e) {
        res.status(500).send()
    }
})

router.get('/tasks/:id', auth, async (req, res) => {

    const _id = req.params.id

    try{
        const task = await Task.findOne({ _id, owner: req.user._id})
        if(!task) {
            return res.status(404).send()
        }
        return res.send(task)
    } catch (e) {
        return res.status(404).send()
    }
})

router.patch('/tasks/:id', auth, async(req, res) => {
    const allowed = ['description', 'completed']
    const updates = Object.keys(req.body)
    const validOperation = updates.every((update)=>{
        return allowed.includes(update)
    })
    if(!validOperation) {
        return res.status(400).send({error: "Invalid updates selected"})
    }
    try{
        const _id = req.params.id
        const task = await Task.findOne({_id, owner: req.user._id})
        if(!task) {
            return res.status(404).send()
        }
        updates.forEach((update) => {
            task[update] = req.body[update]
        })
        await task.save()
        return res.send(task)
        
    }
    catch(e) {
        res.status(400).send({'error': e})
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    try{
        const _id = req.params.id
        // const task = await Task.findByIdAndDelete(req.params.id)
        const task = await Task.findOneAndDelete({_id, owner: req.user._id})
        if(!task) {
            return res.status(404).send()
        }
        return res.send(task)


    } catch(e) {
        res.status(500).send()
    }
})

module.exports = router
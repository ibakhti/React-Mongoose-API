const express  = require('express')
const port = require('./config')
const cors = require('cors')
const multer = require('multer')
const sharp = require('sharp')

const User = require('./models/user')
const Task = require('./models/task')
require('./config/mongose')


const app = express()
app.use(cors())
app.use(express.json())

app.post('/users', async (req, res) => { // Register user
    const user = new User(req.body) // create user

    try {
        await user.save() // save user
        res.status(201).send(user)
    } catch (e) {
        res.status(404).send(e.message)
    }
})

app.post('/users/login', async (req, res) => {// Login user
    const {email, password} = req.body // destruct property

    try {
        const user = await User.findByCredentials(email, password) // Function buatan sendiri, di folder models file user.js
        res.status(200).send(user)
    } catch (e) {
        res.status(201).send(e)
    }
})

app.post('/users/login/cookie', async (req, res) => {
    try {
        const user = await User.findById(req.body._id)
        res.status(200).send(user)
    } catch (e) {
        res.status(400).send(e)
    }
})

app.post('/tasks/:userid', async (req, res) => { // Create tasks by user id
    try {
        const user = await User.findById(req.params.userid) // search user by id
        if(!user){ // jika user tidak ditemukan
            throw new Error("Unable to create task")
        }
        const task = new Task({...req.body, owner: user._id}) // membuat task dengan menyisipkan user id di kolom owner
        user.tasks = user.tasks.concat(task._id) // tambahkan id dari task yang dibuat ke dalam field 'tasks' user yg membuat task
        await task.save() // save task
        await user.save() // save user
        res.status(201).send(task)
    } catch (e) {
        res.status(404).send("eroooorrrrr!!!!")
    }
})

app.get('/tasks/:userid', async (req, res) => { // Get own tasks
    try {
        // find mengirim dalam bentuk array
       const user = await User.find({_id: req.params.userid})
                    .populate({path:'tasks'}).exec()
        res.send(user[0].tasks)
    } catch (e) {
        
    }
})

app.delete('/tasks', async (req, res) => { // Delete task
    try {
        const task = await Task.findOneAndDelete({_id: req.body.taskid})

        if(!task){
            res.status(400).send("failed to delete task")
        }
        
        const user = await User.findById(req.body.userid)
        user.tasks = user.tasks.filter(t => t != req.body.taskid)
        user.save()

        res.sendStatus(200)
        
        if(!newUser){
            return res.status(404).send("Delete failed on taks user")
            
        }

        res.status(200).send(newUser)
    } catch (e) {
        res.status(400).send(e)
    }
})

app.patch('/tasks/:taskid/:userid', async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every(update => allowedUpdates.includes(update))

    if(!isValidOperation) {
        return res.status(400).send({err: "Invalid request!"})
    }

    try {
        const task = await Task.findOne({_id: req.params.taskid, owner: req.params.userid})
        
        if(!task){
            return res.status(404).send("Update Request")
        }
        
        updates.forEach(update => task[update] = req.body[update])
        await task.save()
        
        res.send("update berhasil")
        
        
    } catch (e) {
        
    }
})

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            //tolak
            return cb(new Error('please upload image file (jpg, jpeg, png)'))
        }
        
        //terima
        cb(undefined, true)
    }
})

app.post('/users/:id/avatar', upload.single('avatar'), async (req, res) => {
    try {
        const buffer = await sharp(req.file.buffer).resize({width: 300, height: 300}).png().toBuffer()
        const user = await User.findById(req.params.id)

        if(!user) {
            throw new Error("Unable to upload")
        }

        user.avatar = buffer
        user.save()
        res.send("Upload Success")
    }catch(e){
        res.status(400).send("Bad Request !!!")
    }
})

app.get('/users/:userid/avatar/:index', async(req, res) => {
    try {
        const user = await User.findById(req.params.userid)

        if(!user || !user.avatar){
            throw new Error("Not Found")
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(400).send("Bad Request !!!!")
    }
})

app.delete('/users/avatar', async(req, res) => {
    try {
        await User.findByIdAndUpdate(req.body.id, {$set: {avatar: null}})

        res.sendStatus(200)
    } catch (e) {
        res.status(404).send("Bad Request !!!!!")
    }
})

app.delete('/users', async(req, res) => {
    try {
        const user = await User.findById(req.body.id)
        const arrRes = user.tasks.map( async(task) => {
            try {
                await Task.findByIdAndDelete(task)
            } catch (e) {
                return e
            }
        })

        await User.findByIdAndDelete(req.body.id)

        res.status(200).send(arrRes)
    } catch (e) {
        res.status(404).send('error from app.delete:' + e)
        
    }
})

app.put('/users/update', async(req, res) => {
    try {
        if(!req.body.age){
            user = await User.findByIdAndUpdate(req.body.id, {$set: {name: req.body.name}})
            newUser = await User.findById(req.body.id)
            res.status(200).send(newUser)
        }else if (!req.body.name) {
            user = await User.findByIdAndUpdate(req.body.id, {$set: {age: req.body.age}})
            newUser = await User.findById(req.body.id)
            res.status(200).send(newUser)
        }else {
            user = await User.findByIdAndUpdate(req.body.id, {$set: {name: req.body.name, age: req.body.age}})
            newUser = await User.findById(req.body.id)
            res.status(200).send(newUser)
        }  
    } catch (e) {
        res.status(404).send('Error from app.put user/update ' + e)
    }   
})















app.listen(port, () => console.log("API Running on port " + port))
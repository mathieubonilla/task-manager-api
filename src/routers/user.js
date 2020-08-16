const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const router = new express.Router()
const User = require('../models/user')
const auth = require('../middleware/authentication')
const {sendWelcomeEmail, sendCancellationEmail} = require('../emails/account')


router.post('/users', async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()  //Only if this functions runs correctly the nex line will be executed (fullfilled), otherwhise the post function will stop here
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        //res.send({ user:  user.getPublicProfile(), token })
        res.send({ user, token })

    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {

        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })

        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {

        req.user.tokens = []

        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

router.patch('/users/me', auth, async (req, res) => {

    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid Updates!' })
    }
    try {
        updates.forEach((update) => {
            req.user[update] = req.body[update]
        })

        await req.user.save()

        if (!req.user) {
            return res.status(404).send()
        }
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/users/me', auth, async (req, res) => {


    try {
        await req.user.remove();
        sendCancellationEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (error) {

        res.status(500).send(error)

    }
})

const upload = multer({  // Creates the directory
    //dest: 'avatars',
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, callback) {

        if (!file.originalname.match('\.(jpg|jpeg|png)$')) {
            return callback(new Error('Please upload a pictue with one of the following extensions: .jpg, jpeg, .png'))
        }

        callback(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => { //The key 'avatar' should match with the incoming key of the file in order for the middleware to be triggered
    //req.user.avatar = req.file.buffer   // USER IS PRESENT IN REQUEST THANKS TO THE MIDDLEWARE AUTHENTICATION

    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer   // USER IS PRESENT IN REQUEST THANKS TO THE MIDDLEWARE AUTHENTICATION

    await req.user.save()

    res.send()

}, (error, req, res, next) => {

    res.status(400).send({ error: error.message })

})

router.delete('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => { //The key 'avatar' should match with the incoming key of the file in order for the middleware to be triggered
    req.user.avatar = undefined   // USER IS PRESENT IN REQUEST THANKS TO THE MIDDLEWARE AUTHENTICATION
    await req.user.save()

    res.send()

}, (error, req, res, next) => {

    res.status(400).send({ error: error.message })

})

router.get('/users/:id/avatar', async (req, res) => {

    try {

        const user = await User.findById(req.params.id)

        if (!user || !user.avatar) {
            throw new Error("The user is not found or it does not have any profile pic")
        }

        res.set('Content-Type', 'image/png') // The name of the response we are trying to set and the value
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send(e)
    }

})

module.exports = router









// router.get('/users', auth , async (req, res) => {
//     try {
//         const users = await User.find({}) // Empty object returns all documents
//         res.send(users)
//     } catch (e) {
//         res.status(500).send(e)
//     }

// })



// router.get('/users/:id', async (req, res) => {

//     const _id = req.params.id
//     try {
//         const user = await User.findById(_id)

//         if (!user) {
//             return res.status(404).send()
//         }

//         res.send(user)
//     } catch (e) {
//         res.status(500).send()
//     }
// })


// router.delete('/users/:id', auth,  async (req, res) => {


//     try {
//         const user = await User.findByIdAndDelete(req.params.id)
//         if (!user) {
//             return res.status(404).send()
//         }

//         res.send(user)
//     } catch (error) {

//         res.status(500).send(error)

//     }
// })



// router.patch('/users/:id', async (req, res) => {

//     const updates = Object.keys(req.body)
//     const allowedUpdates = ['name', 'email', 'password', 'age']
//     const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

//     if (!isValidOperation) {
//         return res.status(400).send({ error: 'Invalid Updates!' })
//     }

//     try {
//         //const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

//         const user = await User.findById(req.params.id)

//         updates.forEach((update) => {
//             user[update] = req.body[update]
//         })

//         await user.save()

//         if (!user) {
//             return res.status(404).send()
//         }
//         res.send(user)
//     } catch (e) {
//         res.status(400).send(e)
//     }
// })
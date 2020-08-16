const jwt = require('jsonwebtoken')
const User = require('../models/user')
const path = require('path')

const auth = async (req, res, next) => {

    try {

        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })

        if (!user) {
            throw new Error()
        }

        req.token = token
        req.user = user
        return next()

    } catch (e) {
        res.status(401).send({ error: "Please authenticate" })
    }
}

module.exports = auth



// app.use((req, res, next) => {

//     if (req.method === 'GET') {
//         res.send('GET requests are disabled')
//     } else {
//         next()
//     }
// })

const mongoose = require('mongoose')

const db_URL = process.env.MONGODB_URL

mongoose.connect(
    db_URL,
    { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false }
)


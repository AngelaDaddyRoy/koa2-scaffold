//数据库
const mongoose = require('mongoose')
const dbConn = () => {
    //连接数据库
    mongoose.connect('mongodb://localhost/mongo-test')
    const db = mongoose.connection
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function () {
        console.log('db connected')
    })
}

module.exports = dbConn
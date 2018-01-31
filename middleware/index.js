/*
 * @Author: AngelaDaddy 
 * @Date: 2018-01-31 00:32:00 
 * @Last Modified by: monodev
 * @Last Modified time: 2018-01-31 11:31:02
 * @Description: 中间件集合
 */

const bodyParser = require('koa-bodyparser')
const router = require('../routers')
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
//服务
const repository = require('../repository') 

module.exports = (app) => { 
    app.use(bodyParser())
    app.use(router.routes())
    dbConn()
    repository(app)
}
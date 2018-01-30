/*
 * @Author: AngelaDaddy 
 * @Date: 2018-01-31 00:32:00 
 * @Last Modified by: monodev
 * @Last Modified time: 2018-01-31 01:05:24
 * @Description: 中间件集合
 */
const onerror = require('koa-onerror')
const bodyParser = require('koa-bodyparser')
const router = require('../routers') 
const mongoose = require('mongoose') 
const dbConn = ()=> {
    //连接数据库
    mongoose.connect('mongodb://localhost/mongo-test')
    const db = mongoose.connection
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function () {
        console.log('db connected')
    })
} 

//挂载服务
const service = require('../services')


module.exports = (app) => {
    onerror(app,{json:true})
    app.use(bodyParser())
    app.use(router.routes())
    dbConn()
    service(app)
}
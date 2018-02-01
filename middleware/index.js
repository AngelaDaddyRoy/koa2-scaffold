/*
 * @Author: AngelaDaddy 
 * @Date: 2018-01-31 00:32:00 
 * @Last Modified by: monodev
 * @Last Modified time: 2018-01-31 15:54:37
 * @Description: 中间件集合
 */

const bodyParser = require('koa-bodyparser')
const router = require('../routers')
const dbConn =require('./mi/dbConn')
const errorHandler = require('./mi/errorHandler')
//服务
const repository = require('../repository')  

module.exports = (app) => { 
    errorHandler(app)
    app.use(bodyParser())
    app.use(router.routes())
    dbConn()
    repository(app) 
}
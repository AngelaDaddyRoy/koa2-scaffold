/*
 * @Author: monodev 
 * @Date: 2018-01-30 23:09:16 
 * @Last Modified by: monodev
 * @Last Modified time: 2018-01-31 14:56:08
 * @Description: user 路由
 */
const router = require('koa-router')()

const services =require('../routerServices')
router.get('/',services.user.getAll)
router.post('/',services.user.add)
module.exports = router
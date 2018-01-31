/*
 * @Author: monodev 
 * @Date: 2018-01-30 23:09:16 
 * @Last Modified by: monodev
 * @Last Modified time: 2018-01-31 09:51:58
 * @Description: user 路由
 */
const User = require('../services').User
const router = require('koa-router')()
router.get('/', async function (ctx) {
    const users = await User.find()
    ctx.body = users
})
router.post('/', async function (ctx, next) {
    const newUser = new User({
        username: 'aaa',
        password: 'aaa'
    })
    const result = await newUser.save()
    ctx.body = result
})
router.get('/test', async function (ctx) {
    ctx.throw(400,'bad request')
})
module.exports = router
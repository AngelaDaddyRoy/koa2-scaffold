/*
 * @Author: monodev 
 * @Date: 2018-01-30 23:09:16 
 * @Last Modified by: monodev
 * @Last Modified time: 2018-01-31 11:35:37
 * @Description: user 路由
 */
const router = require('koa-router')()
const services = require('../services')

router.get('/', async function (ctx) {
    const users = await ctx.repo.User.find()
    ctx.body = users
})
router.post('/', async function (ctx, next) {
    const newUser = new ctx.repo.User({
        username: 'aaa',
        password: 'aaa'
    })
    const result = await newUser.save()
    ctx.body = result
})
router.get('/auth', async function (ctx) {
 
    const token = services.tokenService.signToken({
        username: 'aaa',
        password: 'aaa'
    })
    ctx.body = token
})
module.exports = router
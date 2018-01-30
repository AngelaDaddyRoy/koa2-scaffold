/*
 * @Author: monodev 
 * @Date: 2018-01-30 23:22:18 
 * @Last Modified by: monodev
 * @Last Modified time: 2018-01-30 23:55:57
 * @Description: blog router
 */

const router  = require('koa-router')()
router.get('/',async function(ctx){
    const blogs = await ctx.service.Blog.find()
    ctx.body = blogs
})
router.post('/',async function(ctx,next){
    const req = ctx.request
    const newBlog = new ctx.service.Blog({
        title:req.body.title,
        author:req.body.author,
        body:req.body.body
    })
    const result = await newBlog.save()
    ctx.body = result
})
module.exports = router
/*
 * @Author: monodev 
 * @Date: 2018-01-30 23:22:18 
 * @Last Modified by: monodev
 * @Last Modified time: 2018-01-31 11:52:37
 * @Description: blog router
 */

const router  = require('koa-router')()
router.get('/',async function(ctx){
    const blogs = await ctx.repo.Blog.find()
    ctx.body = blogs
})
router.post('/',async function(ctx,next){
    const req = ctx.request
    const newBlog = new ctx.repo.Blog({
        title:req.body.title,
        author:req.body.author,
        body:req.body.body
    })
    const result = await newBlog.save()
    ctx.body = result
})
module.exports = router
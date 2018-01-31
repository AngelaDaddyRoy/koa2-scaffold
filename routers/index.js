const router  = require('koa-router')()
const userRouter = require('./subRouters/user')
const blogRouter = require('./subRouters/blog')
router.prefix('/api')

router.use('/users',userRouter.routes(),userRouter.allowedMethods())
router.use('/blogs',blogRouter.routes(),blogRouter.allowedMethods())

module.exports = router
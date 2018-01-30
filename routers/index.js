const router  = require('koa-router')()
const userRouter = require('./user')
const blogRouter = require('./blog')
router.prefix('/api')

router.use('/users',userRouter.routes(),userRouter.allowedMethods())
router.use('/blogs',blogRouter.routes(),blogRouter.allowedMethods())

module.exports = router
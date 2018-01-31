# 1. mongoose

 - 数据库操作自然是重中之重
```
const mongoose = require('mongoose')
//连接数据库
mongoose.connect('mongodb://localhost/mongo-test')
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('db connected')
});

//定义Schema
const blogSchema = new mongoose.Schema({
    title: String,
    author: String,
    body: String,
    comments: [{ body: String, date: Date }],
    date: { type: Date, default: Date.now },
    hidden: Boolean,
    meta: {
        votes: Number,
        favs: Number
    }
});


//定义实例方法
blogSchema.methods.findByTitle = function (title, cb) {
    return this.model('Blog').find({ title: title }, function (err, result) {
        cb(result)
    })
}

//定义静态方法,注意静态方法定义时不能用ES6的箭头函数，因为this无法绑定
blogSchema.statics.findByAuthor = function (author, cb) {
    Blog.find({ author: author }, function (rerr, result) {
        cb(result)
    })
}

//根据schema定义一个模型
var Blog = mongoose.model('Blog', blogSchema);

//测试
const dbTest = function () {
    //new blog
    const blog = new Blog({
        title: 'my first blog',
        author: 'AngelaDaddy',
        body: 'this is my first blog, let me know if you like it',
        hidden: false,
        meta: {
            votes: 5,
            favs: 10
        }
    })

    blog.save(function (err, result) {
        setTimeout(function () {
            //使用静态方法（方法定义在‘类’上）
            //注意Blog是大写（类）
            Blog.findByAuthor('AngelaDaddy', function (result) {
                console.log(`实例方法结果：${JSON.stringify(result)}`)
            })
            //使用实例方法（方法定义在实例上）
            //注意blog是小写（实例）
            blog.findByTitle('my first blog', function (result) {
                console.log(`静态方法结果：${JSON.stringify(result)}`)
            })

        }, 2000)
    })
}

dbTest()
```
输出：
``` bash
db connected
实例方法结果：[{"comments":[],"date":"2018-01-29T15:57:30.892Z","meta":{"votes":5,"favs":10},"_id":"5a6f446a554fd31ba005abd5","title":"my first blog","author":"AngelaDaddy","body":"this is my first blog, let me know if you like it","hidden":false,"__v":0}]
静态方法结果：[{"comments":[],"date":"2018-01-29T15:57:30.892Z","meta":{"votes":5,"favs":10},"_id":"5a6f446a554fd31ba005abd5","title":"my first blog","author":"AngelaDaddy","body":"this is my first blog, let me know if you like it","hidden":false,"__v":0}]
```

改为(async/awit) Promise
```
//....以上略
//定义实例方法
blogSchema.methods.findByTitle = async function (title) {
    const tarUser = await this.model('Blog').find({ title: title })
    return tarUser
}

//定义静态方法,注意静态方法定义时不能用ES6的箭头函数，因为this无法绑定
blogSchema.statics.findByAuthor =async function(author){
    const tarUser = await Blog.find({ author: author })
    return tarUser
}  

//...略
    blog.save(function (err, result) {
        setTimeout(function () {
            //使用静态方法（方法定义在‘类’上）
            //注意Blog是大写（类）
            Blog.findByAuthor('AngelaDaddy').then(result=>{
                console.log(`实例方法结果：${JSON.stringify(result)}`)
            })
            //使用实例方法（方法定义在实例上）
            //注意blog是小写（实例）
            blog.findByTitle('my first blog').then(result=>{
                console.log(`静态方法结果：${JSON.stringify(result)}`)
            })

        }, 2000)
```
可以看到，我们非常轻松的去掉了回调，整个代码一下子清爽了很多，这一切基于一个基础：
> await始终返回一个Promise，若返回值不是promise，则自动转换为promise。若无resolve，则自动resolve

# 2. router分层
- 将所有路由写在一个文件中自然是不好的，项目下建立`routers`
![`index.js`就是我们的基本路由，在它里面引入其它路由、](http://upload-images.jianshu.io/upload_images/1431816-1b765c172e26879d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

```
//index.js
const router  = require('koa-router')()
const userRouter = require('./user')
router.prefix('/api')
//use方法表示嵌套路由
router.use('/users',userRouter.routes(),userRouter.allowedMethods())
module.exports = router
```
```
//user.js
const router  = require('koa-router')()
router.get('/',function(ctx,next){
    ctx.body = 'this is test msg'
})
module.exports = router
```
```
//app.js
const Koa = require('koa')
const app = new Koa()
//引入根路由
const router = require('./routers')
//注册中间件
app.use(router.routes())
app.listen(3000, function () { console.log('server starting at 3000') })  
```

# 3. repository分层
- 这里的repository是借鉴*spring boot*的写法，指的是和model密切相关的数据库操作类集合方法。正规的springboot项目可能会分3层：
```
 ---- controller layer- 路由控制
 ---- repository layer- 数据库简易操作层接口
 ---- service layer- 数据库复杂操作层
```
以上是我大致的理解，可能有别的叫法。但大致就这样。

这里，我把数据库模型定义和简单操作都放在了repository层中。我觉得差不多够了。因为mongoose提供了很好的模型静态方法和实例方法定义，service层显得没那么必要了，实际上本项目的service是一些和数据库模型无关的操作层，如jwt层，后述
  下面开始：
- 实际中不可能把service都写在controller（这里是路由）中，使用mongoose时，repository的分离还是比较简单的：
![目前的结构，两个子路由，两个repository](http://upload-images.jianshu.io/upload_images/1431816-54b0762ce7f14687.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

blog路由和user路由大同小异：
```
const Blog  = require('../repository').Blog
const router  = require('koa-router')()
router.get('/',async function(ctx){
    const blogs = await Blog.find()
    ctx.body = blogs
})
router.post('/',async function(ctx,next){
    const newBlog = new Blog({
        title:'my first blog',
        author:'aaa',
        body:'let\'s learn koa2'
    })
    const result = await newBlog.save()
    ctx.body = result
})
module.exports = router
```
总路由表中添加子路由：
```
const router  = require('koa-router')()
const userRouter = require('./subRouters/user')
const blogRouter = require('./subRouters/blog')
router.prefix('/api')

router.use('/users',userRouter.routes(),userRouter.allowedMethods())
router.use('/blogs',blogRouter.routes(),blogRouter.allowedMethods())

module.exports = router
```
### repository分层
从blog路由中可以看到`const Blog  = require('../repository').Blog`使用了blog服务层
```
//repository\models\blog.js
//简单的定义Model并导出
const mongoose = require('mongoose')
const blogSchema = new mongoose.Schema({
    title: String,
    author: String,
    body: String,
    comments: [{ body: String, date: Date }],
    date: { type: Date, default: Date.now },
    hidden: Boolean,
    meta: {
        votes: Number,
        favs: Number
    }
});
module.exports = mongoose.model('Blog',blogSchema)
```
user.js大同小异
```
const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    creatOn: { type: Date, default: Date.now },
    updateOn: Date
})
module.exports = mongoose.model('User',userSchema)
```
index.js中整合
```
//services\index.js中整合services
const User = require('./models/user')
const Blog = require('./models/blog')
module.exports = {
    User:User,
    Blog:Blog
}
```
别忘了在app.js中连接数据库：
```
//mongodb
const mongoose = require('mongoose')
//连接数据库
mongoose.connect('mongodb://localhost/mongo-test')
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('db connected')
})
```

# 更进一步：
以上的写法中，router中还是要分别引用repository：
```
const Blog  = require('../repository').Blog
const User  = require('../repository').User
...
```
随着工程变大，这样的引用变得很麻烦。
可以利用koa的context，将服务挂载到其上，为所有组件使用：
首先修改`根`服务`repository\index.js`
```
const User = require('./models/user')
const Blog = require('./models/blog') 
const repositories = {
    User: User,
    Blog: Blog 
}
module.exports = function (app) {
    app.context.repo = repositories
}
```
module.exports导出一个方法，该方法传入app，在方法内部，将所有的service都挂在了context上

然后略加修改app.js,添加：
```
const service = require('./repository')
service(app)
```
其它地方的使用：
```
router.get('/',async function(ctx){
    const blogs = await ctx.repo.Blog.find()
    ctx.body = blogs
})
```
现在，直接在ctx上拿到service，不用再引入

# 4.使用`koa-bodyparser`
```
//app.js
//body parser
const bodyParser = require('koa-bodyparser')
app.use(bodyParser())
```
注意这个body-parser要放在最前面比较保险，放在app.js文件的后面可能会报错
使用：
```
//routers\blog.js
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
```
其实上面这一坨应该写在真正的service层中，偷懒的话就直接写在router/controller里就行了。而这篇文章前面的service层，实际上是model层，这个工程没有service层

# 5.错误处理
koa2中错误不需要特殊处理，得益于promise和es7,在需要抛出错误的地方通过try-catch和throw就可以。
```
 ctx.throw(400,'bad request')
```
注意，这里只能抛出内置错误，koa使用http-error，支持的错误列表：
```
400	BadRequest
401	Unauthorized
402	PaymentRequired
403	Forbidden
404	NotFound
405	MethodNotAllowed
406	NotAcceptable
407	ProxyAuthenticationRequired
408	RequestTimeout
409	Conflict
410	Gone
411	LengthRequired
412	PreconditionFailed
413	PayloadTooLarge
414	URITooLong
415	UnsupportedMediaType
416	RangeNotSatisfiable
417	ExpectationFailed
418	ImATeapot
421	MisdirectedRequest
422	UnprocessableEntity
423	Locked
424	FailedDependency
425	UnorderedCollection
426	UpgradeRequired
428	PreconditionRequired
429	TooManyRequests
431	RequestHeaderFieldsTooLarge
451	UnavailableForLegalReasons
500	InternalServerError
501	NotImplemented
502	BadGateway
503	ServiceUnavailable
504	GatewayTimeout
505	HTTPVersionNotSupported
506	VariantAlsoNegotiates
507	InsufficientStorage
508	LoopDetected
509	BandwidthLimitExceeded
510	NotExtended
511	NetworkAuthenticationRequired
```
用户自定的错误类型通过设定response.body设定即可

# 6.middleware剥离
现在的app.js过于臃肿，将所有的中间件进行剥离是一个好主意：
![middlewares](http://upload-images.jianshu.io/upload_images/1431816-cf9547a660365cd3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
```
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
```
现在的app.js就可以简化为：
```
const Koa = require('koa')
const app = new Koa()
const middleware = require('./middleware') 
const config =require('./config')
middleware(app) 
app.listen(config.port || 3000, function () { console.log(`server starting at ${config.port}`) })
```
以后所有的中间件都加在middleware文件夹下

当前项目结构：
![image.png](http://upload-images.jianshu.io/upload_images/1431816-f8e8ead6c3767112.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

截至目前github地址:
```
git clone "https://github.com/AngelaDaddyRoy/koa2-scaffold.git"
git checkout "basic-strcture"
```


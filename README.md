#这是一个koa2项目模板，打算摸索一套适合自己的koa2后端项目工程脚手架
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

# 3. service分层
- 实际中不可能把service都写在controller（这里是路由）中
使用mongoose时，service的分离还是比较简单的：
![目前的结构，两个router，两个service](http://upload-images.jianshu.io/upload_images/1431816-1a403cc16f453c1a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

blog路由和user路由大同小异：
```
const Blog  = require('../services').Blog
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
总路由表中添加blog路由：
```
const router  = require('koa-router')()
const userRouter = require('./user')
const blogRouter = require('./blog')
router.prefix('/api')

router.use('/users',userRouter.routes(),userRouter.allowedMethods())
router.use('/blogs',blogRouter.routes(),blogRouter.allowedMethods())

module.exports = router
```
### 服务分层
从blog路由中可以看到`const Blog  = require('../services').Blog`使用了blog服务层
```
//services\models\blog.js
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
以上的写法中，router中还是要分别引用service：
```
const Blog  = require('../services').Blog
const User  = require('../services').User
...
```
随着工程变大，这样的引用将马上变成噩梦。
可以利用koa的context，将服务挂载到其上，为所有组件使用：
首先修改`根`服务`services\index.js`
```
const User = require('./models/user')
const Blog = require('./models/blog')
const service = {
    User: User,
    Blog: Blog
}
module.exports = function (app) {
    app.context.service = service
}
```
module.exports导出一个方法，该方法传入app，在方法内部，将所有的service都挂在了context上

然后略加修改app.js,添加：
```
const service = require('./services')
service(app)
```
其它地方的使用：
```
router.get('/',async function(ctx){
    const blogs = await ctx.service.Blog.find()
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
#6. middleware剥离


const User = require('./models/user')
const Blog = require('./models/blog')
const service = {
    User: User,
    Blog: Blog
}
module.exports = function (app) {
    app.context.service = service
}
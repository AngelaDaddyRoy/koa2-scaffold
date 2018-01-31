const User = require('./models/user')
const Blog = require('./models/blog') 
const repositories = {
    User: User,
    Blog: Blog 
}
module.exports = function (app) {
    app.context.repo = repositories
}
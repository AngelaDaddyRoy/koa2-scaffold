'use strict'
module.exports = {
    getAll: async function (ctx) {
        const users = await ctx.repo.User.find()
        ctx.body = users
    },
    add: async function (ctx, next) { 
        const newUser = new ctx.repo.User( ctx.request.body)
        const result = await newUser.save()      
        ctx.body = result
    }
}
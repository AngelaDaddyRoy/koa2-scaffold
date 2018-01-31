/*
 * @Author: monodev 
 * @Date: 2018-01-30 23:21:02 
 * @Last Modified by: monodev
 * @Last Modified time: 2018-01-31 00:09:42
 * @Description: blog service
 */

const mongoose = require('mongoose')
const blogSchema = new mongoose.Schema({
    title: {type:String,required:true},
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
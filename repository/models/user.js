/*
 * @Author: monodev 
 * @Date: 2018-01-30 23:02:44 
 * @Last Modified by: monodev
 * @Last Modified time: 2018-02-01 16:53:31
 * @Description: user 实体类
 */
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true }
}, { timestamps: {} })

module.exports = mongoose.model('User',userSchema)
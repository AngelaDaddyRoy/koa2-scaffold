const jwt = require('jsonwebtoken')
const config = require('../../config')
const tokenService ={
      signToken: (user)=>{
        const payload = {
            // id:user._id,
            // name:user.username
            id:'aaa',
            name:'aaa'
        }
        const options = {
            expiresIn: 60 * 30 ,
            issuer:config.jwt.issuer,
            audience:config.jwt.audience
        }
        const token = jwt.sign(payload,config.jwt.secret,options)
        return token
    }
}


module.exports =  tokenService
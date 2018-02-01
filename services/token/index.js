const jwt = require('jsonwebtoken')
const config = require('../../config')
const tokenService = {
    getToken: (user) => {
        return new Promise(function (fulfill, reject) {
            try{
                const payload = {
                    id: user._id,
                    name: user.username
                }
                const options = {
                    expiresIn: 60 * 30,
                    issuer: config.jwt.issuer,
                    audience: config.jwt.audience
                }
                const token = jwt.sign(payload, config.jwt.secret, options)
                if(token) {
                    fulfill(token)
                }                   
                else{
                    reject()
                }
            }
            catch {
                reject()
            } 
        });
    }
}


module.exports = tokenService
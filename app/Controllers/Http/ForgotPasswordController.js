'use strict'
const crypto = require('crypto')
const User = use('App/Models/User')
const Mail = use('Mail')
const moment = require('moment')

class ForgotPasswordController {
    async store({request, response}){
        const email = request.input('email')
        const user = await User.findByOrFail('email', email)

        user.token = crypto.randomBytes(10).toString('hex')
        user.token_created = new Date()

        await user.save()

        await Mail.send(
            ['emails.forgot_passowrd'],
            {email, token: user.token, link: `${request.input('redirect_url')}?token=${user.token}`},
            message=> message.to(user.mail).from('leocaveiraboy@gmaill.com', 'Leo | leoo').subject('Recuperando senha')

        )
    } catch (err){
        return response.status(err.status).send({ error: {message: 'Email não encontrado'}})
    }
    async update({request, response}){
        try{
            const{token,password} = request.all()
            const user = await User.findByOrFail('token', token)
            const tokenExpired = moment().subtract('2', 'days').isAfter(user.token_created)

            if(tokenExpired)
            {
                return response.status(401).send({error:{message: 'O token de recuperação esta expirado'}})
            }
            user.token = null
            user.token_created = null
            user.password = password

            await user.save()
    }
        catch(err){return response.status(err.status).send({error: {message:'Deu errado a resetar a senha'}})}
        
    }
}

module.exports = ForgotPasswordController

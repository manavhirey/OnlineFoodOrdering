const User = require('../../models/user')
const bcrypt = require('bcrypt')
const passport = require('passport')

function authController() {
    const _getRedirectURL = (req) => {
        return req.user.role === 'admin' ? '/admin/orders' : '/customers/orders'
    }
    return{
        login(req,res){
            res.render('auth/login')
        },
        postLogin(req, res, next){
            // Validation 
            // const { email, password } = req.body
            
            // // Validate Request
            // if(!email || !password){
            //     req.flash('error','*All fields are required.')
            //     req.flash('email',email)
            //     return res.redirect('/login')
            // }

            passport.authenticate('local', (err, user, info) => {
                if(err){
                    req.flash('error', info.message)
                    return next(err)
                }
                if(!user){
                    req.flash('error', info.message)
                    return res.redirect('/login')
                }

                req.logIn(user, (err) => {
                    if(err) {
                        req.flash('error', info.message)
                        next(err)
                    }
                    
                    return res.redirect(_getRedirectURL(req))
                })
            })(req, res, next)
        },
        register(req,res){
            res.render('auth/register')
        },
        async postregister(req,res){
            const { name, email, password } = req.body
            
            // Validate Request
            if(!name || !email || !password){
                req.flash('error','*All fields are required.')
                req.flash('name',name)
                req.flash('email',email)
                return res.redirect('/register')
            }

            // Check if email exists
            User.exists({email: email}, (err, result) =>{
                if(result){
                    req.flash('error','Account already exists')
                    req.flash('name',name)
                    req.flash('email',email)
                    return res.redirect('/register')
                }
            })

            // Encrypt Password
            const encryptPass = await bcrypt.hash(password, 10)

            // Create User
            const user = new User({
                name,
                email,
                password: encryptPass,
            })

            user.save().then( (user) => {
                // Redirect to Homepage
                // Login 

                return res.redirect('/')
            }).catch(err => {
                req.flash('error','Something went wrong')
                return redirect('/register')
            })

            console.log(req.body)
        },
        logout(req, res, next){
            req.logout( err => {
                if(err){ return next(err)}
                return res.redirect('/login')
            })
        }
    }
}

module.exports = authController
const homeController = require('../app/http/controllers/homeController')
const authController = require('../app/http/controllers/authController')
const cartController = require('../app/http/controllers/customers/cartController')
const guest = require('../app/http/middlewares/guest')

function callRoutes(xps) {

    xps.get('/',homeController().index)
    
    xps.get('/cart', cartController().index)

    xps.post('/update-cart', cartController().update)
    
    xps.get('/login', guest, authController().login)
    xps.post('/login', authController().postLogin)
    
    xps.get('/register', guest, authController().register)
    xps.post('/register', authController().postregister)

    xps.post('/logout', authController().logout)

    
}

module.exports = callRoutes
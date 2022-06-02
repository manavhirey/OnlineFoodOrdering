const homeController = require('../app/http/controllers/homeController')
const authController = require('../app/http/controllers/authController')
const cartController = require('../app/http/controllers/customers/cartController')

function callRoutes(xps) {

    xps.get('/',homeController().index)
    
    xps.get('/cart', cartController().index)

    xps.post('/update-cart', cartController().update)
    
    xps.get('/login', authController().login)
    
    xps.get('/register', authController().register)

    
}

module.exports = callRoutes
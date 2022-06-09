const homeController = require('../app/http/controllers/homeController')
const authController = require('../app/http/controllers/authController')
const cartController = require('../app/http/controllers/customers/cartController')
const orderController = require('../app/http/controllers/customers/orderController')
const AdminOrderController = require('../app/http/controllers/admin/orderController')

// Middlewares
const guest = require('../app/http/middlewares/guest')
const auth = require('../app/http/middlewares/auth')
const admin = require('../app/http/middlewares/admin')

function callRoutes(xps) {

    xps.get('/',homeController().index)
    
    xps.get('/cart', cartController().index)

    xps.post('/update-cart', cartController().update)
    
    xps.get('/login', guest, authController().login)
    xps.post('/login', authController().postLogin)
    
    xps.get('/register', guest, authController().register)
    xps.post('/register', authController().postregister)

    xps.post('/logout', authController().logout)
    
    // Customer routes
    xps.post('/orders',auth , orderController().store)
    xps.get('/customers/orders', auth, orderController().fetchOrder)

    // Admin routes
    xps.get('/admin/orders', admin, AdminOrderController().fetchOrder)
    

}

module.exports = callRoutes
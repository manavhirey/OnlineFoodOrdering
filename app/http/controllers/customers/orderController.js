const { session } = require('passport/lib')
const moment = require('moment')
const Order = require('../../../models/order')

function orderController(){
    return{
        store(req, res){
            // Validate Request 
            const { address,phone} = req.body
            if(!address||!phone){
                req.flash('error', 'All fields are required.')
                return res.redirect('/cart')
            }

            const order = new Order({
                customerId: req.user._id,
                items: req.session.cart.items,
                address,
                phone
            })
            order.save().then(result => {
                Order.populate(result, { path: 'customerId' }, (err, placedOrder) => {
                    req.flash('success', 'Order placed Successfully')
                    delete req.session.cart
                    // Emit Order Placed
                    const eventEmitter = req.app.get('eventEmitter')
                    eventEmitter.emit('orderPlaced', placedOrder )
                    return res.redirect('/customers/orders')
                })
                
            }).catch(err => {
                req.flash('error', 'Something went wrong. :(')
                return res.redirect('/cart')
            })
        },
        async fetchOrder(req, res){
            const orders = await Order.find({ customerId: req.user._id },null, { sort: { 'createdAt': -1 } })
            res.header('Cache-Control', 'no-cache,, private, no-store,must-revalidate, max-stale=0, post-check=0, pre-check=0')
            res.render('customers/orders',{orders: orders, moment: moment})
        },
        async display(req, res){
            const order = await Order.findById(req.params.id)
            // Checking User Authorization
            if(req.user._id.toString() === order.customerId.toString()){
                return res.render('customers/order', { order })
            }
                return res.redirect('/')
        }
    }
}

module.exports = orderController
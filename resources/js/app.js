import axios from 'axios'
import moment from 'moment'
import Noty from 'noty'
import { initAdmin } from './admin'


let addToCart = document.querySelectorAll(".add-to-cart")
let cartCounter = document.querySelector("#cartCounter")

function updateCart(burger){
  axios.post('/update-cart', burger).then(res => {
    console.log(res)
    cartCounter.innerText = res.data.totalQty
    new Noty({
      type: 'success',
      timeout: 1000,
      text: 'Item added to cart!',
      layout: 'bottomLeft'
      // To remove ProgressBar set it to true
      // progressBar: false
    }).show();
  }).catch(err => {
    new Noty({
      type: 'error',
      timeout: 1000,
      text: 'Oops! Something went wrong. :(',
      layout: 'bottomLeft',
      // To remove ProgressBar set it to true
      progressBar: false
    }).show();
  })
}

addToCart.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    let burger = JSON.parse(btn.dataset.burger)
    updateCart(burger)
    console.log(burger)
  })
})

// Removing alerts after Z Seconds
const alertMsg = document.querySelector('#success-alert')
if(alertMsg) {
  setTimeout(() => {
    alertMsg.remove()
  },3000)
}


// Update Order Status
let statuses = document.querySelectorAll('.status-line')
console.log(statuses)
let hiddenInput = document.querySelector('#hiddenInput') 
let order = hiddenInput ? hiddenInput.value : null
order = JSON.parse(order)
let time = document.createElement('small')

function statusUpdate(order){
  statuses.forEach((status) => {
    status.classList.remove('step-completed')
    status.classList.remove('current')
  })
  let stepCompleted = true;
  statuses.forEach((status) => {
    let dataProp = status.dataset.status
    console.log(dataProp)
    if(stepCompleted){
      status.classList.add('step-completed')
    }
    if(dataProp === order.status){
      stepCompleted = false
      time.innerText = moment(order.updatedAt).format('hh:mm A')
      status.appendChild(time)
      if(status.nextElementSibling){
        status.nextElementSibling.classList.add('current')
      }

    }
  })

}

statusUpdate(order);

// Socket.io Client Side
let socket = io()
// Join
if(order){
  socket.emit('join', `order_${order._id}`)
}

// Admin
let adminAreaPath = window.location.pathname
if(adminAreaPath.includes('admin')){
  initAdmin(socket)
  socket.emit('join', 'adminRoom')
}

socket.on('orderUpdated', (data) => {
  const updatedOrder = { ...order } //Copying object
  updatedOrder.updatedAt = moment().format()
  updatedOrder.status = data.status
  statusUpdate(updatedOrder)
  new Noty({
    type: 'success',
    timeout: 1000,
    text: 'Your order has an update!',
    // layout: 'bottomLeft'
    // To remove ProgressBar set it to true
    // progressBar: false
  }).show();
})
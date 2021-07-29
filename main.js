const arrItemSelect = []
let mealsState=[]
let ruta='login' //register/order
let User = {}

const stringToHTML = (s) =>{
    const parser = new DOMParser()
    const doc = parser.parseFromString(s,"text/html")
   // console.log(doc.body.firstChild)
    return doc.body.firstChild
}

const renderItem1 = (item)=>{
    const element = stringToHTML(`<li data-id="${item._id}">${item.name}</li>`)
    element.addEventListener('click',()=>{
                const mealsList = document.getElementById('meals-list')
                //console.log(Array.from(mealsList.children))
                Array.from(mealsList.children).forEach(x => x.classList.remove('selected'))//con esta funcion remuevo todos los selected
                element.classList.add('selected')
                arrItemSelect.push(item.name)
                const mealsIdInput =document.getElementById('meals-id')
                mealsIdInput.value= item._id
            })
    
    return element
}

const renderOrder = (order,meals) => {
    const meal = meals.find(meal => meal._id === order.meal_id)
    const element = stringToHTML(`<li data-id="${order._id}">${meal.name} - ${order.user_id}</li>`)
    return element
}

const inicializaFomulario = ()=>{
    const orderForm=document.getElementById('order')
    orderForm.onsubmit= (e) =>{
        e.preventDefault()
        const submit = document.getElementById('submit')
        submit.setAttribute('disabled', true)
        const mealsId=document.getElementById('meals-id')
        const mealIdValue=mealsId.value
        if (!mealIdValue){
            alert('Debe Seleccionar un plato')
            return
        }
        const order ={
            meal_id: mealIdValue,
            user_id: User.email,
        }

    fetch('https://serverless-julianfabian2012-gmailcom.vercel.app/api/orders',{

        method:'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(order)
    })  .then(x => x.json())
        .then(respuesta => {
            const renderedOrder = renderOrder (respuesta,mealsState)
            const ordersList = document.getElementById('orders-list')
            ordersList.appendChild(renderedOrder)
            submit.removeAttribute('disabled')
        })

    }
}

const inicializaDatos = ()=>{
    fetch('https://serverless-julianfabian2012-gmailcom.vercel.app/api/meals')
    .then(response => response.json())
    .then(data=> {
        mealsState=data
        const mealsList = document.getElementById('meals-list')
        const submit = document.getElementById('submit')
        const listItem = data.map(renderItem1)//con .map recorro el arreglo y con join concateno todo el arreglo
        mealsList.removeChild(mealsList.firstElementChild)
        listItem.forEach(element => mealsList.appendChild(element))
        submit.removeAttribute('disabled')

        fetch('https://serverless-julianfabian2012-gmailcom.vercel.app/api/orders')
            .then(response => response.json())   
            .then(orderData => {
                const ordersList = document.getElementById('orders-list')
                const listOrders = orderData.map(orderData => renderOrder(orderData,data))
                ordersList.removeChild(ordersList.firstElementChild)
                listOrders.forEach(element => ordersList.appendChild(element))

                console.log(orderData)
            })


    })
}

const renderApp = () =>{
    const token = localStorage.getItem('token')
    if (token){        
        User = JSON.parse(localStorage.getItem('user'))                       
        return renderOrdersView()
    }   
   loginForm()
}

const renderOrdersView = ()=>{
    const orderView = document.getElementById('orders-view')
    document.getElementById('app').innerHTML = orderView.innerHTML
    inicializaFomulario()
    inicializaDatos()
}

const loginForm = () => {
    const loginTemplate = document.getElementById('login-template')
    document.getElementById('app').innerHTML = loginTemplate.innerHTML
   

    const  loginform = document.getElementById('login-form')
    loginform.onsubmit = (e) => {
        e.preventDefault()
        const email = document.getElementById('email').value
        const password = document.getElementById('password').value

    fetch('https://serverless-julianfabian2012-gmailcom.vercel.app/api/auth/login',{
            method:'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({email, password})
        }).then(x => x.json())
        .then(respuesta =>{
            localStorage.setItem('token', respuesta.token)
            ruta = 'orders'
            return respuesta.token
           // console.log(respuesta)
        })
        .then(token =>{
            
            return fetch('https://serverless-julianfabian2012-gmailcom.vercel.app/api/auth/me',{
                method: 'GET',
                headers:{
                    'Content-Type': 'application/json',
                    authorization: token,
                }
            })
        })
        .then(x =>{
            return x.json()
        })
        .then(fetchUser => {
            localStorage.setItem('user',JSON.stringify(fetchUser))
            User=fetchUser
            renderOrdersView()
            console.log(fetchUser.email)
        })
       
    }
}
window.onload= () => {
    renderApp()


    


//inicializaFomulario()
//inicializaDatos()
/*
fetch('https://serverless-julianfabian2012-gmailcom.vercel.app/api/auth/login',{
    method:'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({email:'tejerinaplt@gmail.com', password:'1234'})
    })*/
}

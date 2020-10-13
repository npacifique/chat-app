const socket = io()



//elements
const $messageForm = document.getElementById('message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')


const $sendLocationButton = document.getElementById('sendLocation')


const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML



//options

const {username, room } = Qs.parse(location.search, {ignoreQueryPrefix : true})

//auto scroll

const autoScroll = ()=>{
    //get the new message element 
    const $newMessage = $messages.lastElementChild


    //get the hight of the last message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height 
    const visibleHeight = $messages.offsetHeight


    //height of messages container 
    const containerHeight = $messages.scrollHeight


    //how have i scrolled 
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight

    }


}

socket.on('message', (message)=>{

    const html = Mustache.render(messageTemplate, {
        username : message.username,
        message :message.text,
        createdAt : moment(message.createdAt).format('h:mm a')  
    })

    $messages.insertAdjacentHTML('beforeend', html)

    autoScroll()
})


//send message event
$messageForm.addEventListener('submit', (e)=>{
    e.preventDefault()

    //disable form while sending
    $messageFormButton.setAttribute('disabled', 'disabled')
    //const message = e.target["message"].value


    socket.emit('sendMessage', $messageFormInput.value, ()=>{
         
        //the code bellow will only be executed once the message is delivered 

        //re-enable button 
         $messageFormButton.removeAttribute('disabled')

         //clear input
         $messageFormInput.value = ''
 
         //add focus
         $messageFormInput.focus()
    })

})

//location template
socket.on('locationMessage', (location)=>{

    const html = Mustache.render(locationMessageTemplate, {
        username : location.username,
        url : location.url, 
        createdAt : moment(location.createdAt).format('h:mm a') 
    })


    $messages.insertAdjacentHTML('beforeend', html)

    autoScroll()

})


//room data template
socket.on('roomData', ({room, users})=>{
    const html = Mustache.render(sidebarTemplate, {room, users})

    document.querySelector("#sidebar").innerHTML = html
})

$sendLocationButton.addEventListener('click', (e)=>{
    navigator.geolocation 
        ? navigator.geolocation.getCurrentPosition((position)=>{
        const {latitude, longitude} = position.coords


        //disable the button
        $sendLocationButton.setAttribute('disabled', 'disabled')

        socket.emit('sendLocation', {latitude, longitude}, ()=>{
            
            $sendLocationButton.removeAttribute('disabled')
        })

        }) 
    : alert('Geolocation not support by browser')
})



socket.emit('join', {username, room}, (error)=>{
    if(error){
        alert(error)
        //redirect back to page if error 
        location.href = '/'
    }
})



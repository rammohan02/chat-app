// const { parse } = require("cookie");

const socket = io()     //This helps to send events from client to server and viceversa

//Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('#submit');

const $sendLocationButton = document.querySelector('#send-location');

const $messages = document.querySelector('#messages');

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

//Options
const {username, room}  = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoScrool = () => {
    //New message element
    const $newMessage = $messages.lastElementChild;

    //Height of new message
    const newMessageStyles = getComputedStyle($newMessage);
    //above contains all the css properties of this element, through which we can extract spacing of messages
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    //visible height
    const visibleHeight = $messages.offsetHeight;

    //Height of message container
    const containerHeight = $messages.scrollHeight;

    // How far have i scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight;
    //scrollTOp gives how far we scrolled. adding visivle height gives how down we are(i.e., scroller height)

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight;
        // console.log('hi');
    }
    // else{
    //     console.log('no');
    //     $messages.scrollTop = $messages.scrollHeight;
    // }

    // console.log(newMessageStyles);
}

socket.on("message", (str) => {
    // console.log(str);

    if(username === str.username){
        str.username = "Me";
    }
    const html = Mustache.render(messageTemplate, {
        username: str.username,
        message: str.text,
        createdAt: moment(str.createdAt).format("h:mm a")
    });
    $messages.insertAdjacentHTML('beforeend', html);

    autoScrool();
})

socket.on("locationMessage", (message)=>{
    // console.log(message);

    const html = Mustache.render(locationTemplate, {
        username: message.username,
        location: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);

    autoScrool();
})

socket.on('roomData', ({room, users})=>{
    // console.log(room);
    // console.log(users);

    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html;
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();

    $messageFormButton.setAttribute('disabled', 'disabled');
    //disable

    const str = e.target.elements.message.value;
    // console.log(str);
    socket.emit('sendMessage', str, (error)=>{

        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value="";
        $messageFormInput.focus();
        //enable

        if(error){
            // return console.log(error);
            return alert(error);
        }
        console.log("Message was delevired");

    });
})

$sendLocationButton.addEventListener('click', () => {
    $sendLocationButton.setAttribute('disabled', 'disabled');

    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser');
    }

    navigator.geolocation.getCurrentPosition((position)=>{
        // console.log(position);
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, ()=>{
            $sendLocationButton.removeAttribute('disabled');
            console.log("Location sent");
        });
    })
})

socket.emit("join", { username, room }, (error)=>{
    if(error){
        alert(error);
        location.href = '/';
    }
})

// //socket.on helps to send from server to client
// socket.on('countUpdated', (count)=>{             //The name must be same as declared in function socket.io of index.js
//     console.log("The count has been updated!", count);

// })

// document.querySelector('#increment').addEventListener('click', () => {
//     console.log('clicked');
//     socket.emit('increment');
// })
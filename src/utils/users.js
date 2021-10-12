const users = [];

//addUser
const addUser = ({ id, username, room})=>{
    //clean data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    //validate
    if(!username || !room){
        return {
            error: 'Username and room is required',
        }
    }

    //check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    //validate username
    if(existingUser){
        return {
            error: 'Username already exists',
        }
    }

    //store User
    const user = {id, username, room};
    users.push(user);
    return {user};    
}

//removeUser
const removeUser = (id)=>{
    const index = users.findIndex((user)=>{
        return user.id === id
    })

    if(index !== -1){
        //splice helps to remove user by index. second arrgument is to remove how many items
        return users.splice(index, 1)[0]
    }


}

//getUser data of this room
const getUser = (id) => {
    const index = users.findIndex((user) =>{
        return user.id === id;
    })

    if(index !== -1){
        return users[index];
    }
}


//getUsersInRoom
const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase();
    return users.filter((user) => {
        return user.room === room;
    })
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}


// addUser({
//     id: 22,
//     username: 'ram',
//     room: 'mohan'
// });
// // console.log(users);

// addUser({
//     id: 23,
//     username: 'ram1',
//     room: 'mohan'
// });

// addUser({
//     id: 24,
//     username: 'ram2',
//     room: 'mohan1'
// });
// console.log(users);

// const user1 = getUsersInRoom("mohan");
// console.log(user1);






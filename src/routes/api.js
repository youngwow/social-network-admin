const express = require('express');
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const formidable = require("formidable");
const mv = require('mv');
const router = express.Router();
let sessions = {}
// let subscribers = [];
// const {subscribers} = require('../bin/www.js');
JWT_Secret = 'secret_code'

router.get('/user/:id', async (req, res) => {
    try {
        let rawdataUsers = fs.readFileSync(path.join(__dirname, "../storage/users.json"));
        let users = JSON.parse(rawdataUsers);
        let id = parseInt(req.params.id);
        for (const user of users) {
            if (parseInt(user.id) === id){
                res.send({user: user});
                break;
            }
        }
    } catch (e) {
        console.error(e)
    }
})

router.post('/newUser', async (req, res) => {
   try {
       let rawdataNewsByUser = fs.readFileSync(path.join(__dirname, "../storage/newsByUser.json"));
       let rawdataFriendsByUser = fs.readFileSync(path.join(__dirname, "../storage/friendsByUser.json"))
       let rawdataUsers = fs.readFileSync(path.join(__dirname, "../storage/users.json"))
       let newsByUser = JSON.parse(rawdataNewsByUser);
       let friendsByUser = JSON.parse(rawdataFriendsByUser);
       let users = JSON.parse(rawdataUsers);
       let lastId = parseInt(users[users.length - 1].id) + 1;
       let userBody = JSON.parse(req.body.user)
       let user = {
           id: lastId,
           name: {
               firstName: userBody.name.firstName,
               lastName: userBody.name.lastName
           },
           email: userBody.email,
           dateBirth: (new Date(userBody.dateBirth)).toLocaleDateString('ru'),
           isAdmin: false,
           status: "active",
           password: userBody.password,
           photo: "/images/default.png"
       };
       let dataNewsByUser = {
           userID: lastId,
           news: []
       };
       let dataFriendsByUser = {
           id: lastId,
           friends: []
       }
       const token = jwt.sign(user, JWT_Secret);
       sessions[token] = user.id;
       friendsByUser.push(dataFriendsByUser);
       users.push(user);
       newsByUser.push(dataNewsByUser);
       rawdataFriendsByUser = JSON.stringify(friendsByUser);
       rawdataNewsByUser = JSON.stringify(newsByUser);
       rawdataUsers = JSON.stringify(users);
       fs.writeFileSync(path.join(__dirname, "../storage/friendsByUser.json"), rawdataFriendsByUser);
       fs.writeFileSync(path.join(__dirname, "../storage/users.json"), rawdataUsers);
       fs.writeFileSync(path.join(__dirname, "../storage/newsByUser.json"), rawdataNewsByUser);
       res.status(200).send({
           signed_user: user,
           token: token,
       });

   } catch (e) {
       console.error(e)
   }
});

router.post('/addUserPhoto/:id', async (req, res) => {
   try {
       let rawdataUsers = fs.readFileSync(path.join(__dirname, "../storage/users.json"));
       let users = JSON.parse(rawdataUsers);
       const userIndex = users.findIndex(e => parseInt(e.id) === parseInt(req.params.id));
       let form = new formidable.IncomingForm();
       const upload_path = path.join(__dirname, "../public/images/");
       form.parse(req, function (err, fields, file) {
           const oldpath = file.image.filepath;
           const new_filename = file.image.newFilename + path.parse(file.image.originalFilename).ext;
           const filename = `/images/${new_filename}`
           users[userIndex].photo = filename;
           const newpath = upload_path + new_filename;

           mv(oldpath, newpath, function(err) {
               if (err) throw err;
               fs.writeFileSync(path.join(__dirname, "../storage/users.json"), JSON.stringify(users));
               res.status(200).send({filename: filename});
           });
       });
   } catch (e) {
       console.error(e)
   }
});

router.delete('/deletePhoto/:id', async (req, res) => {
    try {
        let rawdataUsers = fs.readFileSync(path.join(__dirname, "../storage/users.json"));
        let users = JSON.parse(rawdataUsers);
        const userIndex = users.findIndex(e => parseInt(e.id) === parseInt(req.params.id));
        const filename = path.parse(users[userIndex].photo).base;
        const pathToFile = `public/images/${filename}`
        fs.unlink(path.join(__dirname, '..', pathToFile), err => {
            if (err) throw err; // не удалось удалить файл
            console.log('Файл успешно удалён');
        });
        users[userIndex].photo = '/images/default.png';
        fs.writeFileSync(path.join(__dirname, "../storage/users.json"), JSON.stringify(users));
        res.status(200).send({filename: '/images/default.png'})
    } catch (e) {
        console.error(e)
    }
})


router.post('/addNews', async (req, res) =>{
   try {
       console.log(req.body);
       let post = req.body.post;
       let userID = parseInt(post.userID);
       let rawdataNewsByUser = fs.readFileSync(path.join(__dirname, "../storage/newsByUser.json"));
       let newsByUser = JSON.parse(rawdataNewsByUser);
       let rawdataNews = fs.readFileSync(path.join(__dirname, "../storage/news.json"));
       let news = JSON.parse(rawdataNews);
       let rawdataUsers = fs.readFileSync(path.join(__dirname, "../storage/users.json"));
       let users = JSON.parse(rawdataUsers);
       post.id = parseInt(news[news.length - 1].id) + 1;
       news.push(post);
       for (const newsByUserElement of newsByUser) {
           if (parseInt(newsByUserElement.userID) === userID){
               newsByUserElement.news.push(post.id);
               break;
           }
       }
       rawdataNewsByUser = JSON.stringify(newsByUser);
       rawdataNews = JSON.stringify(news);
       fs.writeFileSync(path.join(__dirname, "../storage/news.json"), rawdataNews);
       fs.writeFileSync(path.join(__dirname, "../storage/newsByUser.json"), rawdataNewsByUser);
       console.log('Post added');
       let user;
       for (const currentUser of users) {
           if (userID === currentUser.id){
               user = currentUser;
               break;
           }
       }
       console.log("subs: ");
       console.log(subscribers);
       console.log("users: " + users);
       subscribers[user.id].socket.emit("createdNews", {});
       console.log("send to " + user.id);
       for(const v of users) {
           console.log("send info to " + v);
           if(subscribers[v.id]) {
               console.log("final" + v.id);
               subscribers[v.id].socket.emit("createdNews", {});
           }
       }
       res.status(200).end();

   } catch (e) {
       console.error(e)
   }
});

router.get('/friends/:id', async (req, res) => {
    try {
        if (!req.params.id){
            res.status(404);
        }
        let rawdataFriendsByUser = fs.readFileSync(path.join(__dirname, "../storage/friendsByUser.json"));
        let rawdataUsers = fs.readFileSync(path.join(__dirname, "../storage/users.json"));
        let friendsByUser = JSON.parse(rawdataFriendsByUser);
        let users = JSON.parse(rawdataUsers);
        let name;
        let friendsID = [];
        let friends = [];
        let userId = parseInt(req.params.id);
        for (const user of friendsByUser) {
            if (parseInt(user.id) === userId){  // TODO: dublicated
                friendsID = user.friends;
            }
        }
        for (const user of users) {
            if (parseInt(user.id) === userId){  // TODO: dublicated
                name = user.name;
            }
            if (friendsID.includes(user.id)){
                let friend = {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    dateBirth: user.dateBirth,
                    isAdmin: user.isAdmin,
                    status: user.status
                }
                friends.push(friend);
            }
        }
        res.send({name: name, users: friends})
    } catch (e) {
        console.error(e)
    }
})

router.post('/addFriend/:id', async (req, res) => {
    try{
        const userId = parseInt(req.params.id);
        const friendEmail = req.body.friendEmail;
        let rawdataFriendsByUser = fs.readFileSync(path.join(__dirname, "../storage/friendsByUser.json"));
        let rawdataUsers = fs.readFileSync(path.join(__dirname, "../storage/users.json"));
        let friendsByUser = JSON.parse(rawdataFriendsByUser);
        let users = JSON.parse(rawdataUsers);
        let friend = getUserByEmail(friendEmail, users);
        if (!friend || userId === friend.id){
            res.send({isSuccess: false})
        } else{
            for (const friendsByUserElement of friendsByUser) {
                if (parseInt(friendsByUserElement.id) === userId){
                    if (!friendsByUserElement.friends.includes(friend.id)){
                        friendsByUserElement.friends.push(friend.id)
                    }
                    break;
                }
            }
            rawdataFriendsByUser = JSON.stringify(friendsByUser)
            fs.writeFileSync(path.join(__dirname, "../storage/friendsByUser.json"), rawdataFriendsByUser);
            res.send({isSuccess: true})
        }
    } catch (e) {
        console.error(e)
    }
})

router.post('/deleteFriend/:id', async (req, res) => {
    try{
        const userId = parseInt(req.params.id);
        let isSuccess = false;
        const friendId = parseInt(req.body.friendId);
        let rawdataFriendsByUser = fs.readFileSync(path.join(__dirname, "../storage/friendsByUser.json"));
        let friendsByUser = JSON.parse(rawdataFriendsByUser);
        for (const friendsByUserElement of friendsByUser) {

            if (parseInt(friendsByUserElement.id) === userId){
                if (friendsByUserElement.friends.includes(friendId)){
                    // console.log(index)
                    console.log(friendId)
                    console.log(friendsByUserElement.friends)

                    friendsByUserElement.friends = friendsByUserElement.friends.filter(friend =>
                        parseInt(friend) !== friendId
                    );
                    // const index = friendsByUserElement.friends.findIndex(item => parseInt(item.id) === friendId);

                    console.log(friendsByUserElement.friends)
                    // friendsByUserElement.friends.splice(index, 1);
                    // console.log(friendsByUserElement.friends)
                    isSuccess = true;
                }
                break;
            }
        }
        rawdataFriendsByUser = JSON.stringify(friendsByUser)
        fs.writeFileSync(path.join(__dirname, "../storage/friendsByUser.json"), rawdataFriendsByUser);
        res.send({isSuccess: isSuccess});
    } catch (e) {
        console.error(e)
    }
})

router.get('/posts/:id', async (req, res) => {
    try{
        if (!req.params.id){
            res.status(404);
        }
        let userID = parseInt(req.params.id);
        let rawdataNews = fs.readFileSync(path.join(__dirname, "../storage/news.json"));
        let news = JSON.parse(rawdataNews);
        let newsUser = []
        for (const post of news) {
            if (parseInt(post.userID) === userID){
                newsUser.push(post)
            }
        }
        res.send({ news: newsUser});
    } catch (e){
        console.error(e)
    }
});

router.get('/postsFriends/:id', async (req, res) => {
   try{
       if (!req.params.id){
           res.status(404);
       }
       let userID = parseInt(req.params.id);
       // let rawdataNewsByUser = fs.readFileSync(path.join(__dirname, "../storage/newsByUser.json"));
       // let newsByUser = JSON.parse(rawdataNewsByUser);
       let rawdataNews = fs.readFileSync(path.join(__dirname, "../storage/news.json"));
       let news = JSON.parse(rawdataNews);
       let rawdataFriendsByUser = fs.readFileSync(path.join(__dirname, "../storage/friendsByUser.json"));
       let friendsByUser = JSON.parse(rawdataFriendsByUser);
       let friends = [];
       let userFriendsNews = [];
       for (const friend of friendsByUser) {
           if (parseInt(friend.id) === userID){
               friends = friend.friends;
               break;
           }
       }
       for (const post of news) {
           if (friends.includes(post.userID)){
               userFriendsNews.push({
                   userID: post.userID,
                   id: post.id,
                   title: post.title,
                   content: post.content
               })
           }
       }
       res.send({ news: userFriendsNews});
   } catch (e){
       console.error(e)
   }
});

router.get('/getUsers', async (req, res) => {
    try {
        let rawdata = fs.readFileSync(path.join(__dirname, "../storage/users.json"));
        let users = JSON.parse(rawdata);
        res.send({users: users});
    } catch (e) {
        console.error(e);
        res.redirect('/');
    }
});

function getUserByEmail(email, users) {
    try {
        for (let user of users){
            if (user.email === email){
                user.dateBirth = (new Date(user.dateBirth)).toLocaleDateString("ru")
                return user
            }
        }
        return undefined;
    } catch (e) {
        console.error(e)
    }
}

router.post('/authenticate', (req, res, next) => {
    let users;
    if (req.body) {
        users = JSON.parse(req.body.allUsers);
        //const user = req.body;
        let user = {};
        const emailUser = req.body.email;
        const password = req.body.password;
        let user_db = getUserByEmail(emailUser, users);

        if (user_db.password === password) {
            const token = jwt.sign(user, JWT_Secret);
            sessions[token] = user_db.id;
            user = user_db;
            // user.id = user_db.id;
            // user.email = user_db.email;
            // user.name = {
            //     firstName: user_db.name.firstName,
            //     lastName: user_db.name.lastName
            // }
            res.status(200).send({
                signed_user: user,
                token: token,
            });
        } else {
            res.status(403).send({
                errorMessage: 'Please provide email and password'
            });
        }
    }
});
module.exports = router;
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

/* GET home page. */
// TODO: сделать так, чтобы только админ мог зайти
router.get('/', function(req, res, next) {
    res.render('admin/index');
});

router.post('/getUsers', async (req, res) => {
    try {
        let rawdata = fs.readFileSync(path.join(__dirname, "../storage/users.json"));
        let users = JSON.parse(rawdata);
        res.send({users: users});
    } catch (e) {
        console.error(e);
        res.redirect('/');
    }
});

router.post('/setUsers', async (req, res) => {
   try {
       let rawdata = fs.readFileSync(path.join(__dirname, "../storage/users.json"));
       let users = JSON.parse(rawdata);
       let role = req.body.role;
       let index = parseInt(req.body.index);
       const roles = ["admin", "user"];
       const statuses = ["active", "unverified", "banned"];
       if (roles.includes(role)){
           users[index].isAdmin = role === "admin";
       } else if (statuses.includes(role)){
           users[index].status = role;
       }
       fs.writeFileSync(path.join(__dirname, "../storage/users.json"), JSON.stringify(users));
       res.send({users: users});
   } catch (e) {
       console.error(e);
       res.redirect('/');
   }
});

router.get('/newsFriends/:id', async function (req, res) {
    try {
        if (req.params.id != null && req.params.id !== ''){
            res.render('admin/newsFriends', {userID: req.params.id});
        } else{
            new Error('Incorrect request parameter id');
        }
    } catch (e) {
        console.error(e);
        res.redirect('/')
    }
    //res.render('admin/newsFriends');
});

router.get('/friends/:id', async function (req, res) {
   try {
       if (req.params.id != null && req.params.id !== ''){
           res.render('admin/friends', {userID: req.params.id});
       } else{
           new Error('Incorrect request parameter id');
       }
   } catch (e) {
       console.error(e);
       res.redirect('/')
   }
});

router.post('/getFriends', async function (req, res) {
   try {
       let rawdataFriendsByUser = fs.readFileSync(path.join(__dirname, "../storage/friendsByUser.json"));
       let rawdataUsers = fs.readFileSync(path.join(__dirname, "../storage/users.json"));
       let friendsByUser = JSON.parse(rawdataFriendsByUser);
       let users = JSON.parse(rawdataUsers);
       let name;
       let friendsID = [];
       let friends = [];
       let userId = parseInt(req.body.userID);
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
       console.error(e);
       res.redirect('/')
   }
});

router.post('/getNewsFriends', async (req, res) =>{
    try {
        let userID = parseInt(req.body.userID);
        let rawdataNewsByUser = fs.readFileSync(path.join(__dirname, "../storage/newsByUser.json"));
        let newsByUser = JSON.parse(rawdataNewsByUser);
        let rawdataNews = fs.readFileSync(path.join(__dirname, "../storage/news.json"));
        let news = JSON.parse(rawdataNews);
        // let rawdataUsers = fs.readFileSync(path.join(__dirname, "../storage/users.json"));
        // let users = JSON.parse(rawdataUsers);
        let rawdataFriendsByUser = fs.readFileSync(path.join(__dirname, "../storage/friendsByUser.json"));
        let friendsByUser = JSON.parse(rawdataFriendsByUser);
        // let numberUserByID;
        let friends = [];
        let userFriendsNewsID = [];
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
                    title: post.title,
                    content: post.content
                })
            }
        }
        res.send({ news: userFriendsNews}); // user???


    } catch (e) {
        console.error(e);
        res.redirect('/')
    }
})

module.exports = router;

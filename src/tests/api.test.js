const request = require('supertest')
const app = require('../app')
const users = require('../storage/users.json');
const friends = require('../storage/friendsByUser.json');
const newsByUser = require('../storage/newsByUser.json');
const news = require('../storage/news.json');
const assert = require("assert");
const fs = require("fs");
const path = require("path");


describe('Проверка настройки приложения', () => {
    test('response getUsers has users', async () => {
        const response = await request(app).get('/api/getUsers');
        expect(response.statusCode).toBe(200);
        expect(response.body.users).toBeDefined();
    })

    test('такие же пользователи как и в хранилище', async () => {
        const response = await request(app).get('/api/getUsers');
        expect(response.body.users).toEqual(users);
    })

    test('вернуть пользователя по id=1', async () => {
        const response = await request(app).get('/api/user/1');
        let user;
        for (const currentUser of users) {
            if (parseInt(currentUser.id) === 1){
                user = currentUser;
                break;
            }
        }
        expect(response.body.user).toBeDefined();
        expect(response.body.user).toEqual(user)
    })

    test('вернуть друзей пользователя с id=1', async () => {
        const checkID = 1;
        const response = await request(app).get(`/api/friends/${checkID}`);
        let userFriendsIDs, name, userFriends;
        userFriends = [];
        for (const currentUser of friends) {
            if (parseInt(currentUser.id) === checkID){
                userFriendsIDs = currentUser.friends;
                break;
            }
        }
        for (const user of users) {
            let userID = parseInt(user.id)
            if (userID === checkID){
                name = user.name;
            }
            if (userFriendsIDs.includes(userID)){
                delete user.password;
                delete user.photo;
                userFriends.push(user);
            }
        }
        expect(response.body.users).toBeDefined();
        expect(response.body.name).toBeDefined();
        expect(response.body.users).toEqual(userFriends);
        expect(response.body.name).toEqual(name);
    })

    test('посты пользователя с id=1', async () => {
        let checkID = 1;
        const response = await request(app).get(`/api/posts/${checkID}`);
        let posts = [];
        for (const post of news) {
            if (parseInt(post.userID) === checkID){
                posts.push(post);
            }
        }
        expect(response.body.news).toBeDefined();
        expect(response.body.news).toEqual(posts);
    })

    test('посты друзей пользователя с id=1', async () => {
        let checkID = 1;
        const response = await request(app).get(`/api/postsFriends/${checkID}`);
        let userFriends = [];
        let userFriendsNews = [];
        for (const friend of friends) {
            if (parseInt(friend.id) === checkID){
                userFriends = friend.friends;
                break;
            }
        }
        for (const post of news) {
            if (userFriends.includes(post.userID)){
                userFriendsNews.push({
                    userID: post.userID,
                    id: post.id,
                    title: post.title,
                    content: post.content
                })
            }
        }
        expect(response.body.news).toBeDefined();
        expect(response.body.news).toEqual(userFriendsNews);
    })
})

describe('Проверка создания нового пользователя', () => {
    test('response has signed_user and token', async () => {
        request(app).post('/api/authenticate')
            .send({
                allUsers: users,
                email: 'nikitaboyarkin15@gmail.com',
                password: 'Nikita'
            })
            .expect(200)
            .expect(function (res) {
                expect(res.signed_user).toBeDefined();
                expect(res.token).toBeDefined();
            })
    })

    test('wrong password', async () => {
        request(app).post('/api/authenticate')
            .send({
                allUsers: users,
                email: 'nikitaboyarkin15@gmail.com',
                password: 'wrong'
            })
            .expect(403)
            .expect(function (res) {
                expect(res.errorMessage).toBeDefined();
                expect(res.errorMessage).toEqual('Please provide email and password');
            })
    })
})
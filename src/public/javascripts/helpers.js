function convertToJSON(res) {
    return res.json();
}

async function sendRequest(method, url, body = null) {
    let options = {
        method: method,
        headers: {'Content-Type': 'application/json'},
    };
    if (body){
        options.body = JSON.stringify(body);
    }
    // TODO: сократить код, сделать рефакторинг
    if (url === 'https://localhost:3000/admin/getFriends'
        || url === 'https://localhost:3000/admin/getUsers'){

        await fetch(url, options).then(convertToJSON).then(res => {
            renderUsers(res, url)
        }).catch(err => {
            console.error(err)
        });
    } else if (url === 'https://localhost:3000/admin/setUsers'){
        await fetch(url, options).then(convertToJSON).then(res => {
            let {users} = res;
            for (let [index, user] of users.entries()) {
                setSelectedValues(user, index);
            }
        }).catch(err => {
            console.error(err)
        });
    } else if (url === 'https://localhost:3000/admin/getNewsFriends'){
        await fetch('https://localhost:3000/admin/getFriends', options)
            .then(convertToJSON)
            .then(res => {
                return renderUsers(res, url);
            }).then(async indexByID => {
                await fetch(url, options)
                    .then(convertToJSON)
                    .then(res => {
                        renderNews(res, indexByID);
                    })
            }).catch(err => {
                console.error(err);
            })
    }
}

// async function findNumberUserByID(userID) {
//     let number;
//     let options = {
//         method: 'POST',
//         headers: {'Content-Type': 'application/json'},
//         body: userID
//     };
//     await fetch('', options).then(convertToJSON).then(async (ID) => {
//         number = ID;
//     })
//     return number;
// }

async function renderPost(post, index, numberUserInFriendsByID) {
    //console.log(post);
    //let numberUserInFriendsByID = await findNumberUserByID(userID);
    //console.log(`numberUserInFriendsByID: ${numberUserInFriendsByID}`)
    $(`#card-group${numberUserInFriendsByID}`).append(`<div class="card" id="card${index}_${numberUserInFriendsByID}"></div>`);
    //debugger;
    $(`#card${index}_${numberUserInFriendsByID}`).append(`<div class="card-body" id="card-body${index}_${numberUserInFriendsByID}"></div>`);
    $(`#card-body${index}_${numberUserInFriendsByID}`).append(`<h2 class="card-title" id="card-title${index}_${numberUserInFriendsByID}">${post.title}</h2>`)
                            .append(`<div class="card-text">${post.content}</div>`);
}

async function renderNews(res, indexByID){
    let {news} = res;
    //console.log(news);
    for (const [index, post] of news.entries()) {
        await renderPost(post, index, indexByID[post.userID]);
    }
}

async function renderUsers(res, url) {
    let {name, users} = res;
    let indexByID = {};
    createTableHead(url, name);
    for (let [index, user] of users.entries()) {
        // console.log(`userID: ${user.id}`)
        // console.log(`index: ${index}`)
        indexByID[user.id] = index;
        await renderUser(user, index, url);
    }
//    console.log(indexByID)

    return indexByID;
}

async function renderUser(user, index, url) {
    //let indexByID = {};

    let columns = ["#", "ФИО", "Email", "Дата рождения",
        "Роль", "Статус", "Список друзей пользователя",
        "Список новостей друзей пользователя"];

    let htmlTags = [`${index}`,
        `<h5 class=\"font-medium mb-0\">${user.name?.firstName} ${user.name?.lastName}</h5>`,
        `<span class=\"text-muted\">${user.email}</span>`,
        `<span class=\"text-muted\">${(new Date(user.dateBirth)).toLocaleDateString("ru")}</span>`,
        `<select class=\"form-control category-select admin-user \" id=\"Select1_${index}\">" +
            <option value="admin ${index}">Админ</option> +
            <option value="user ${index}">Пользователь</option> +
            "</select>`,
        `<select class=\"form-control category-select select-status\" id=\"Select2_${index}\"> +
                <option value="unverified ${index}">Не подтверждённый пользователь</option> +
                <option value="active ${index}">Активный</option> +
                <option value="banned ${index}">Заблокированный</option> +
            </select>`,
        `<form class="form text-center" method="get" action="/admin/friends/${user.id}"><button class="btn btn-primary" type="submit">Click</button></form>`,
        `<form class="form text-center" method="get" action="/admin/newsFriends/${user.id}"><button class="btn btn-primary" type="submit">Click</button></form>`,
    ];
    if (url !== 'https://localhost:3000/admin/getUsers'){  // TODO: duplicates
        let deleteCount = url === 'https://localhost:3000/admin/getNewsFriends' ? 4 : 2;
        htmlTags.splice(4, deleteCount);
        columns.splice(4, deleteCount);
        if (url === 'https://localhost:3000/admin/getNewsFriends'){
            columns.push("Новости пользователя");
        }
    }
    if (url === 'https://localhost:3000/admin/getNewsFriends'){
        let htmlTag = `<button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modal${index}">
                                Посмотреть новости пользователя
                            </button>`;
        htmlTags.push(htmlTag);
    }
    $('#table-body').append(`<tr id="table-row${index}"></tr>`);
    for (let i = 0; i < columns.length; i++) {
        let html = htmlTags[i];
        $(`#table-row${index}`).append(`<td id="table-data${i}"></td>`);
        $(`#table-row${index} > #table-data${i}`).append(html);
    }
    $(`#table-row${index} td:first-child`).addClass("pl-4");
    if (url === 'https://localhost:3000/admin/getUsers'){
        setSelectedValues(user, index);
    } else if (url === 'https://localhost:3000/admin/getNewsFriends'){
        // TODO: fix borders
        $(`#table-row${index} td:last-child`).append(`<div class="modal fade" id="modal${index}"></div>`);
        $(`#modal${index}`).append(`<div class="modal-dialog" id="modal-dialog${index}"></div>`);
        $(`#modal-dialog${index}`).append(`<div class="modal-content" id="modal-content${index}"></div>`);
        $(`#modal-content${index}`).append(`<div id="modalHeader${index}" class="modal-header"></div>`)
            .append(`<div class="modal-body" id="modal-body${index}"></div>`);
        $(`#modal-body${index}`).append(`<div class="card-group vstack gap-3" id="card-group${index}">`);
        $(`#modalHeader${index}`).append(`<h4 class="modal-title">Новости пользователя ${user.name?.firstName} ${user.name?.lastName}</h4>`)
            .append(`<button class="btn-close" data-bs-dismiss="modal" data-bs-target="#modal${index}"></button>`);
        // TODO: fix btn
    }

}

function setSelectedValues(user, index) {
    $(`select option[value='admin ${index}']`).prop('selected', user.isAdmin);
    $(`select option[value='user ${index}']`).prop('selected', !user.isAdmin);
    $(`select option[value='active ${index}']`).prop('selected', user.status === 'active');
    $(`select option[value='unverified ${index}']`).prop('selected', user.status === 'unverified');
    $(`select option[value='banned ${index}']`).prop('selected', user.status === 'banned');
}

function createTableHead(url, options = null) {
    // TODO: подумать как улучшить функцию
    let firstName, lastName;
    if (options){
        //let name = options;
        firstName = options.firstName;
        lastName = options.lastName;
    }
    let cardTitle;
    if (url === 'https://localhost:3000/admin/getUsers'){
        cardTitle = "Список пользователей";
    } else if (url === 'https://localhost:3000/admin/getFriends'){
        cardTitle = "Список друзей пользователя";
    } else if (url === 'https://localhost:3000/admin/getNewsFriends'){
        cardTitle = "Список новостей друзей пользователя";
    }

    let cardTop = $("<div class=\"row\"></div>")
        .append("<div id='col' class=\"col-md-12\"></div>");
    $("#output").append(cardTop);

    $('#col').append("<div id='cardTop' class=\"card\"></div>");
    $('#cardTop').append("<div id='card-body' class=\"card-body\"></div>")
        .append("<div id='table-div' class=\"table-responsive\">");
    $('#card-body').append(`<h5 class=\"card-title text-uppercase mb-0\">${cardTitle}</h5>`);
    if (url !== 'https://localhost:3000/admin/getUsers'){
        $('#card-body').append(`<h6 class="card-title text-uppercase mb-0">Имя: ${firstName}</h6>`)
                        .append(`<h6 class="card-title text-uppercase mb-0">Фамилия: ${lastName}</h6>`);
    }
    $('#table-div').append("<table id='table' class=\"table no-wrap user-table mb-0\"></table>");
    $('#table').append("<thead id=\"tableHead\"></thead>")
        .append("<tbody id='table-body'></tbody>");
    $('#tableHead').append("<tr id=\"columns\"></tr>");
    let columns = ["#", "ФИО", "Email", "Дата рождения",
        "Роль", "Статус", "Список друзей пользователя",
        "Список новостей друзей пользователя"];
    if (url !== 'https://localhost:3000/admin/getUsers'){ // TODO: duplicates
        let deleteCount = url === 'https://localhost:3000/admin/getNewsFriends' ? 4 : 2;
        columns.splice(4, deleteCount);
    }
    if (url === 'https://localhost:3000/admin/getNewsFriends'){
        columns.push("Новости пользователя");
    }
    for (let i = 0; i < columns.length; i++) {
        $("#columns").append(`<th scope=\"col\" class=\"border-0 text-uppercase font-medium\">${columns[i]}</th>`)
    }
    $("#columns th:first-child").addClass("pl-4");
}

async function handleChangeSelect () {
    const values = $(this).val().split(' ');
    const role = values[0];
    const index = values[1];
    let body = {
        role: role,
        index: index
    };
    await sendRequest("POST", 'https://localhost:3000/admin/setUsers', body);
}

function getScriptParams() {
    const script = document.getElementById('script-friends');
    return {
        userID: script.getAttribute('data-id')
    };
}

export {sendRequest, createTableHead, handleChangeSelect, getScriptParams};
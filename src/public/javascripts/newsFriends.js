import {getScriptParams, sendRequest} from "./helpers.js";

$(document).ready(async () =>{
    let { userID } = getScriptParams();

    let body = {
        userID: userID
    };

    await sendRequest('POST', 'https://localhost:3000/admin/getNewsFriends', body);

})
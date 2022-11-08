import {sendRequest, getScriptParams} from "./helpers.js";

$(document).ready(async () => {

    let { userID } = getScriptParams();

    let body = {
      userID: userID
    };

    await sendRequest('POST', 'http://localhost:3000/admin/getFriends', body);

})
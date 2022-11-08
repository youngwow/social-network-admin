import {sendRequest, handleChangeSelect} from "./helpers.js";

$(document).ready(async () => {

    await sendRequest("POST", 'http://localhost:3000/admin/getUsers');

    $(".admin-user, .select-status").change(handleChangeSelect);
});
const axios = require('axios');
const keyCaptcha = "wgkyhrdzbb4xjgfwrccjqptlf9638ypz";

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
exports.getIdCaptcha = async(url, googleKey) => {
    let apiUrl = `https://azcaptcha.com/in.php?key=${keyCaptcha}&googlekey=${googleKey}&method=userrecaptcha&invisible=1&pageurl=${url}`;
    let response = await axios.get(apiUrl);
    return response.data.split('|')[1];
}

exports.getCaptchaCode = async(id) => {
    let apiUrl = `https://azcaptcha.com/res.php?key=${keyCaptcha}&action=get&id=${id}`;
    let response = await axios.get(apiUrl);
    let count = 0;
    while (response.data.indexOf('CAPCHA_NOT_READY') > -1) {
        count++;
        console.log(`Count ${count} - ` + response.data);
        await sleep(5000);
        response = await axios.get(apiUrl);
    }
    return response.data;
}
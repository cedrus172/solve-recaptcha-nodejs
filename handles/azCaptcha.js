const axios = require("axios");

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
exports.getIdCaptcha = async (url, googleKey, keyCaptcha) => {
  let apiUrl = `https://captcha69.com/in.php?key=${keyCaptcha}&googlekey=${googleKey}&method=userrecaptcha&invisible=1&pageurl=${url}`;
  let response = await axios.get(apiUrl);
  while (response.data.indexOf("ERROR_") > -1) {
    await sleep(3000);
    response = await axios.get(apiUrl);
  }
  return response.data.split("|")[1];
};

exports.getCaptchaCode = async (id, webName, keyCaptcha) => {
  let apiUrl = `https://captcha69.com/res.php?key=${keyCaptcha}&action=get&id=${id}`;
  let response = await axios.get(apiUrl);
  let count = 0;
  while (response.data.indexOf("CAPCHA_NOT_READY") > -1) {
    count++;
    if (count > 30) break;
    console.log(`Count ${count} - ${webName} -  ` + response.data);
    await sleep(5000);
    response = await axios.get(apiUrl);
  }
  return response.data;
};

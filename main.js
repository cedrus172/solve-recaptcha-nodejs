let listCaptchaWeb = [];
let listWeb = [{
        webName: "pocinex-web",
        googleKey: "",
        url: "https://moonata1.net"
    },
    {
        webName: "aresbo-web",
        googleKey: "",
        url: "https://ravo1.finance"
    },
    {
        webName: "tlctrade-web",
        googleKey: "6LcGyCAfAAAAABKPMWfnz1ZB8CK1b3LcYAKC-CSd",
        url: "https://tlctrade1.net"
    },
    {
        webName: "rosichi-web",
        googleKey: "6LeaaYkcAAAAAEEbhDH0Pr5gFD74Z7BDMgQy2MbE",
        url: "https://bitiva1net"
    },
    {
        webName: "bodefi-web",
        googleKey: "6LdTlxwbAAAAAEV8gvhUrLIT_TIP9X9-xgsJd-ug",
        url: "https://bodefi1.net"
    },
];
const azCaptcha = require("./handles/azCaptcha");


async function getCaptchaCode(webName) {
    let webInfo = listWeb.find(a => a.webName == webName);
    let id = await azCaptcha.getIdCaptcha(webInfo.url, webInfo.googleKey);
    let captchaCode = await azCaptcha.getCaptchaCode(id);
    console.log(captchaCode);
}

getCaptchaCode('bodefi-web');
getCaptchaCode('rosichi-web');
getCaptchaCode('tlctrade-web');
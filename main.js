const cors = require("cors");
const corsOptions = {
    origin: "*",
    credentials: true, //access-control-allow-credentials:true
    optionSuccessStatus: 200,
};
const PORT = 8000;
var app = require("express")();
var http = require("http");
var sv = http.createServer(app);

var express = require("express");

app.use(express.json());
app.use(cors(corsOptions)); // Use this after the variable declaration

sv.listen(PORT, function() {
    console.log("listening on *:" + PORT);
});

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

app.get("/", function(req, res) {
    res.send("Hello World!");
});

app.get("/list", function(req, res) {
    res.json(listCaptchaWeb);
});

app.get("/list/:webName", function(req, res) {
    res.json(
        listCaptchaWeb.filter((a) => a.webName == req.params.webName.toLowerCase())
    );
});

app.get("/captcha/:webName", async function(req, res) {
    let findCaptcha = listCaptchaWeb.find(
        (a) => a.webName == req.params.webName.toLowerCase()
    );
    while (findCaptcha == null) {
        await sleep(1000);
        findCaptcha = listCaptchaWeb.find(
            (a) => a.webName == req.params.webName.toLowerCase()
        );
    }
    listCaptchaWeb = listCaptchaWeb.filter((a) => a != findCaptcha);
    res.json(findCaptcha);
});

app.get("/thread", function(req, res) {
    res.json({ thread: currentThread });
});

app.get("/web/:name", function(req, res) {
    let findWeb = listWeb.find(a => a.webName == req.params.name);
    res.json({ findWeb });
})

var currentThread = 0;

let listCaptchaWeb = [];
let listWeb = [{
        webName: "pocinex-web",
        googleKey: "6LezeH4bAAAAADaKWgP8pKekA_CSYJuSh1eUcwMh",
        url: "https://moonata1.net",
        keyCaptcha: "thread_66a54241da3851e304520f092bfee687",
        canSolve: true,
    },
    {
        webName: "aresbo-web",
        googleKey: "6LeEkukaAAAAALI6fsd1mVukHEuuVaRT4ckaXy-i",
        url: "https://ravo1.finance",
        keyCaptcha: "thread_66a54241da3851e304520f092bfee687",
        canSolve: true,
    },
    {
        webName: "tlctrade-web",
        googleKey: "6LcGyCAfAAAAABKPMWfnz1ZB8CK1b3LcYAKC-CSd",
        url: "https://tlctrade.net",
        keyCaptcha: "thread_66a54241da3851e304520f092bfee687",
        canSolve: true,
    },
    {
        webName: "rosichi-web",
        googleKey: "6LeaaYkcAAAAAEEbhDH0Pr5gFD74Z7BDMgQy2MbE",
        url: "https://bitiva1.net",
        keyCaptcha: "thread_66a54241da3851e304520f092bfee687",
        canSolve: true,
    },
    {
        webName: "bodefi-web",
        googleKey: "6LdTlxwbAAAAAEV8gvhUrLIT_TIP9X9-xgsJd-ug",
        url: "https://bodefi.net",
        keyCaptcha: "thread_66a54241da3851e304520f092bfee687",
        canSolve: false,
    },
    {
        webName: "binanex-web",
        googleKey: "6Ldqd34bAAAAAPPlIpT3EkI6h2NlLO_xg61BsILg",
        url: "https://central1.vip",
        keyCaptcha: "thread_66a54241da3851e304520f092bfee687",
        canSolve: true,
    },
];
const azCaptcha = require("./handles/azCaptcha");

async function getCaptchaCode(webName) {
    let webInfo = listWeb.find((a) => a.webName == webName);
    let id = await azCaptcha.getIdCaptcha(
        webInfo.url,
        webInfo.googleKey,
        webInfo.keyCaptcha
    );
    currentThread++;
    if (id != null) {
        await sleep(5000);
        let captchaCode = await azCaptcha.getCaptchaCode(
            id,
            webInfo.webName,
            webInfo.keyCaptcha
        );

        if (captchaCode.indexOf("OK") > -1) {
            addCaptchaToList(captchaCode.split("|")[1], webName, new Date());
        }
        console.log(webName, captchaCode, id);
        getCaptchaCode(webName);
    }
    currentThread--;
}

function addCaptchaToList(captchaCode, webName, timeSolve) {
    listCaptchaWeb.push({
        captchaCode: captchaCode,
        webName: webName,
        timeSolve: timeSolve,
    });
}

function startSolveCaptcha(thread) {
    for (let i = 0; i < thread; i++) {
        listWeb.forEach((web) => {
            if (web.canSolve) {
                getCaptchaCode(web.webName);
            }
        });
    }

    setInterval(filterCaptchaExpired, 500);
}

function filterCaptchaExpired() {
    let tempCaptcha = [];

    try {
        listCaptchaWeb.forEach((captcha) => {
            let newTime = new Date(captcha.timeSolve);
            newTime.setSeconds(newTime.getSeconds() + 90);
            if (newTime > new Date()) tempCaptcha.push(captcha);
        });

        listCaptchaWeb = tempCaptcha;
    } catch (e) {
        console.log(e);
    }
}

startSolveCaptcha(5);
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

sv.listen(PORT, function () {
  console.log("listening on *:" + PORT);
});

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

app.get("/", function (req, res) {
  res.send("Hello World!");
});

app.get("/dashboard", function (req, res) {
  let data = [];
  listWeb.forEach((web) => {
    if (web.canSolve) {
      let findCaptchas = listCaptchaWeb.filter((a) => a.webName == web.webName);
      if (findCaptchas) {
        data.push({
          webName: web.webName,
          countCaptcha: findCaptchas.length,
          solving: web.solving,
        });
      }
    }
  });

  res.json(data);
});

app.get("/add/:webName", function (req, res) {
  let webName = req.params.webName;
  let findWebname = listWeb.find((a) => a.webName == webName);
  if (findWebname) {
    getCaptchaCode(webName);
    res.json({ ok: true, message: "Add success 1 thread for " + webName });
  } else {
    res.json({ ok: false, message: "Not found " + webName });
  }
});

app.get("/list", function (req, res) {
  res.json(listCaptchaWeb);
});

app.get("/list/:webName", function (req, res) {
  res.json(
    listCaptchaWeb.filter((a) => a.webName == req.params.webName.toLowerCase())
  );
});

app.get("/captcha/:webName", async function (req, res) {
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

app.get("/thread", function (req, res) {
  res.json({ thread: currentThread });
});

app.get("/web/:name", function (req, res) {
  let findWeb = listWeb.find((a) => a.webName == req.params.name);
  res.json({ findWeb });
});

var currentThread = 0;

let listCaptchaWeb = [];
let listWeb = [
  {
    webName: "pocinex-web",
    googleKey: "6LezeH4bAAAAADaKWgP8pKekA_CSYJuSh1eUcwMh",
    url: "https://moonata1.net",
    keyCaptcha: "thread_66a54241da3851e304520f092bfee687",
    canSolve: true,
    solving: 0,
    thread: 2,
  },
  {
    webName: "aresbo-web",
    googleKey: "6LeEkukaAAAAALI6fsd1mVukHEuuVaRT4ckaXy-i",
    url: "https://ravo1.finance",
    keyCaptcha: "thread_66a54241da3851e304520f092bfee687",
    canSolve: true,
    solving: 0,
    thread: 10,
  },
  {
    webName: "tlctrade-web",
    googleKey: "6LcGyCAfAAAAABKPMWfnz1ZB8CK1b3LcYAKC-CSd",
    url: "https://tlctrade.net",
    keyCaptcha: "thread_66a54241da3851e304520f092bfee687",
    canSolve: true,
    solving: 0,
    thread: 3,
  },
  {
    webName: "rosichi-web",
    googleKey: "6LeaaYkcAAAAAEEbhDH0Pr5gFD74Z7BDMgQy2MbE",
    url: "https://bitiva1.net",
    keyCaptcha: "thread_66a54241da3851e304520f092bfee687",
    canSolve: true,
    solving: 0,
    thread: 8,
  },
  {
    webName: "bodefi-web",
    googleKey: "6LdTlxwbAAAAAEV8gvhUrLIT_TIP9X9-xgsJd-ug",
    url: "https://bodefi.net",
    keyCaptcha: "thread_66a54241da3851e304520f092bfee687",
    canSolve: false,
    solving: 0,
  },
  {
    webName: "binanex-web",
    googleKey: "6Ldqd34bAAAAAPPlIpT3EkI6h2NlLO_xg61BsILg",
    url: "https://central1.vip",
    keyCaptcha: "thread_66a54241da3851e304520f092bfee687",
    canSolve: true,
    solving: 0,
    thread: 1,
  },
];
const captchaSv = require("./handles/captcha69");

async function getCaptchaCode(webName) {
  let start = new Date();
  let webInfo = listWeb.find((a) => a.webName == webName);
  webInfo.solving++;
  currentThread++;
  let id = await captchaSv.getIdCaptcha(
    webInfo.url,
    webInfo.googleKey,
    webInfo.keyCaptcha
  );
  if (id != null) {
    await sleep(5000);
    let captchaCode = await captchaSv.getCaptchaCode(
      id,
      webInfo.webName,
      webInfo.keyCaptcha
    );

    if (captchaCode.indexOf("OK") > -1) {
      var end = new Date() - start;
      addCaptchaToList(captchaCode.split("|")[1], webName, new Date(), end);
    }
    console.log(webName, captchaCode, id);
    getCaptchaCode(webName);
  }
  currentThread--;
  webInfo.solving--;
}

function addCaptchaToList(captchaCode, webName, timeSolve, timeProcess) {
  listCaptchaWeb.push({
    captchaCode: captchaCode,
    webName: webName,
    timeSolve: timeSolve,
    timeProcess: timeProcess,
  });
}

function startSolveCaptcha() {
  listWeb.forEach((web) => {
    if (web.canSolve) {
      for (let i = 0; i < web.thread; i++) {
        getCaptchaCode(web.webName);
      }
    }
  });

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

startSolveCaptcha();

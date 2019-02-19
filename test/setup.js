import http from 'http'
import express from 'express'
import bodyParser from 'body-parser'
import stoppable from 'stoppable'

var AsyncRouter = require("express-async-router").AsyncRouter;
var router = AsyncRouter();

const app = express()

let attemptLeft = 3

app.use(bodyParser.json())

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

router.get('/name', (req, res) => {
  res.status(200).send({name: 'name'})
})

router.post('/name', (req, res) => {
  if (req.body.success) {
    res.status(200).send({success: true})
  } else {
    res.status(500).send({success: false})
  }
})

router.get('/timeout', async (req, res) => {
  await timeout(500);
  res.status(200).send({success: true});
})

router.get('/timeout2', async (req, res) => {
  await timeout(100);
  res.status(200).send({success: true});
})

router.get('/retries', (req, res) => {
  attemptLeft = attemptLeft - 1
  if (attemptLeft === 0) {
    res.status(200).send({success: true})
    attemptLeft = 3
  } else {
    res.status(500).send({success: false})
  }
})

app.use('/', router)
global.PORT = 8000
const rawServer = http.createServer(app)

const server = stoppable(rawServer)
server.listen(global.PORT)

global.stop = function () {
  server.close()
}

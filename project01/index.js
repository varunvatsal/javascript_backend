require('dotenv').config()
const express = require('express')
const app = express()
// const port = 4000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/varun', (req, res) => {
  res.send('@varunvatsal3')
})

app.get('/login', (req, res) => {
  res.send('<h1> login on twitter </h1>')
})

app.get('/youtube', (req, res) => {
  res.redirect('https://www.youtube.com/watch?v=pOV4EjUtl70')
})

app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}`)
})
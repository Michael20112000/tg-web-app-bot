const TelegramBot = require('node-telegram-bot-api')
const webAppUrl = 'https://tg-web-app-react-42.netlify.app'
const token = '6978088776:AAFfYPvROAtFQW17jiNzHSlkN3KCMkTuC4Y'
const express = require('express')
const cors = require('cors')

const bot = new TelegramBot(token, {polling: true})
const app = express()

app.use(express.json())
app.use(cors())

bot.on('message', async msg => {
  const chatId = msg.chat.id
  const {text} = msg

  if (text === '/start') {
    await bot.sendMessage(chatId, 'Нижче з\'явиться кнопка, заповни форму', {
      reply_markup: {
        inline_keyboard: [
          [{text: 'Зробити замовлення', web_app: {url: webAppUrl}}]
        ]
      }
    })
  }

  if (msg?.web_app_data?.data) {
    try {
      const data = JSON.parse(msg?.web_app_data?.data)

      await bot.sendMessage(chatId, `Thanks! Your country: ${data?.country}, your street: ${data?.street}.`)
    } catch (err) {
      console.log(err)
    }
  }
})

bot.on('polling_error', (msg) => console.log(msg))

app.post('/web-data', async (req, res) => {
  const {queryId, products, totalPrice} = req.body

  try {
    await bot.answerWebAppQuery(queryId, {
      type: 'article',
      id: queryId,
      title: 'Success buy!',
      input_message_content: {
        message_text: `Congratulations! Sum: ${totalPrice}.`,
      },
    })
    res.status(200).json({})
  } catch (e) {
    await bot.answerWebAppQuery(queryId, {
      type: 'article',
      id: queryId,
      title: 'Error buy!',
      input_message_content: {
        message_text: `Failed buy by sum: ${totalPrice}.`,
      },
    })
    res.status(500).json({})
  }
})

const PORT = 8080
app.listen(PORT, () => {
  console.log(`Server has been started on port ${PORT}...`)
})

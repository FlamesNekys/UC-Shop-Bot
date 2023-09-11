const TelegramBot = require('node-telegram-bot-api');
const {getInvoice1, getInvoice2, getInvoice3, getInvoice4} = require('./ProductList');
require('dotenv').config()

const token = process.env.BOT_TOKEN
const providerToken = process.env.PROVIDER_TOKEN

const bot = new TelegramBot(token, {polling: true})

bot.setMyCommands([
    {command: '/start', description: 'Список паков  💸'},
    {command: '/reviews', description: 'Отзывы 🫡'},
    {command: '/help', description: 'Помощь ❕'}
])

const photo = './images/preview.png'

const start = () => {

    bot.on('message', async msg => {    
        const text = msg.text
        const chatId = msg.chat.id

        if (text === '/start') {
            try {
                return bot.sendPhoto(chatId, photo, {
                    caption: '⚡️\*Привет, это бот от LOVELY UC Shop*\⚡️\n\nВыбери пак ниже либо свяжись с менеджером для помощи по заказу\n\n \*Приятных покупок*\ 🔥',
                    parse_mode: 'MarkdownV2',
                    reply_markup: {
                        inline_keyboard: [
                            [{text: '💸 60 UC - 90 ₽', callback_data: '1'}, {text: '💸 120 UC - 180 ₽', callback_data: '2'}],
                            [{text: '💸 180 UC - 270 ₽', callback_data: '3'}, {text: '💸 240 UC - 360 ₽', callback_data: '4'}],
                            [{text: '❕ ПОМОЩЬ ❕', url: "tg://user?id=2103385787"}]
                        ]
                    }
                })} catch (error) {
                return bot.sendMessage(427596422, `${error.message}`);
            }
        }

        if (text === '/help') {
            return bot.sendMessage(chatId, '[Написать LOVELY](tg://user?id=2103385787)', {parse_mode: 'MarkdownV2'})
        }

        if (text === '/reviews') {
            return bot.sendMessage(chatId,'[Наши отзывы](https://t.me/LovelyUC_reviews)' , {parse_mode: 'MarkdownV2', disable_web_page_preview: true})
        }
    })

    bot.on('callback_query', async msg => {
        const data = msg.data
        const chatId = msg.message.chat.id
        const currency = "RUB"
                
        if (data === '1') {
            try {
                return bot.sendInvoice(
                    chatId, 
                    getInvoice1.description, 
                    getInvoice1.title, 
                    `${getInvoice1.title}`,  
                    providerToken, 
                    currency, 
                    getInvoice1.prices
                )
            } catch (error) {
                return bot.sendMessage(427596422, `${error.message}`);
            } 
        }
                
        if (data === '2') {
            try {
                return bot.sendInvoice(
                    chatId, 
                    getInvoice2.title, 
                    getInvoice2.description, 
                    `${getInvoice2.title}`, 
                    providerToken, 
                    currency, 
                    getInvoice2.prices
                )
            } catch (error) {
                return bot.sendMessage(427596422, `${error.message}`);
            } 
        }

        if (data === '3') {
            try {
                return bot.sendInvoice(
                    chatId, 
                    getInvoice3.title, 
                    getInvoice3.description, 
                    `${getInvoice3.title}`, 
                    providerToken, 
                    currency, 
                    getInvoice3.prices
                )
            } catch (error) {
                return bot.sendMessage(427596422, `${error.message}`);
            } 
        }

        if (data === '4') {
            try {
                return bot.sendInvoice(
                    chatId, 
                    getInvoice4.title, 
                    getInvoice4.description, 
                    `${getInvoice4.title}`, 
                    providerToken, 
                    currency, 
                    getInvoice4.prices
                )
            } catch (error) {
                return bot.sendMessage(427596422, `${error.message}`);
            } 
        }
    })

    bot.on('pre_checkout_query', async query => {
        await bot.answerPreCheckoutQuery(query.id, true)
    })
    bot.on('successful_payment', async msg => {
        const chatId = msg.from.id
        const uniqueId = `${chatId}_${Number(new Date())}`
        const info = msg.successful_payment
        let msgId = 0

        setTimeout(async () => await bot.sendMessage(chatId, 'Ваш заказ оплачен ✅\n\nПожалуйста, пришлите ID своего аккаунта в PUBG Mobile (только цифры)')
            .then ((msg) => msgId = msg.message_id), 4400)

        bot.on('text', async msg => {
            const text = msg.text
            const chatId = msg.from.id

            try {
                if (text.charCodeAt(0) === 53 && (text.length === 10 || text.length === 11)) {
                    await bot.sendMessage(chatId, 'Благодарим за покупку\\! ❤️\n\nСумма заказа: ' + (info.total_amount / 100) + ' рублей\n\nНомер заказа: `' + uniqueId + '`\n\nВаш заказ выполняется, в скором времени UC поступят на ваш аккаунт\n\nПри возникновении вопросов свяжитесь с менеджером через кнопку "Помощь" в меню и предоставьте номер вашего заказа', {
                        parse_mode: 'MarkdownV2'
                        },
                    )
    
                    await bot.sendMessage(427596422, 
                        `Номер заказа: ${uniqueId}\n\nНик / Имя пользователя в ТГ: ${msg.from.username ? msg.from.username : (msg.from.first_name || msg.from.last_name)}\n\nЗаказ: ${info.invoice_payload} - ${info.total_amount / 100} рублей`
                    )
                    await bot.sendMessage(2103385787, 
                        `Номер заказа: ${uniqueId}\n\nНик / Имя пользователя: ${msg.from.username ? msg.from.username : (msg.from.first_name || msg.from.last_name)}\n\nЗаказ: ${info.invoice_payload} - ${info.total_amount / 100} рублей`
                    )
    
                    await bot.sendMessage(427596422, '`' + text + '`    ', {parse_mode: 'MarkdownV2'})
                    await bot.sendMessage(2103385787, '`' + text + '`    ', {parse_mode: 'MarkdownV2'})
    
                    return bot.off('text')
                } else {
                    return bot.sendMessage(chatId, 'Введен некорректный ID. Пожалуйста, проверьте правильность написания и повторите попытку')
                        .then ((msg) => msgId = msg.message_id)
                }
            } catch (error) {
                return bot.sendMessage(427596422, `${error.message}`);
            }
        })
    })  
}

start()
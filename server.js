const express = require('express');
const multer = require('multer');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, file.mimetype === 'image/jpeg')
});
app.use(express.static(path.join(__dirname, 'public')));
app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/api/photo', upload.single('photo'), async (req, res) => {
  try {
    if (!process.env.BOT_TOKEN || !process.env.CHAT_ID) {
      return res.status(503).json({ error: 'Telegram ещё не настроен: нужны BOT_TOKEN и CHAT_ID.' });
    }
    if (!req.file) return res.status(400).json({ error: 'Фото не получено или формат неверный.' });
    const bot = new TelegramBot(process.env.BOT_TOKEN);
    await bot.sendPhoto(process.env.CHAT_ID, req.file.buffer, {
      caption: 'Фото отправлено с романтического сайта после подтверждения пользователя 💗'
    }, { filename: 'photo.jpg', contentType: 'image/jpeg' });
    res.json({ ok: true });
  } catch (err) {
    console.error('Telegram send failed:', err.message);
    res.status(500).json({ error: 'Не удалось отправить фото в Telegram.' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Site running on port ${port}`));

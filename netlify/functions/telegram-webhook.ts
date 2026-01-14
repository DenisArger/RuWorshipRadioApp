import { Handler } from "@netlify/functions";
import { config } from "dotenv";
import TelegramBot from "node-telegram-bot-api";

// Load environment variables
config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEB_APP_URL = process.env.WEB_APP_URL || "https://your-app.netlify.app";

if (!BOT_TOKEN) {
  throw new Error("TELEGRAM_BOT_TOKEN is not set");
}

const bot = new TelegramBot(BOT_TOKEN);

export const handler: Handler = async (event) => {
  // Set CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  // Handle preflight requests
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const update = JSON.parse(event.body || "{}");

    // Handle /start command
    if (update.message?.text === "/start") {
      const chatId = update.message.chat.id;

      const message = `🎵 Добро пожаловать в Радио!\n\nНажмите кнопку ниже, чтобы открыть приложение и начать слушать радио.`;

      const keyboard = {
        inline_keyboard: [
          [
            {
              text: "🎵 Открыть радио",
              web_app: { url: WEB_APP_URL },
            },
          ],
        ],
      };

      await bot.sendMessage(chatId, message, {
        reply_markup: keyboard,
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ status: "OK", message: "Start command processed" }),
      };
    }

    // Handle other messages (optional)
    if (update.message) {
      const chatId = update.message.chat.id;
      const keyboard = {
        inline_keyboard: [
          [
            {
              text: "🎵 Открыть радио",
              web_app: { url: WEB_APP_URL },
            },
          ],
        ],
      };

      await bot.sendMessage(
        chatId,
        "Используйте команду /start для начала работы или нажмите кнопку ниже:",
        {
          reply_markup: keyboard,
        }
      );
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ status: "OK" }),
    };
  } catch (error) {
    console.error("Error processing webhook:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};


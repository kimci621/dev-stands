const express = require("express");
const cors = require("cors");
const app = express();

// Инициализация данных по умолчанию
let stands = {
  frontend: [
    {
      id: 1,
      name: "Frontend Stand 1",
      status: "free",
      occupiedBy: null,
      occupiedAt: null,
    },
    {
      id: 2,
      name: "Frontend Stand 2",
      status: "free",
      occupiedBy: null,
      occupiedAt: null,
    },
    {
      id: 3,
      name: "Frontend Stand 3",
      status: "free",
      occupiedBy: null,
      occupiedAt: null,
    },
  ],
  backend: [
    {
      id: 4,
      name: "Backend Stand 1",
      status: "free",
      occupiedBy: null,
      occupiedAt: null,
    },
    {
      id: 5,
      name: "Backend Stand 2",
      status: "free",
      occupiedBy: null,
      occupiedAt: null,
    },
    {
      id: 6,
      name: "Backend Stand 3",
      status: "free",
      occupiedBy: null,
      occupiedAt: null,
    },
  ],
};

let lastReset = Date.now();

// Middleware
app.use(cors());
app.use(express.json());

// Логирование запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

/**
 * Функция для сброса всех стендов
 */
function resetAllStands() {
  Object.values(stands).forEach((group) => {
    group.forEach((stand) => {
      stand.status = "free";
      stand.occupiedBy = null;
      stand.occupiedAt = null;
    });
  });
  lastReset = Date.now();
  console.log("Все стенды сброшены автоматически в полночь");
}

/**
 * Проверка необходимости автоматического сброса
 */
function checkAutoReset() {
  const now = new Date();
  const lastResetDate = new Date(lastReset);

  // Если прошло 24 часа или время сейчас 00:00
  if (
    now.getDate() !== lastResetDate.getDate() ||
    (now.getHours() === 0 && now.getMinutes() === 0)
  ) {
    resetAllStands();
  }
}

// API Routes

/**
 * GET /api/stands - Получить все стенды
 */
app.get("/api/stands", (req, res) => {
  checkAutoReset(); // Проверяем необходимость сброса
  res.json({
    stands,
    lastReset,
    timestamp: Date.now(),
  });
});

/**
 * POST /api/stands - Обновить стенды
 * Body: { stands: {...} }
 */
app.post("/api/stands", (req, res) => {
  try {
    if (!req.body.stands) {
      return res.status(400).json({ error: "Отсутствуют данные стендов" });
    }

    stands = req.body.stands;
    console.log("Стенды обновлены:", JSON.stringify(stands, null, 2));

    res.json({
      stands,
      lastReset,
      timestamp: Date.now(),
      message: "Стенды успешно обновлены",
    });
  } catch (error) {
    console.error("Ошибка при обновлении стендов:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

/**
 * POST /api/reset - Принудительный сброс всех стендов
 */
app.post("/api/reset", (req, res) => {
  try {
    resetAllStands();
    console.log("Выполнен принудительный сброс стендов");

    res.json({
      stands,
      lastReset,
      timestamp: Date.now(),
      message: "Все стенды успешно сброшены",
    });
  } catch (error) {
    console.error("Ошибка при сбросе стендов:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

/**
 * GET /api/health - Проверка работоспособности сервера
 */
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: Date.now(),
    uptime: process.uptime(),
  });
});

// Обработка несуществующих маршрутов
app.use("*", (req, res) => {
  res.status(404).json({ error: "Маршрут не найден" });
});

// Обработка ошибок
app.use((error, req, res, next) => {
  console.error("Глобальная ошибка:", error);
  res.status(500).json({ error: "Внутренняя ошибка сервера" });
});

// Автоматическая проверка сброса каждую минуту
setInterval(checkAutoReset, 60000);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📝 API доступен по адресу: http://localhost:${PORT}/api`);
  console.log(`⏰ Автоматический сброс стендов в полночь активирован`);
});

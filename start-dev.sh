#!/bin/bash

# Скрипт для одновременного запуска сервера и фронтенда

echo "🚀 Запуск системы управления стендами в режиме разработки"
echo "========================================================="

# Проверка наличия необходимых файлов
if [ ! -d "node_modules" ]; then
    echo "❌ Зависимости фронтенда не установлены. Запустите: npm install"
    exit 1
fi

if [ ! -d "server/node_modules" ]; then
    echo "❌ Зависимости сервера не установлены. Запустите: cd server && npm install"
    exit 1
fi

# Функция для завершения всех процессов при получении сигнала
cleanup() {
    echo ""
    echo "🛑 Остановка серверов..."
    kill $SERVER_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Установка обработчика сигналов
trap cleanup SIGINT SIGTERM

# Запуск API сервера в фоне
echo "🖥️  Запуск API сервера на порту 3001..."
cd server
npm start &
SERVER_PID=$!
cd ..

# Небольшая пауза для запуска сервера
sleep 2

# Запуск фронтенда в фоне
echo "📱 Запуск фронтенда на порту 3000..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Серверы запущены!"
echo "📱 Фронтенд: http://localhost:3000"
echo "🖥️  API: http://localhost:3001"
echo ""
echo "💡 Нажмите Ctrl+C для остановки всех серверов"
echo ""

# Ожидание завершения процессов
wait $SERVER_PID $FRONTEND_PID 
# ✅ Разделение стендов на Frontend и Backend

## 🎯 Что изменено

### До изменений:

- Все стенды дублировались в обе группы (frontend и backend)
- Занятие стенда влияло на обе группы одновременно
- Неэффективное использование ресурсов

### После изменений:

- ✅ **Frontend стенды**: Отдельная группа для фронтенд разработки
- ✅ **Backend стенды**: Отдельная группа для бэкенд разработки
- ✅ **Независимое управление**: Занятие стенда в одной группе не влияет на другую

## 📊 Текущая структура

### Frontend группа (7 стендов):

- Frontend Deploy LoadTest
- Frontend Deploy Dev
- Frontend Deploy Dev2
- Frontend Deploy Dev3
- Frontend Deploy Dev4
- Frontend Deploy Dev5
- Frontend AWS Dev

### Backend группа (7 стендов):

- Backend Deploy LoadTest
- Backend Deploy Dev
- Backend Deploy Dev2
- Backend Deploy Dev3
- Backend Deploy Dev4
- Backend Deploy Dev5
- Backend AWS Dev

## 🔧 Техническая реализация

### База данных

```sql
-- Стенды теперь имеют конкретные типы
SELECT name, type FROM stands;

-- Frontend стенды
type = 'frontend'

-- Backend стенды
type = 'backend'
```

### API ответ

```json
{
  "stands": {
    "frontend": [
      {
        "id": "uuid",
        "name": "Frontend Deploy Dev",
        "type": "frontend",
        "status": "free",
        "occupied_by": null,
        "occupied_at": null
      }
    ],
    "backend": [
      {
        "id": "uuid",
        "name": "Backend Deploy Dev",
        "type": "backend",
        "status": "free",
        "occupied_by": null,
        "occupied_at": null
      }
    ]
  }
}
```

### Логика разделения в `useSupabase.js`

```javascript
// Распределяем стенды по группам в зависимости от типа
if (stand.type === "frontend") {
  stands.frontend.push(frontendStand);
} else if (stand.type === "backend") {
  stands.backend.push(frontendStand);
} else {
  // Для стендов с неизвестным типом добавляем в обе группы
  stands.frontend.push(frontendStand);
  stands.backend.push({ ...frontendStand });
}
```

## 🎨 Отображение на фронтенде

### Группы стендов

- **"Фронтенд стенды"**: Отображает только frontend стенды
- **"Бэкенд стенды"**: Отображает только backend стенды

### Статистика

- Подсчет ведется отдельно для каждой группы
- Общая статистика суммирует обе группы

### Управление

- Занятие стенда в frontend группе не влияет на backend
- Каждая группа управляется независимо

## 🧪 Тестирование

### Проверка разделения

```bash
# Проверить количество стендов в группах
curl http://localhost:3000/api/stands | jq '{
  frontend_count: (.stands.frontend | length),
  backend_count: (.stands.backend | length)
}'

# Результат: {"frontend_count": 7, "backend_count": 7}
```

### Проверка занятости

```bash
# Занятые стенды по группам
curl http://localhost:3000/api/stands | jq '{
  frontend_occupied: [.stands.frontend[] | select(.status == "occupied") | .name],
  backend_occupied: [.stands.backend[] | select(.status == "occupied") | .name]
}'
```

### Занятие стенда

```bash
# Занять frontend стенд
STAND_ID=$(curl -s http://localhost:3000/api/stands | jq -r '.stands.frontend[0].id')
curl -X POST http://localhost:3000/api/stands \
  -H "Content-Type: application/json" \
  -d "{
    \"standId\": \"$STAND_ID\",
    \"action\": \"occupy\",
    \"user\": {
      \"email\": \"test@example.com\",
      \"name\": \"Тестовый пользователь\"
    }
  }"
```

## 🚀 Преимущества

### ✅ Четкое разделение ответственности

- Frontend команда работает с frontend стендами
- Backend команда работает с backend стендами
- Нет конфликтов при занятии стендов

### ✅ Лучшая организация

- Понятная структура для команд
- Легче отслеживать использование ресурсов
- Независимое планирование развертываний

### ✅ Масштабируемость

- Можно добавлять стенды только в нужную группу
- Легко настраивать права доступа
- Возможность разных настроек для групп

## 📱 Использование в интерфейсе

### 1. Вход в систему

```
Email: test@example.com
Пароль: password123
```

### 2. Просмотр стендов

- **Фронтенд стенды**: Секция с 7 стендами для frontend разработки
- **Бэкенд стенды**: Секция с 7 стендами для backend разработки

### 3. Работа со стендами

- Займите стенд в нужной группе
- Статистика обновится только для этой группы
- Освободите стенд когда закончите работу

## 🎊 Итог

✅ **Разделение реализовано полностью**  
✅ **7 frontend + 7 backend стендов**  
✅ **Независимое управление группами**  
✅ **Корректное отображение на фронтенде**  
✅ **Все функции протестированы**

**Теперь каждая команда может работать со своими стендами независимо!** 🚀

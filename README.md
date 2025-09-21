# Микрофронтенд Банковская Система

Полнофункциональная микрофронтенд архитектура с Vue 3 и Module Federation для банковских услуг.

## Архитектура

- **Host App** (порт 3000) - Главное приложение-оболочка
- **First App** (порт 3001) - Микрофронтенд для управления золотом  
- **Second App** (порт 3002) - Микрофронтенд для управления депозитами

## Технологический стек

- **Vue 3** - Frontend фреймворк
- **Vite** - Быстрый инструмент сборки с поддержкой Module Federation
- **Vue Router** - Навигация между микрофронтендами
- **@originjs/vite-plugin-federation** - Плагин для динамической загрузки микрофронтендов
- **Pinia** - Управление состоянием
- **TypeScript** - Типизация

## Быстрый старт

### 1. Установка зависимостей

```bash
# Установка зависимостей для всех приложений
pnpm install

# Установка в каждом приложении отдельно
cd hostapp && pnpm install
cd ../firstapp && pnpm install  
cd ../secondapp && pnpm install
```

### 2. Запуск в режиме разработки

```bash
# Запуск всех приложений одновременно
npm run dev

# Или запуск каждого приложения отдельно:
npm run dev:host    # Host App на порту 3000
npm run dev:first   # First App на порту 3001  
npm run dev:second  # Second App на порту 3002
```

### 3. Доступ к приложениям

- **Главное приложение**: http://localhost:3000
- **Gold микрофронтенд**: http://localhost:3001
- **Deposit микрофронтенд**: http://localhost:3002

## Структура проекта

```
micro-frontend/
├── package.json              # Корневой package.json для управления системой
├── hostapp/                  # Главное приложение
│   ├── src/
│   │   ├── types/
│   │   │   └── remote-components.d.ts  # Типы для удаленных компонентов
│   │   ├── views/
│   │   │   └── HomePage.vue            # Главная страница с навигацией
│   │   └── router/
│   │       └── index.ts                # Роутер с динамическими импортами
│   └── vite.config.ts        # Конфигурация Module Federation (Consumer)
├── firstapp/                 # Микрофронтенд Gold
│   ├── src/
│   │   └── views/
│   │       ├── GoldPage.vue            # Страница управления золотом
│   │       └── GoldTransferPage.vue    # Страница трансферов золота
│   └── vite.config.ts        # Конфигурация Module Federation (Producer)
└── secondapp/                # Микрофронтенд Deposit
    ├── src/
    │   └── views/
    │       ├── DepositPage.vue         # Страница управления депозитами
    │       └── DepositTransferPage.vue # Страница трансферов депозитов
    └── vite.config.ts        # Конфигурация Module Federation (Producer)
```

## Функциональность

### Host App
- Главная страница с навигацией к микрофронтендам
- Динамическая загрузка удаленных компонентов
- Единый роутинг для всех микрофронтендов

### Gold Микрофронтенд (First App)
- `/gold` - Просмотр портфеля золота и текущих цен
- `/gold/transfer` - Трансфер золота между счетами

### Deposit Микрофронтенд (Second App)  
- `/deposit` - Управление депозитными счетами
- `/deposit/transfer` - Трансфер средств между депозитами

## Команды сборки

```bash
# Сборка всех приложений
npm run build

# Сборка отдельных приложений
npm run build:host
npm run build:first  
npm run build:second

# Очистка всех dist папок
npm run clean
```

## Module Federation конфигурация

### Host App (Consumer)
```javascript
federation({
  name: 'host-app',
  remotes: {
    firstApp: 'http://localhost:3001/assets/remoteEntry.js',
    secondApp: 'http://localhost:3002/assets/remoteEntry.js'
  },
  shared: ['vue', 'vue-router', 'pinia']
})
```

### Микрофронтенды (Producers)
```javascript
federation({
  name: 'first-app', // или 'second-app'
  filename: 'remoteEntry.js',
  exposes: {
    './GoldPage': './src/views/GoldPage.vue',
    './GoldTransferPage': './src/views/GoldTransferPage.vue'
  },
  shared: ['vue', 'vue-router', 'pinia']
})
```

## Особенности реализации

1. **Shared Dependencies** - Vue, Vue Router и Pinia используются совместно для оптимизации размера бундла
2. **TypeScript Support** - Полная поддержка TypeScript с типами для удаленных компонентов
3. **CORS Headers** - Правильно настроены для работы между разными портами
4. **Error Handling** - Graceful fallbacks при недоступности микрофронтендов
5. **Development & Production** - Конфигурации оптимизированы для обеих сред

## Развертывание

Для продакшена нужно:
1. Собрать все приложения: `npm run build`
2. Развернуть каждое приложение на своем домене/поддомене
3. Обновить URL в конфигурации remotes в host app
4. Настроить CORS на серверах

Микрофронтенд система готова к использованию! 🚀

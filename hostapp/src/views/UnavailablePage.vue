<template>
  <div class="unavailable-page">
    <div class="error-container">
      <div class="error-icon">
        <svg viewBox="0 0 24 24" width="64" height="64" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      </div>
      <h2>Сервис временно недоступен</h2>
      <p>Мы работаем над исправлением проблемы. Попробуйте позже.</p>
      <router-link to="/" class="back-button">
        Вернуться на главную
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
// Пустой скрипт, так как логика не требуется
</script>

<style scoped>
.unavailable-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 2rem;
}

.error-container {
  text-align: center;
  max-width: 400px;
}

.error-icon {
  color: #f39c12;
  margin-bottom: 1rem;
}

h2 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

p {
  color: #7f8c8d;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.back-button {
  display: inline-block;
  background: #3498db;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  transition: background 0.2s;
}

.back-button:hover {
  background: #2980b9;
}
</style>

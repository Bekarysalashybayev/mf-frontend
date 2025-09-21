<template>
  <div class="home-page">
    <header class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">Добро пожаловать в Banking Hub</h1>
        <p class="hero-subtitle">Управляйте своими финансами с удобством и безопасностью</p>
      </div>
    </header>

    <div class="services-grid">
      <div class="service-card" @click="navigateTo('/deposit')">
        <div class="service-icon deposit-icon">💰</div>
        <h3>Депозиты</h3>
        <p>Управляйте вашими депозитными счетами и получайте проценты</p>
        <div class="service-stats">
          <span class="stat">До 4.2% годовых</span>
        </div>
        <button class="service-btn">Перейти к депозитам</button>
      </div>

      <div class="service-card" @click="navigateTo('/gold')">
        <div class="service-icon gold-icon">🥇</div>
        <h3>Золото</h3>
        <p>Инвестируйте в драгоценные металлы и диверсифицируйте портфель</p>
        <div class="service-stats">
          <span class="stat">$2,016.12 за унцию</span>
        </div>
        <button class="service-btn">Перейти к золоту</button>
      </div>
    </div>

    <div class="quick-stats">
      <div class="stat-card">
        <h4>Общий баланс</h4>
        <p class="stat-value">$206,250</p>
        <span class="stat-change positive">+2.3% за месяц</span>
      </div>
      <div class="stat-card">
        <h4>Активные продукты</h4>
        <p class="stat-value">3</p>
        <span class="stat-description">Депозиты и инвестиции</span>
      </div>
      <div class="stat-card">
        <h4>Доходность</h4>
        <p class="stat-value">3.8%</p>
        <span class="stat-description">Средняя за год</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<style scoped>
.home-page {
  max-width: 1200px;
  margin: 0 auto;
}

.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 60px 40px;
  margin-bottom: 40px;
  color: white;
  text-align: center;
}

.hero-title {
  font-size: 3rem;
  margin: 0 0 16px 0;
  font-weight: 700;
}

.hero-subtitle {
  font-size: 1.2rem;
  margin: 0;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
}

.service-card {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.service-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
  border-color: #667eea;
}

.service-icon {
  font-size: 3rem;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

.service-card h3 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin: 0 0 12px 0;
  text-align: center;
}

.service-card p {
  color: #7f8c8d;
  line-height: 1.6;
  margin: 0 0 20px 0;
  text-align: center;
}

.service-stats {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 20px;
  text-align: center;
}

.stat {
  font-weight: 600;
  color: #27ae60;
  font-size: 0.95rem;
}

.service-btn {
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 14px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.service-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-card h4 {
  color: #7f8c8d;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 10px 0;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.stat-change {
  font-size: 0.9rem;
  padding: 4px 8px;
  border-radius: 4px;
}

.stat-change.positive {
  background-color: #d5edda;
  color: #155724;
}

.stat-description {
  font-size: 0.9rem;
  color: #6c757d;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-section {
    padding: 40px 20px;
  }

  .services-grid {
    grid-template-columns: 1fr;
  }
}
</style>

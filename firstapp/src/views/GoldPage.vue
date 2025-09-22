<template>
  <div class="gold-page">
    <button class="back-btn" @click="goBack">← Назад</button>
    <header class="page-header">
      <h1 class="page-title">Gold Banking</h1>
      <p class="page-subtitle">Manage your gold investments</p>
    </header>

    <div class="content-grid">
      <div class="card">
        <h3>Gold Portfolio</h3>
        <p>Current holdings: <strong>15.5 oz</strong></p>
        <p>Market value: <strong>$31,250</strong></p>
      </div>

      <div class="card">
        <h3>Market Price</h3>
        <p class="price">$2,016.12 <span class="change positive">+1.2%</span></p>
        <p class="last-updated">Last updated: 2 minutes ago</p>
      </div>

      <div class="card">
        <h3>Quick Actions</h3>
        <div class="actions">
          <button class="btn btn-primary">Buy Gold</button>
          <button class="btn btn-secondary">Sell Gold</button>
          <router-link class="btn btn-transfer" to="/bank/gold/transfer">Transfer Gold</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.push('/')
}
</script>

<style scoped>
.back-btn {
  margin-bottom: 20px;
  padding: 8px 16px;
  background: none;
  border: 1px solid #f39c12;
  color: #f39c12;
  font-size: 1rem;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.back-btn:hover {
  background-color: #f39c12;
  color: white;
}

.gold-page {
  max-width: 1200px;
}

.page-header {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f39c12;
}

.page-title {
  font-size: 2.5rem;
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.page-subtitle {
  color: #7f8c8d;
  margin: 0;
  font-size: 1.1rem;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #f39c12;
}

.card h3 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 1.3rem;
}

.price {
  font-size: 1.8rem;
  font-weight: bold;
  color: #2c3e50;
  margin: 10px 0;
}

.change {
  font-size: 0.9rem;
  padding: 4px 8px;
  border-radius: 4px;
}

.change.positive {
  background-color: #d5edda;
  color: #155724;
}

.last-updated {
  font-size: 0.9rem;
  color: #6c757d;
  margin: 0;
}

.actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-primary:hover {
  background-color: #2980b9;
}

.btn-secondary {
  background-color: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background-color: #7f8c8d;
}

.btn-transfer {
  background-color: #f39c12;
  color: white;
}

.btn-transfer:hover {
  background-color: #e67e22;
}
</style>

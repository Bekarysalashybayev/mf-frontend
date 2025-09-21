<template>
  <div class="deposit-page">
    <button class="back-btn" @click="goBack">← Назад</button>
    <header class="page-header">
      <h1 class="page-title">Bank Deposits</h1>
      <p class="page-subtitle">Manage your deposit accounts</p>
    </header>

    <div class="content-grid">
      <div class="card">
        <h3>Active Deposits</h3>
        <div class="deposit-item">
          <div class="deposit-info">
            <p class="deposit-name">High Yield Savings</p>
            <p class="deposit-amount">$125,000</p>
          </div>
          <div class="deposit-rate">3.5% APY</div>
        </div>
        <div class="deposit-item">
          <div class="deposit-info">
            <p class="deposit-name">Term Deposit 12M</p>
            <p class="deposit-amount">$50,000</p>
          </div>
          <div class="deposit-rate">4.2% APY</div>
        </div>
      </div>

      <div class="card">
        <h3>Monthly Interest</h3>
        <p class="interest-amount">$487.50</p>
        <p class="interest-desc">Earned this month</p>
        <div class="interest-chart">
          <div class="chart-bar" style="height: 60%"></div>
          <div class="chart-bar" style="height: 80%"></div>
          <div class="chart-bar" style="height: 100%"></div>
          <div class="chart-bar" style="height: 75%"></div>
        </div>
      </div>

      <div class="card">
        <h3>New Deposit</h3>
        <p>Start earning with our competitive rates</p>
        <div class="actions">
          <button class="btn btn-primary">Open Deposit</button>
          <button class="btn btn-secondary">View Rates</button>
          <router-link class="btn btn-transfer" to="/deposit/transfer">Transfer Funds</router-link>
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
  border: 1px solid #27ae60;
  color: #27ae60;
  font-size: 1rem;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.back-btn:hover {
  background-color: #27ae60;
  color: white;
}

.deposit-page {
  max-width: 1200px;
}

.page-header {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #27ae60;
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
  border-left: 4px solid #27ae60;
}

.card h3 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 1.3rem;
}

.deposit-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #ecf0f1;
}

.deposit-item:last-child {
  border-bottom: none;
}

.deposit-name {
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 5px 0;
}

.deposit-amount {
  font-size: 1.2rem;
  font-weight: bold;
  color: #27ae60;
  margin: 0;
}

.deposit-rate {
  background: #d5edda;
  color: #155724;
  padding: 8px 12px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
}

.interest-amount {
  font-size: 2rem;
  font-weight: bold;
  color: #27ae60;
  margin: 10px 0 5px 0;
}

.interest-desc {
  color: #7f8c8d;
  margin: 0 0 20px 0;
}

.interest-chart {
  display: flex;
  align-items: end;
  gap: 8px;
  height: 60px;
}

.chart-bar {
  background: linear-gradient(to top, #27ae60, #2ecc71);
  width: 20px;
  border-radius: 2px;
  min-height: 20px;
}

.actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  text-decoration: none;
  text-align: center;
  flex: 1;
  min-width: 120px;
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
  background-color: #27ae60;
  color: white;
}

.btn-transfer:hover {
  background-color: #219a52;
}

@media (max-width: 768px) {
  .actions {
    flex-direction: column;
  }

  .btn {
    flex: none;
  }
}
</style>

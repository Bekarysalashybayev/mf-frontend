<template>
  <div class="gold-transfer-page">
    <button class="back-btn" @click="goBack">← Назад</button>

    <header class="page-header">
      <h1 class="page-title">Gold Transfer</h1>
      <p class="page-subtitle">Transfer gold between accounts</p>
    </header>

    <div class="transfer-container">
      <div class="transfer-card">
        <h3>Transfer Gold</h3>

        <div class="form-section">
          <label class="form-label">From Account</label>
          <select class="form-input" v-model="fromAccount">
            <option value="main">Main Gold Account (15.5 oz)</option>
            <option value="savings">Gold Savings (8.2 oz)</option>
          </select>
        </div>

        <div class="form-section">
          <label class="form-label">To Account</label>
          <input type="text" class="form-input" v-model="toAccount" placeholder="Enter recipient account">
        </div>

        <div class="form-section">
          <label class="form-label">Amount (oz)</label>
          <input type="number" class="form-input" v-model="amount" placeholder="0.00" step="0.01" min="0">
        </div>

        <div class="current-price">
          <p>Current Gold Price: <strong>$2,016.12/oz</strong></p>
          <p v-if="amount">Transfer Value: <strong>${{ (parseFloat(amount) * 2016.12).toFixed(2) }}</strong></p>
        </div>

        <div class="form-actions">
          <button class="btn btn-primary" @click="transfer" :disabled="!canTransfer">
            Transfer Gold
          </button>
          <button class="btn btn-secondary" @click="reset">
            Reset
          </button>
        </div>
      </div>

      <div class="transfer-info">
        <h3>Transfer Information</h3>
        <ul class="info-list">
          <li>✅ Instant transfers between your accounts</li>
          <li>✅ No transfer fees for internal transfers</li>
          <li>✅ Real-time balance updates</li>
          <li>⚠️ External transfers may take 1-2 business days</li>
          <li>⚠️ Minimum transfer amount: 0.01 oz</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const fromAccount = ref('main')
const toAccount = ref('')
const amount = ref('')

const canTransfer = computed(() => {
  return fromAccount.value && toAccount.value && amount.value && parseFloat(amount.value) > 0
})

function goBack() {
  history.back()
}

function transfer() {
  if (canTransfer.value) {
    alert(`Transfer of ${amount.value} oz gold from ${fromAccount.value} to ${toAccount.value} initiated!`)
    reset()
  }
}

function reset() {
  toAccount.value = ''
  amount.value = ''
}
</script>

<style scoped>
.gold-transfer-page {
  max-width: 1000px;
}

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

.transfer-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
}

.transfer-card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #f39c12;
}

.transfer-card h3 {
  margin: 0 0 25px 0;
  color: #2c3e50;
  font-size: 1.4rem;
}

.form-section {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  color: #2c3e50;
  font-weight: 600;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #ecf0f1;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #f39c12;
}

.current-price {
  background: #fff3cd;
  border: 1px solid #f39c12;
  border-radius: 8px;
  padding: 15px;
  margin: 20px 0;
}

.current-price p {
  margin: 5px 0;
  color: #856404;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 25px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  flex: 1;
}

.btn-primary {
  background-color: #f39c12;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #e67e22;
}

.btn-primary:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background-color: #7f8c8d;
}

.transfer-info {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  height: fit-content;
}

.transfer-info h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 1.3rem;
}

.info-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.info-list li {
  padding: 10px 0;
  border-bottom: 1px solid #ecf0f1;
  color: #2c3e50;
  line-height: 1.4;
}

.info-list li:last-child {
  border-bottom: none;
}

@media (max-width: 768px) {
  .transfer-container {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>

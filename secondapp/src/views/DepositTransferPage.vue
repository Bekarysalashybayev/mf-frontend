<template>
  <div class="deposit-transfer-page">
    <button class="back-btn" @click="goBack">← Назад</button>

    <header class="page-header">
      <h1 class="page-title">Deposit Transfer</h1>
      <p class="page-subtitle">Transfer funds between deposit accounts</p>
    </header>

    <div class="transfer-container">
      <div class="transfer-card">
        <h3>Transfer Funds</h3>

        <div class="form-section">
          <label class="form-label">From Account</label>
          <select class="form-input" v-model="fromAccount">
            <option value="savings">High Yield Savings ($125,000)</option>
            <option value="term">Term Deposit 12M ($50,000)</option>
            <option value="checking">Checking Account ($15,000)</option>
          </select>
        </div>

        <div class="form-section">
          <label class="form-label">To Account</label>
          <input type="text" class="form-input" v-model="toAccount" placeholder="Enter recipient account or IBAN">
        </div>

        <div class="form-section">
          <label class="form-label">Amount ($)</label>
          <input type="number" class="form-input" v-model="amount" placeholder="0.00" step="0.01" min="0">
        </div>

        <div class="form-section">
          <label class="form-label">Transfer Type</label>
          <select class="form-input" v-model="transferType">
            <option value="internal">Internal Transfer (Free)</option>
            <option value="domestic">Domestic Transfer ($5 fee)</option>
            <option value="international">International Transfer ($25 fee)</option>
          </select>
        </div>

        <div class="transfer-summary" v-if="amount && transferType">
          <h4>Transfer Summary</h4>
          <div class="summary-row">
            <span>Amount:</span>
            <span>${{ parseFloat(amount).toFixed(2) }}</span>
          </div>
          <div class="summary-row">
            <span>Fee:</span>
            <span>${{ getFee() }}</span>
          </div>
          <div class="summary-row total">
            <span>Total:</span>
            <span>${{ (parseFloat(amount) + getFee()).toFixed(2) }}</span>
          </div>
        </div>

        <div class="form-actions">
          <button class="btn btn-primary" @click="transfer" :disabled="!canTransfer">
            Transfer Funds
          </button>
          <button class="btn btn-secondary" @click="reset">
            Reset
          </button>
        </div>
      </div>

      <div class="transfer-info">
        <h3>Transfer Information</h3>
        <ul class="info-list">
          <li>✅ Internal transfers are instant and free</li>
          <li>✅ Domestic transfers processed same day</li>
          <li>✅ International transfers within 1-3 business days</li>
          <li>⚠️ Daily transfer limit: $50,000</li>
          <li>⚠️ Minimum transfer amount: $1.00</li>
          <li>🔒 All transfers are secured with encryption</li>
        </ul>

        <div class="rate-info">
          <h4>Current Rates</h4>
          <p>High Yield Savings: <strong>3.5% APY</strong></p>
          <p>Term Deposit 12M: <strong>4.2% APY</strong></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const fromAccount = ref('savings')
const toAccount = ref('')
const amount = ref('')
const transferType = ref('internal')

const canTransfer = computed(() => {
  return fromAccount.value && toAccount.value && amount.value && parseFloat(amount.value) > 0
})

function goBack() {
  history.back()
}

function getFee(): number {
  switch (transferType.value) {
    case 'internal': return 0
    case 'domestic': return 5
    case 'international': return 25
    default: return 0
  }
}

function transfer() {
  if (canTransfer.value) {
    const totalAmount = parseFloat(amount.value) + getFee()
    alert(`Transfer of $${amount.value} from ${fromAccount.value} to ${toAccount.value} initiated!\nTotal cost: $${totalAmount.toFixed(2)}`)
    reset()
  }
}

function reset() {
  toAccount.value = ''
  amount.value = ''
  transferType.value = 'internal'
}
</script>

<style scoped>
.deposit-transfer-page {
  max-width: 1000px;
}

.back-btn {
  margin-bottom: 20px;
  padding: 8px 16px;
  background: none;
  border: 1px solid #3498db;
  color: #3498db;
  font-size: 1rem;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.back-btn:hover {
  background-color: #3498db;
  color: white;
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
  border-left: 4px solid #27ae60;
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
  border-color: #27ae60;
}

.transfer-summary {
  background: #e8f5e8;
  border: 1px solid #27ae60;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
}

.transfer-summary h4 {
  margin: 0 0 15px 0;
  color: #27ae60;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  color: #2c3e50;
}

.summary-row.total {
  font-weight: bold;
  padding-top: 8px;
  border-top: 1px solid #27ae60;
  font-size: 1.1rem;
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
  background-color: #27ae60;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #229954;
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
  margin: 0 0 25px 0;
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

.rate-info {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border-left: 3px solid #27ae60;
}

.rate-info h4 {
  margin: 0 0 10px 0;
  color: #2c3e50;
}

.rate-info p {
  margin: 5px 0;
  color: #2c3e50;
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

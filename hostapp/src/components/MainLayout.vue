<template>
  <div class="layout">
    <aside class="sidebar">
      <nav class="nav">
        <div class="nav-header">
          <h3 class="nav-title">Bank Menu</h3>
          <button class="back-btn" type="button" @click="onBackClick">← Назад</button>
        </div>
        <ul class="nav-list">
          <li class="nav-item">
            <router-link to="/bank/dashboard" class="nav-link">🏠 Главная</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/bank/gold"  class="nav-link">🥇 Gold</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/bank/deposit" class="nav-link">💰 Deposit</router-link>
          </li>
        </ul>
      </nav>
    </aside>
    <main class="content">
     <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function navigateTo(path: string) {
  router.push({ name: 'MF', params: { mfId: decodeURI(path) } });
}

function onBackClick() {
  if (window.mfChildHistoryBack) {
    window.mfChildHistoryBack()
  } else {
    history.back()
  }
}
</script>

<style scoped lang="scss">
.layout {
  --sidebar-width: 250px;
  display: flex;
  min-height: 100vh;
  padding-left: var(--sidebar-width);
  position: relative;

  .sidebar {
    width: var(--sidebar-width);
    background-color: #2c3e50;
    color: white;
    padding: 20px;
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    overflow-y: auto;
  }

  .nav-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 12px;
  }

  .back-btn {
    background: #34495e;
    border: 0;
    color: #ecf0f1;
    padding: 6px 10px;
    font-size: 12px;
    border-radius: 4px;
    cursor: pointer;
    transition: background .2s;
  }
  .back-btn:hover { background:#3d566e; }

  .nav-title {
    margin: 0;
    font-size: 1.2rem;
    font-weight: bold;
    color: #ecf0f1;
  }

  .nav-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .nav-item { margin-bottom: 8px; }

  .nav-link {
    display: block;
    color: #bdc3c7;
    text-decoration: none;
    padding: 12px 15px;
    border-radius: 6px;
    transition: all 0.3s ease;
  }
  .nav-link:hover {
    background-color: #34495e;
    color: #fff;
    transform: translateX(5px);
  }
  .nav-link.router-link-active {
    background-color: #3498db;
    color: white;
  }

  .content {
    flex: 1;
    padding: 30px;
    background-color: #f8f9fa;
  }
}
</style>

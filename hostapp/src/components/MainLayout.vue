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
            <router-link to="/bank/dashboard/scroll-sync" class="nav-link">🧪 Scroll Sync Demo</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/bank/gold"  class="nav-link">🥇 Gold</router-link>
          </li>
            <li class="nav-item">
            <router-link to="/bank/deposit" class="nav-link">💰 Deposit</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/bank/credit" class="nav-link">💰 Credit</router-link>
          </li>
        </ul>
      </nav>
    </aside>

    <div class="main-column">
      <header class="topbar">
        <div class="topbar-left">
          <h1 class="app-title">Bank Portal</h1>
        </div>
        <div class="topbar-right">
          <slot name="header-extra" />
        </div>
      </header>

      <main class="content">
        <slot />
      </main>

      <footer class="footer">
        <div class="footer-inner">
          <span>© {{ currentYear }} Bank Corp (Demo)</span>
          <span class="sep">•</span>
          <span>Microfrontend PoC</span>
          <slot name="footer-extra" />
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
const currentYear = new Date().getFullYear()

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
  --topbar-height: 56px;
  display: flex;
  min-height: 100vh;
  padding-left: var(--sidebar-width);
  position: relative;
  background: #f0f3f6;

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

  .main-column {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    position: relative;
  }

  .topbar {
    position: fixed;
    left: var(--sidebar-width);
    right: 0;
    top: 0;
    height: var(--topbar-height);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    background: #ffffffd9;
    backdrop-filter: blur(4px);
    border-bottom: 1px solid #e2e6ea;
    z-index: 10;
  }
  .app-title { margin: 0; font-size: 18px; font-weight: 600; color: #2c3e50; }

  .content {
    flex: 1;
    padding: calc(var(--topbar-height) + 20px) 30px 40px 30px; // верхний отступ под фиксированный header
    background-color: #f8f9fa;
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: visible; // даём возможность auto-height контейнеру расширяться
  }

  .footer {
    margin-top: auto;
    background: #fff;
    border-top: 1px solid #e2e6ea;
    padding: 12px 24px;
    font-size: 12px;
    color: #55626f;
  }
  .footer-inner { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .footer .sep { opacity: .4; }

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
    font-size: 14px;
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
}
</style>

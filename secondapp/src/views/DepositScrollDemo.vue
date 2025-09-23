<template>
  <div class="scroll-demo">
    <button class="back-btn" @click="goBack">← Назад</button>
    <h1>Deposit Scroll Demo</h1>
    <p class="lead">
      Длинная лениво загруженная страница для проверки auto-height и синхронизации скролла.
      Секции добавляются постепенно (эмулирует асинхронные догрузки данных).
    </p>

    <div class="blocks">
      <section v-for="b in blocks" :key="b.id" class="block">
        <h3>Секция #{{ b.id }}</h3>
        <p>
          {{ b.text }}
        </p>
      </section>
    </div>

    <div v-if="pending" class="loader">Подгружаем дополнительные данные…</div>

    <p class="end" v-if="!pending && blocks.length >= targetCount">Конец контента ({{ blocks.length }} секций).</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Block { id: number; text: string }

const blocks = ref<Block[]>([])
const pending = ref(false)
const targetCount = 45 // итоговое число секций

function goBack() { history.back() }

function addBatch(batchSize = 5) {
  const start = blocks.value.length + 1
  const end = Math.min(start + batchSize - 1, targetCount)
  for (let i = start; i <= end; i++) {
    blocks.value.push({
      id: i,
      text: 'Демонстрационный текст для секции #' + i + '. '.repeat(6) + ' Контент увеличивает высоту страницы.'
    })
  }
}

function scheduleLazy() {
  if (blocks.value.length >= targetCount) {
    pending.value = false
    return
  }
  pending.value = true
  setTimeout(() => {
    addBatch(5)
    pending.value = false
    scheduleLazy()
  }, 400)
}

onMounted(() => {
  addBatch(10)
  scheduleLazy()
})
</script>

<style scoped>
.scroll-demo {
  max-width: 900px;
  margin: 0 auto 120px;
  line-height: 1.5;
  padding-bottom: 40px;
}
.lead { opacity: .85; }
.back-btn {
  margin: 12px 0 24px;
  padding: 8px 16px;
  background: none;
  border: 1px solid #3498db;
  color: #3498db;
  font-size: 0.95rem;
  cursor: pointer;
  border-radius: 4px;
  transition: all .2s;
}
.back-btn:hover { background:#3498db; color:#fff; }
.blocks { display:flex; flex-direction:column; gap:20px; }
.block {
  background: linear-gradient(135deg,#4facfe,#00f2fe);
  color:#fff;
  padding:28px 24px 22px;
  border-radius:16px;
  box-shadow:0 6px 18px rgba(0,0,0,.16);
}
.block h3 { margin:0 0 10px; }
.loader {
  margin: 40px 0;
  text-align: center;
  color: #3498db;
  animation: pulse 1.2s infinite;
  font-weight: 500;
}
@keyframes pulse { 0%,100%{ opacity:.35 } 50%{ opacity:1 } }
.end { margin:60px 0 0; font-weight:600; text-align:center; }
</style>

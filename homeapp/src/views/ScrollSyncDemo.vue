<template>
  <div class="scroll-demo">
    <h1>Демонстрация синхронизации скролла</h1>
    <p>
      Эта страница создана для проверки синхронизации прокрутки между хостом и микрофронтендом.
      Прокрутите вниз здесь внутри iframe — окно хоста должно прокручиваться синхронно. И наоборот.
    </p>
    <div class="blocks">
      <section v-for="n in 30" :key="n" class="block">Блок #{{ n }}</section>
    </div>
    <p class="footer">Конец контента — если синхронизация работает, положение будет совпадать на хосте.</p>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.scroll-demo {
  max-width: 760px;
  margin: 0 auto;
  line-height: 1.5;
}
.blocks {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 32px 0;
}
.block {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  padding: 32px 24px;
  color: #fff;
  font-size: 20px;
  font-weight: 600;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,.15);
  min-height: 160px;
}
.footer { margin: 80px 0 120px; font-weight: 500; }
</style>


<script setup lang="ts">
interface List {
  // Level1Label: string;
  // KeyWord: string;
  // KeyWord2: string;
  // SecondLabel: string;
  promptZH: string;
  promptEN: string;
  imgName?: string;
}

defineProps<{
  data: List[];
}>();
</script>
<template>
  <div class="card" mt-2 v-for="item in data">
    <div class="card-img">
      <img :src="item.imgName" />
    </div>
    <div class="card-name" p-2>{{ item.promptZH }}</div>
    <div class="card-enname" p-2>{{ item.promptEN }}</div>
  </div>
</template>
<style scoped lang="scss">
.card {
  width: 9.38rem;
  background-color: #26292e;
  color: #fff;

  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex-shrink: 0;
  word-wrap: break-word;
  background-clip: border-box; // 使background覆盖border
  border-radius: 0.25rem;
  cursor: pointer;

  &:hover {
    background-color: #1a1c1f;
  }

  img {
    width: 100%;
    border-top-left-radius: calc(0.25rem - 1px);
    border-top-right-radius: calc(0.25rem - 1px);
  }
}
</style>

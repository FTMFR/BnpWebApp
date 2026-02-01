<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import DashboardLayout from '@/design-system/templates/DashboardLayout.vue'

const route = useRoute()

const title = computed(() => (route.meta?.title as string) ?? 'به زودی')
</script>

<template>
  <DashboardLayout>
    <div class="flex flex-col items-center justify-center min-h-[40vh] p-6 text-center">
      <h1 class="text-2xl font-bold text-foreground mb-2">{{ title }}</h1>
      <p class="text-muted-foreground">این بخش به زودی در دسترس خواهد بود.</p>
    </div>
  </DashboardLayout>
</template>

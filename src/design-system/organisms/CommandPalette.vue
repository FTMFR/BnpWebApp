<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  keywords?: string[];
  action: () => void;
}

export interface CommandPaletteProps {
  modelValue: boolean;
  items: CommandItem[];
  placeholder?: string;
}

const props = withDefaults(defineProps<CommandPaletteProps>(), {
  placeholder: 'جستجو سریع...',
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  select: [item: CommandItem];
}>();

const searchQuery = ref('');
const selectedIndex = ref(0);

const filteredItems = computed(() => {
  if (!searchQuery.value.trim()) {
    return props.items;
  }
  
  const query = searchQuery.value.toLowerCase();
  return props.items.filter((item) => {
    const matchesLabel = item.label.toLowerCase().includes(query);
    const matchesDescription = item.description?.toLowerCase().includes(query);
    const matchesKeywords = item.keywords?.some((keyword) =>
      keyword.toLowerCase().includes(query)
    );
    
    return matchesLabel || matchesDescription || matchesKeywords;
  });
});

const close = () => {
  emit('update:modelValue', false);
  searchQuery.value = '';
  selectedIndex.value = 0;
};

const handleSelect = (item: CommandItem) => {
  item.action();
  emit('select', item);
  close();
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (!props.modelValue) return;
  
  if (event.key === 'Escape') {
    close();
  } else if (event.key === 'Enter' && filteredItems.value[selectedIndex.value]) {
    handleSelect(filteredItems.value[selectedIndex.value]);
  } else if (event.key === 'ArrowDown') {
    event.preventDefault();
    selectedIndex.value = Math.min(
      selectedIndex.value + 1,
      filteredItems.value.length - 1
    );
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    selectedIndex.value = Math.max(selectedIndex.value - 1, 0);
  }
};

watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    searchQuery.value = '';
    selectedIndex.value = 0;
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

watch(searchQuery, () => {
  selectedIndex.value = 0;
});

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
  document.body.style.overflow = '';
});
</script>

<template>
  <Teleport to="body">
    <Transition name="command-palette">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-modal flex items-start justify-center pt-[20vh] px-4"
        @click.self="close"
      >
        <div
          class="bg-card-background rounded-xl shadow-2xl w-full max-w-2xl border border-border-default overflow-hidden"
          @click.stop
        >
          <!-- Search Input -->
          <div class="flex items-center gap-3 px-4 py-3 border-b border-border-default">
            <svg
              class="size-5 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="placeholder"
              class="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
              autofocus
            />
            <kbd class="px-2 py-1 text-xs bg-secondary border border-border-default rounded">Esc</kbd>
          </div>
          
          <!-- Results -->
          <div class="max-h-96 overflow-y-auto">
            <div v-if="filteredItems.length === 0" class="px-4 py-8 text-center text-muted-foreground">
              نتیجه‌ای یافت نشد
            </div>
            <button
              v-for="(item, index) in filteredItems"
              :key="item.id"
              :class="[
                'w-full text-right px-4 py-3 flex items-center gap-3 transition-colors',
                index === selectedIndex
                  ? 'bg-primary-50 text-primary-700'
                  : 'hover:bg-secondary text-foreground',
              ]"
              @click="handleSelect(item)"
            >
              <span v-if="item.icon" class="size-5 shrink-0">{{ item.icon }}</span>
              <div class="flex-1">
                <div class="font-medium">{{ item.label }}</div>
                <div v-if="item.description" class="text-sm text-muted-foreground">
                  {{ item.description }}
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.command-palette-enter-active,
.command-palette-leave-active {
  transition: opacity 0.2s ease;
}

.command-palette-enter-active .bg-card-background,
.command-palette-leave-active .bg-card-background {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.command-palette-enter-from,
.command-palette-leave-to {
  opacity: 0;
}

.command-palette-enter-from .bg-card-background,
.command-palette-leave-to .bg-card-background {
  transform: scale(0.95) translateY(-20px);
  opacity: 0;
}
</style>


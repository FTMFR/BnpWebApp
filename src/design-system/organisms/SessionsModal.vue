<script setup lang="ts">
import { useRoute } from 'vue-router'
import type { MySessionsResponse, Session } from '@/shared/api/types'
import BaseButton from '../atoms/BaseButton.vue'
import { getDeviceInfo } from '@/shared/utils/deviceInfo'
import { nextTick } from 'vue'

interface Props {
  modelValue: boolean
  sessions?: Session[]
  sessionsInfo?: MySessionsResponse
  revokingSessionId?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  revokingSessionId: null,
})

const route = useRoute()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
  continue: []
  'revoke-session': [sessionPublicId: string]
}>()

const handleRevokeSession = (sessionPublicId: string) => {
  emit('revoke-session', sessionPublicId)
}

const handleContinue = async () => {
  if (props.sessionsInfo?.isMaxSessionsReached) {
    return
  }
  emit('continue')
  emit('update:modelValue', false)
  emit('close')
  await nextTick()
  if (route.path === '/login') {
    window.location.replace('/dashboard')
  }
}

const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
}
</script>

<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-5"
  >
    <div
      class="bg-white dark:bg-black rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden p-3"
    >
      <Modal
        :model-value="modelValue"
        title="جلسات فعال"
        size="lg"
        :close-on-backdrop="false"
        :close-on-escape="false"
        @update:model-value="$emit('update:modelValue', $event)"
        @close="$emit('close')"
      >
        <div class="px-6 mb-2 py-4 border-b border-border-default">
          <h3 class="text-lg font-semibold text-foreground">جلسات فعال</h3>
        </div>
        <div class="space-y-4">
          <div v-if="props.sessions" class="space-y-3 max-h-[60vh] overflow-y-auto">
            <div
              v-for="session in sessions"
              :key="session.PublicId"
              class="bg-card-background border border-border-default rounded-lg p-4 hover:border-primary-500/50 transition-colors"
            >
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1 space-y-2">
                  <div class="flex items-center gap-2">
                    <BaseBadge v-if="session.IsCurrentSession" variant="success" size="sm">
                      سشن فعلی
                    </BaseBadge>
                  </div>

                  <div class="text-xs text-muted-foreground space-y-1">
                    <p class="flex items-center gap-2">
                      <span class="font-medium"> جزئیات نشست </span>
                      <span>
                        {{ getDeviceInfo(session.UserAgent) }}
                      </span>
                    </p>
                    <p class="flex items-center gap-2">
                      <span class="font-medium"> جزئیات نشست </span>
                      <span>
                        {{ session.CreatedAt }}
                      </span>
                    </p>
                  </div>
                </div>

                <BaseButton
                  v-if="!session.IsCurrentSession"
                  variant="danger"
                  size="sm"
                  type="button"
                  :loading="revokingSessionId === session.PublicId"
                  @click="handleRevokeSession(session.PublicId)"
                >
                  پایان سشن
                </BaseButton>
              </div>
            </div>
          </div>

          <div
            v-if="sessionsInfo"
            class="mt-4 pt-4 border-t border-border-default text-xs text-muted-foreground text-center"
          >
            <p>
              تعداد جلسات فعال: {{ sessionsInfo.totalCount }} از
              {{ sessionsInfo.maxConcurrentSessions }}
            </p>
          </div>
        </div>

        <div class="flex items-center justify-between mt-2 gap-2">
          <BaseButton @click="handleContinue" variant="primary" class="text-white hover:shadow-xl">
            ادامه
          </BaseButton>
          <BaseButton @click="handleClose" variant="secondary" class="text-white hover:text-black">
            بستن
          </BaseButton>
        </div>
      </Modal>
    </div>
  </div>
</template>

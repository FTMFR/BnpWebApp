<script setup lang="ts">
import { ref } from 'vue'
import BaseIcon from '../atoms/BaseIcon.vue'
import BaseButton from '../atoms/BaseButton.vue'

const activeTab = ref<'guide' | 'faq' | 'support'>('guide')

const faqItems = [
  {
    question: 'چگونه می‌توانم رمز عبور خود را تغییر دهم؟',
    answer: 'برای تغییر رمز عبور، به منوی کاربر رفته و گزینه "تغییر رمز عبور" را انتخاب کنید.',
  },
  {
    question: 'چگونه می‌توانم یک کاربر جدید ایجاد کنم؟',
    answer: 'برای ایجاد کاربر جدید، به بخش "کاربران" رفته و روی دکمه "ایجاد کاربر جدید" کلیک کنید.',
  },
  {
    question: 'چگونه می‌توانم دسترسی‌های یک گروه را مدیریت کنم؟',
    answer: 'برای مدیریت دسترسی‌های گروه، به بخش "گروه‌ها" رفته و روی گروه مورد نظر کلیک کنید، سپس به تب "دسترسی‌ها" بروید.',
  },
  {
    question: 'چگونه می‌توانم لاگ‌های سیستم را مشاهده کنم؟',
    answer: 'برای مشاهده لاگ‌های سیستم، به بخش "لاگ‌های حسابرسی" در منوی اصلی بروید.',
  },
]

const openFaq = ref<number | null>(null)

const toggleFaq = (index: number) => {
  openFaq.value = openFaq.value === index ? null : index
}
</script>

<template>
  <div class="space-y-6">
    <!-- Tabs -->
    <div class="flex gap-2 border-b border-border-default">
      <button
        :class="[
          'px-4 py-2 text-sm font-medium transition-colors border-b-2',
          activeTab === 'guide'
            ? 'border-primary-500 text-primary-600'
            : 'border-transparent text-muted-foreground hover:text-foreground',
        ]"
        @click="activeTab = 'guide'"
      >
        راهنمای استفاده
      </button>
      <button
        :class="[
          'px-4 py-2 text-sm font-medium transition-colors border-b-2',
          activeTab === 'faq'
            ? 'border-primary-500 text-primary-600'
            : 'border-transparent text-muted-foreground hover:text-foreground',
        ]"
        @click="activeTab = 'faq'"
      >
        سوالات متداول
      </button>
      <button
        :class="[
          'px-4 py-2 text-sm font-medium transition-colors border-b-2',
          activeTab === 'support'
            ? 'border-primary-500 text-primary-600'
            : 'border-transparent text-muted-foreground hover:text-foreground',
        ]"
        @click="activeTab = 'support'"
      >
        پشتیبانی
      </button>
    </div>

    <!-- Guide Tab -->
    <div v-if="activeTab === 'guide'" class="space-y-4">
      <div class="bg-secondary/50 rounded-lg p-4">
        <h3 class="text-lg font-semibold mb-2 flex items-center gap-2">
          <BaseIcon name="Info" :size="20" icon-class="text-primary-500" />
          شروع کار
        </h3>
        <p class="text-muted-foreground">
          برای شروع کار با سیستم، ابتدا باید وارد حساب کاربری خود شوید. پس از ورود، می‌توانید از منوی
          سمت راست به بخش‌های مختلف سیستم دسترسی داشته باشید.
        </p>
      </div>

      <div class="space-y-3">
        <h3 class="text-lg font-semibold">بخش‌های اصلی سیستم:</h3>
        <div class="grid gap-3">
          <div class="flex items-start gap-3 p-3 bg-card-background border border-border-default rounded-lg">
            <BaseIcon name="Users" :size="20" icon-class="text-primary-500 mt-0.5" />
            <div>
              <h4 class="font-medium mb-1">مدیریت کاربران</h4>
              <p class="text-sm text-muted-foreground">
                در این بخش می‌توانید کاربران سیستم را مدیریت کنید، کاربر جدید ایجاد کنید، اطلاعات
                کاربران را ویرایش کنید و دسترسی‌های آن‌ها را تنظیم کنید.
              </p>
            </div>
          </div>

          <div class="flex items-start gap-3 p-3 bg-card-background border border-border-default rounded-lg">
            <BaseIcon name="Shield" :size="20" icon-class="text-primary-500 mt-0.5" />
            <div>
              <h4 class="font-medium mb-1">مدیریت گروه‌ها و دسترسی‌ها</h4>
              <p class="text-sm text-muted-foreground">
                در این بخش می‌توانید گروه‌های کاربری را مدیریت کرده و دسترسی‌های هر گروه را تنظیم
                کنید.
              </p>
            </div>
          </div>

          <div class="flex items-start gap-3 p-3 bg-card-background border border-border-default rounded-lg">
            <BaseIcon name="FileText" :size="20" icon-class="text-primary-500 mt-0.5" />
            <div>
              <h4 class="font-medium mb-1">لاگ‌های حسابرسی</h4>
              <p class="text-sm text-muted-foreground">
                در این بخش می‌توانید تمام فعالیت‌های انجام شده در سیستم را مشاهده و بررسی کنید.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- FAQ Tab -->
    <div v-if="activeTab === 'faq'" class="space-y-3">
      <div
        v-for="(item, index) in faqItems"
        :key="index"
        class="bg-card-background border border-border-default rounded-lg overflow-hidden"
      >
        <button
          class="w-full text-right px-4 py-3 flex items-center justify-between hover:bg-secondary transition-colors"
          @click="toggleFaq(index)"
        >
          <span class="font-medium">{{ item.question }}</span>
          <BaseIcon
            name="ChevronDown"
            :size="16"
            :icon-class="[
              'text-muted-foreground transition-transform',
              openFaq === index ? 'rotate-180' : '',
            ]"
          />
        </button>
        <Transition name="faq">
          <div v-if="openFaq === index" class="px-4 pb-3 text-sm text-muted-foreground">
            {{ item.answer }}
          </div>
        </Transition>
      </div>
    </div>

    <!-- Support Tab -->
    <div v-if="activeTab === 'support'" class="space-y-4">
      <div class="bg-secondary/50 rounded-lg p-4">
        <h3 class="text-lg font-semibold mb-2">تماس با پشتیبانی</h3>
        <p class="text-muted-foreground mb-4">
          در صورت بروز مشکل یا نیاز به راهنمایی بیشتر، می‌توانید از طریق روش‌های زیر با ما در تماس
          باشید:
        </p>

        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <BaseIcon name="Mail" :size="20" icon-class="text-primary-500" />
            <div>
              <p class="font-medium">ایمیل</p>
              <p class="text-sm text-muted-foreground">support@example.com</p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <BaseIcon name="Phone" :size="20" icon-class="text-primary-500" />
            <div>
              <p class="font-medium">تلفن</p>
              <p class="text-sm text-muted-foreground">021-12345678</p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <BaseIcon name="Clock" :size="20" icon-class="text-primary-500" />
            <div>
              <p class="font-medium">ساعات کاری</p>
              <p class="text-sm text-muted-foreground">شنبه تا چهارشنبه: ۹ صبح تا ۵ عصر</p>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-card-background border border-border-default rounded-lg p-4">
        <h3 class="text-lg font-semibold mb-2">مستندات</h3>
        <p class="text-muted-foreground mb-4">
          برای دسترسی به مستندات کامل سیستم، می‌توانید به لینک زیر مراجعه کنید:
        </p>
        <BaseButton variant="outline" size="sm">
          مشاهده مستندات
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.faq-enter-active,
.faq-leave-active {
  transition: all 0.3s ease;
  max-height: 200px;
}

.faq-enter-from,
.faq-leave-to {
  opacity: 0;
  max-height: 0;
}
</style>


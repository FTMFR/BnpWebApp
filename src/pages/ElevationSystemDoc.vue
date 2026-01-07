<template>
  <div class="min-h-screen bg-background" dir="rtl">
    <div class="max-w-7xl mx-auto px-6 py-12">
      <!-- Header -->
      <div class="mb-12">
        <h1 class="mb-4 text-3xl font-bold text-foreground">
          نظام Elevation - Enterprise Admin Panel
        </h1>
        <p class="text-muted-foreground text-lg">
          سیستم جامع elevation با ۳ سطح مشخص برای ایجاد سلسله‌مراتب بصری قوی
        </p>
      </div>

      <!-- Live Examples -->
      <section class="mb-16">
        <div class="mb-8">
          <h2 class="mb-2 text-2xl font-semibold text-foreground">نمایش زنده سطوح Elevation</h2>
          <p class="text-muted-foreground">مشاهده تفاوت بصری بین سطوح مختلف</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Level 1 -->
          <div class="space-y-4">
            <div class="elevation-1 rounded-xl p-6">
              <div class="w-12 h-12 rounded-lg bg-primary-100 mb-4"></div>
              <h3 class="mb-2 text-lg font-semibold text-foreground">Surface Level 1</h3>
              <p class="text-sm text-muted-foreground mb-4">
                کارت‌های اصلی، ویجت‌های آماری، container های محتوا
              </p>
              <div class="flex items-center justify-between">
                <span class="text-2xl font-semibold text-foreground">۱۲۴</span>
                <span class="px-2 py-1 bg-success-100 text-success-700 rounded text-xs">+12%</span>
              </div>
            </div>
            <div class="bg-card border border-border rounded-lg p-4">
              <p class="text-xs font-mono text-muted-foreground mb-2">CSS Class:</p>
              <code class="text-xs bg-secondary px-2 py-1 rounded">elevation-1</code>
            </div>
          </div>

          <!-- Level 2 -->
          <div class="space-y-4">
            <div class="elevation-2 rounded-xl p-6">
              <div class="w-12 h-12 rounded-lg bg-warning-100 mb-4"></div>
              <h3 class="mb-2 text-lg font-semibold text-foreground">Surface Level 2</h3>
              <p class="text-sm text-muted-foreground mb-4">
                Modal ها، Drawer ها، کارت‌های تو در تو
              </p>
              <div class="flex items-center justify-between">
                <span class="text-2xl font-semibold text-foreground">۴۵.۲B</span>
                <span class="px-2 py-1 bg-success-100 text-success-700 rounded text-xs">+23%</span>
              </div>
            </div>
            <div class="bg-card border border-border rounded-lg p-4">
              <p class="text-xs font-mono text-muted-foreground mb-2">CSS Class:</p>
              <code class="text-xs bg-secondary px-2 py-1 rounded">elevation-2</code>
            </div>
          </div>

          <!-- Level 3 -->
          <div class="space-y-4">
            <div class="elevation-3 rounded-xl p-6">
              <div class="w-12 h-12 rounded-lg bg-danger-100 mb-4"></div>
              <h3 class="mb-2 text-lg font-semibold text-foreground">Surface Level 3</h3>
              <p class="text-sm text-muted-foreground mb-4">
                Dropdown، Tooltip، Popover - بالاترین سطح
              </p>
              <div class="flex items-center justify-between">
                <span class="text-2xl font-semibold text-foreground">۸۹۶</span>
                <span class="px-2 py-1 bg-warning-100 text-warning-700 rounded text-xs">+8%</span>
              </div>
            </div>
            <div class="bg-card border border-border rounded-lg p-4">
              <p class="text-xs font-mono text-muted-foreground mb-2">CSS Class:</p>
              <code class="text-xs bg-secondary px-2 py-1 rounded">elevation-3</code>
            </div>
          </div>
        </div>
      </section>

      <!-- Interactive Elevation -->
      <section class="mb-16">
        <div class="mb-8">
          <h2 class="mb-2 text-2xl font-semibold text-foreground">Interactive Elevation</h2>
          <p class="text-muted-foreground">کارت‌های قابل کلیک با hover effect</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="elevation-interactive rounded-xl p-6">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-lg bg-primary-100 shrink-0"></div>
              <div class="flex-1">
                <h3 class="mb-2 text-lg font-semibold text-foreground">کارت تعاملی</h3>
                <p class="text-sm text-muted-foreground">
                  این کارت با hover effect، transform و shadow تغییر می‌کند
                </p>
              </div>
            </div>
          </div>
          <div class="bg-card border border-border rounded-lg p-6">
            <p class="text-xs font-mono text-muted-foreground mb-2">CSS Class:</p>
            <code class="text-xs bg-secondary px-2 py-1 rounded">elevation-interactive</code>
            <div class="mt-4 space-y-2">
              <p class="text-xs text-muted-foreground">• موس را روی کارت ببرید</p>
              <p class="text-xs text-muted-foreground">• shadow قوی‌تر می‌شود</p>
              <p class="text-xs text-muted-foreground">• کارت ۲ پیکسل بالا می‌آید</p>
              <p class="text-xs text-muted-foreground">• border رنگ تیره‌تر می‌شود</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CSS Tokens -->
      <section class="mb-16">
        <div class="mb-8">
          <h2 class="mb-2 text-2xl font-semibold text-foreground">CSS Design Tokens</h2>
          <p class="text-muted-foreground">توکن‌های CSS برای استفاده مستقیم</p>
        </div>

        <div class="bg-card border border-border rounded-xl p-6">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 class="mb-4 text-lg font-semibold text-foreground">Surface Variables</h3>
              <div class="space-y-3 font-mono text-xs">
                <div class="p-3 bg-secondary/50 rounded">
                  <p class="text-muted-foreground mb-1">Page Background</p>
                  <code>--surface-0: #E5E7EB;</code>
                </div>
                <div class="p-3 bg-secondary/50 rounded">
                  <p class="text-muted-foreground mb-1">Level 1 Background</p>
                  <code>--surface-1: #FFFFFF;</code>
                </div>
                <div class="p-3 bg-secondary/50 rounded">
                  <p class="text-muted-foreground mb-1">Level 1 Border</p>
                  <code>--surface-1-border: #D1D5DB;</code>
                </div>
                <div class="p-3 bg-secondary/50 rounded">
                  <p class="text-muted-foreground mb-1">Level 1 Shadow</p>
                  <code class="text-[10px]">0 1px 3px rgba(0,0,0,0.12)</code>
                </div>
              </div>
            </div>

            <div>
              <h3 class="mb-4 text-lg font-semibold text-foreground">Higher Levels</h3>
              <div class="space-y-3 font-mono text-xs">
                <div class="p-3 bg-secondary/50 rounded">
                  <p class="text-muted-foreground mb-1">Level 2 Border</p>
                  <code>--surface-2-border: #9CA3AF;</code>
                </div>
                <div class="p-3 bg-secondary/50 rounded">
                  <p class="text-muted-foreground mb-1">Level 3 Border</p>
                  <code>--surface-3-border: #6B7280;</code>
                </div>
                <div class="p-3 bg-secondary/50 rounded">
                  <p class="text-muted-foreground mb-1">Hover Shadow</p>
                  <code class="text-[10px]">0 8px 12px rgba(0,0,0,0.14)</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Usage Guidelines -->
      <section class="mb-16">
        <div class="mb-8">
          <h2 class="mb-2 text-2xl font-semibold text-foreground">راهنمای استفاده</h2>
          <p class="text-muted-foreground">چه زمانی از کدام سطح استفاده کنیم</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-primary-50 border border-primary-200 rounded-xl p-6">
            <div
              class="w-10 h-10 rounded-lg bg-primary-500 text-white flex items-center justify-center mb-4"
            >
              <span class="font-bold">1</span>
            </div>
            <h3 class="text-primary-700 mb-3 font-semibold">Surface Level 1</h3>
            <ul class="space-y-2 text-sm text-primary-700">
              <li>✓ کارت‌های آماری</li>
              <li>✓ ویجت‌های داشبورد</li>
              <li>✓ Container های جدول</li>
              <li>✓ Form sections</li>
              <li>✓ Content cards</li>
            </ul>
          </div>

          <div class="bg-warning-50 border border-warning-200 rounded-xl p-6">
            <div
              class="w-10 h-10 rounded-lg bg-warning-500 text-white flex items-center justify-center mb-4"
            >
              <span class="font-bold">2</span>
            </div>
            <h3 class="text-warning-700 mb-3 font-semibold">Surface Level 2</h3>
            <ul class="space-y-2 text-sm text-warning-700">
              <li>✓ Modal dialogs</li>
              <li>✓ Side drawers</li>
              <li>✓ کارت‌های تو در تو</li>
              <li>✓ Elevated panels</li>
              <li>✓ Filter sections</li>
            </ul>
          </div>

          <div class="bg-danger-50 border border-danger-200 rounded-xl p-6">
            <div
              class="w-10 h-10 rounded-lg bg-danger-500 text-white flex items-center justify-center mb-4"
            >
              <span class="font-bold">3</span>
            </div>
            <h3 class="text-danger-700 mb-3 font-semibold">Surface Level 3</h3>
            <ul class="space-y-2 text-sm text-danger-700">
              <li>✓ Dropdown menus</li>
              <li>✓ Context menus</li>
              <li>✓ Tooltips</li>
              <li>✓ Popovers</li>
              <li>✓ Floating elements</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Tailwind Integration -->
      <section class="mb-16">
        <div class="mb-8">
          <h2 class="mb-2 text-2xl font-semibold text-foreground">Tailwind CSS Integration</h2>
          <p class="text-muted-foreground">چگونه با Tailwind استفاده کنیم</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-card border border-border rounded-xl p-6">
            <h3 class="mb-4 text-lg font-semibold text-foreground">کامپوننت با Elevation 1</h3>
            <pre
              class="text-xs bg-secondary/50 p-4 rounded-lg overflow-x-auto"
            ><code>&lt;div class="elevation-1 rounded-xl p-6"&gt;
  &lt;!-- محتوای کارت --&gt;
&lt;/div&gt;</code></pre>
          </div>

          <div class="bg-card border border-border rounded-xl p-6">
            <h3 class="mb-4 text-lg font-semibold text-foreground">کارت تعاملی</h3>
            <pre
              class="text-xs bg-secondary/50 p-4 rounded-lg overflow-x-auto"
            ><code>&lt;div class="elevation-interactive rounded-xl p-6"&gt;
  &lt;!-- کارت قابل کلیک --&gt;
&lt;/div&gt;</code></pre>
          </div>

          <div class="bg-card border border-border rounded-xl p-6">
            <h3 class="mb-4 text-lg font-semibold text-foreground">Modal با Elevation 2</h3>
            <pre
              class="text-xs bg-secondary/50 p-4 rounded-lg overflow-x-auto"
            ><code>&lt;div class="elevation-2 rounded-xl p-8 max-w-md"&gt;
  &lt;!-- محتوای modal --&gt;
&lt;/div&gt;</code></pre>
          </div>

          <div class="bg-card border border-border rounded-xl p-6">
            <h3 class="mb-4 text-lg font-semibold text-foreground">Dropdown با Elevation 3</h3>
            <pre
              class="text-xs bg-secondary/50 p-4 rounded-lg overflow-x-auto"
            ><code>&lt;div class="elevation-3 rounded-lg p-2 min-w-[200px]"&gt;
  &lt;!-- لیست آیتم‌ها --&gt;
&lt;/div&gt;</code></pre>
          </div>
        </div>
      </section>

      <!-- Do's and Don'ts -->
      <section>
        <div class="mb-8">
          <h2 class="mb-2 text-2xl font-semibold text-foreground">Do's and Don'ts</h2>
          <p class="text-muted-foreground">بهترین شیوه‌های استفاده</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-success-50 border border-success-200 rounded-xl p-6">
            <h3 class="text-success-700 mb-4 font-semibold">✓ انجام دهید</h3>
            <ul class="space-y-2 text-sm text-success-700">
              <li>✓ از elevation برای سلسله‌مراتب بصری استفاده کنید</li>
              <li>✓ همیشه border + shadow با هم استفاده شوند</li>
              <li>✓ elevation بالاتر = border تیره‌تر</li>
              <li>✓ hover effect برای کارت‌های قابل کلیک</li>
              <li>✓ border radius متناسب با اندازه کارت</li>
              <li>✓ سلسله‌مراتب منطقی: Level 1 &lt; 2 &lt; 3</li>
            </ul>
          </div>

          <div class="bg-danger-50 border border-danger-200 rounded-xl p-6">
            <h3 class="text-danger-700 mb-4 font-semibold">✗ انجام ندهید</h3>
            <ul class="space-y-2 text-sm text-danger-700">
              <li>✗ از elevation بدون border استفاده نکنید</li>
              <li>✗ shadow خیلی تیره یا blur شده</li>
              <li>✗ استفاده از Level 3 برای کارت‌های معمولی</li>
              <li>✗ elevation برای المان‌های decorative</li>
              <li>✗ shadow بدون هدف functional</li>
              <li>✗ نادیده گرفتن تفاوت بین سطوح</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
// Elevation System Documentation Component
// This component demonstrates the elevation system with 3 levels
</script>

<style scoped>
/* Additional styles if needed */
</style>

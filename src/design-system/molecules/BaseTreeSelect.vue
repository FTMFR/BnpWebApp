<template>
  <div class="p-4">
    <!-- Card Container -->
    <div class="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
      <!-- Card Header -->
      <div class="p-4 border-b border-gray-200 bg-gray-50">
        <!-- <h4 class="inline-block text-lg font-semibold text-gray-800">دسترسی به امکانات</h4> -->
        <h4>{{ title }}</h4>
        <hr class="mt-2 border-gray-300" />
      </div>

      <!-- Card Content -->
      <div class="p-4">
        <!-- Alert Section -->
        <div
          class="flex items-center p-3 mb-4 text-sm text-green-800 bg-green-100 rounded-lg border border-green-200"
          role="alert"
        >
          <!-- <span class="font-medium">{{ grpTitle }}</span> -->
          <span class="mx-1">[</span>
          <!-- <a
            href="#"
            class="font-medium underline text-red-600 hover:text-red-800"
            @click.prevent="openCopyModal"
          >
             کپی دسترسی
          </a> -->
          <a>{{ copyText }}</a>
          <span class="mx-1">]</span>
        </div>

        <!-- <div v-else class="flex items-center p-3 mb-4 text-sm text-blue-800 bg-blue-100 rounded-lg border border-blue-200" role="alert">
          <span>هیچ سمتی انتخاب نیست ، برای دسترسی به سمت ها بر روی سمت مورد نظر کلیک کنید .</span>
        </div> -->

        <!-- Tree Section (Grid Layout) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4" dir="rtl">
          <!-- Left Side: Roles (GrpShobe) -->
          <div class="w-full">
            <treeselect
              class="mt-2"
              placeholder="برای مشاهده کلیک کنید"
              :multiple="false"
              :options="rolesTree"
              :always-open="true"
              :no-children-text="farsiNochild"
              :close-on-select="false"
              :show-count="true"
              v-model="value1"
            >
              <template
                #option-label="{ node, shouldShowCount, count, labelClassName, countClassName }"
              >
                <label
                  class="block py-2 cursor-pointer hover:bg-gray-100 px-2 rounded"
                  :class="labelClassName"
                  @click.prevent="ItemSelected_GrpShobe(node.id, node.label)"
                >
                  {{ node.label }}
                  <span v-if="shouldShowCount" :class="countClassName">({{ count }})</span>
                </label>
              </template>
            </treeselect>
          </div>

          <!-- Right Side: Permissions (DastresiGrp) -->
          <div class="w-full">
            <treeselect

              class="mt-2"
              placeholder="برای مشاهده کلیک کنید"
              :multiple="false"
               :options="store.state.DefineDastresi.treeDefineDastresi_DastresiGrp"
              :always-open="alwaysOpen"
              :no-children-text="farsiNochild"
              :close-on-select="false"
              :show-count="true"
              v-model="value2"
              :normalizer="normalizer"
            >
              <template
                #option-label="{ node, shouldShowCount, count, labelClassName, countClassName }"
              >
                <label
                  :class="labelClassName"
                  class="block cursor-pointer hover:bg-gray-100 px-2 rounded"
                >
                  <!-- Custom Switch/Checkbox -->
                  <div class="inline-flex items-center align-middle ml-2">
                    <input
                      type="checkbox"
                      class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      :id="'IsMojaz_' + node.id"
                      @click.prevent="togglePermission(node.raw)"
                      :checked="node.raw.isMojaz === 1"
                    />
                  </div>

                  {{ node.label }}
                  <span v-if="shouldShowCount" :class="countClassName">({{ count }})</span>

                  <!-- Lock/Unlock Icons -->
                  <span class="mr-2 font-normal text-sm">
                    <i v-if="node.raw.isMojaz !== 1" class="fa fa-lock text-red-500"></i>
                    <i v-else class="fa fa-unlock text-green-500"></i>
                  </span>
                </label>
              </template>
            </treeselect>
          </div>
        </div>
      </div>
    </div>

    <!-------------------------------------------------------------->
    <!-- Custom Tailwind Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none"
    >
      <!-- Backdrop -->
      <div
        class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        @click="closeModal"
      ></div>

      <!-- Modal Container -->
      <div class="relative w-auto max-w-sm mx-auto my-6 bg-white rounded-lg shadow-lg outline-none">
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-4 border-b border-gray-200 rounded-t">
          <h5 class="text-lg font-semibold text-gray-800">کپی سمت</h5>
          <button
            type="button"
            class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
            @click="closeModal"
          >
            <span aria-hidden="true" class="text-xl">&times;</span>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-4">
          <div class="w-full">
            <label for="roleSelect" class="block mb-2 text-sm font-medium text-gray-900"
              >انتخاب سمت</label
            >
            <select
              id="roleSelect"
              v-model="selectedSemat"
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dir-rtl"
              dir="rtl"
            >
              <option :value="-1">-- لطفا سمت مورد نظر را انتخاب کنید --</option>
              <!-- <option
               v-for="itemDb in dataForCopy"
                :key="itemDb.id"
                :value="itemDb.id"
              >
                {{ itemDb.Gname }}
              </option> -->
            </select>
          </div>
        </div>

        <!-- Modal Footer -->
        <div
          class="flex items-center justify-end p-4 space-x-2 space-x-reverse border-t border-gray-200 rounded-b"
        >
          <button
            type="button"
            class="text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            @click="SaveCopy"
          >
            ثـبـت کـپـی
          </button>
          <button
            type="button"
            class="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            @click="closeModal"
          >
            انصراف
          </button>
        </div>
      </div>
    </div>
    <!-------------------------------------------------------------->
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Treeselect from 'vue-treeselect' // Ensure Vue 3 compatible version
import 'vue-treeselect/dist/vue-treeselect.css'

interface Props {
  rolesTree: any[]
  permissionsTree: any[]
  showPermissions: boolean
}

// State
const value1 = ref(null)
const value2 = ref(null)
const alwaysOpen = ref(true)
const farsiNochild = ref('بدون فرزند')
const showModal = ref(false)
const selectedSemat = ref(-1)

// Computed
// const grpTitle = computed(() => store.state.DefineDastresi.GrpTitle);
// const dataForCopy = computed(() => store.state.DefineDastresi.DataForCopy);
// const dataForCopyId = computed(() => store.state.DefineDastresi.DataForCopyId);

// Methods
const normalizer = (node) => {
  return {
    id: node.id,
    label: node.label,
    children: node.children,
  }
}

const ItemSelected_GrpShobe = (id, label) => {
  console.log('Selected Role:', id, label)
  // Dispatch action to fetch permissions for this role
}

const togglePermission = (rawNode) => {
  const newValue = rawNode.isMojaz === 1 ? 0 : 1
  rawNode.isMojaz = newValue
  // Dispatch action to update backend
}

const openCopyModal = () => {
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedSemat.value = -1 // Reset selection
}

const SaveCopy = () => {
  if (selectedSemat.value === -1) {
    alert('لطفا سمت را انتخاب کنید')
    return
  }
  console.log('Copying access to role ID:', selectedSemat.value)
  // Dispatch save action
  closeModal()
}
</script>

<style scoped>
/* Ensure RTL works correctly for the select dropdown if needed */
[dir='rtl'] select {
  background-position: left 0.5rem center;
}
</style>

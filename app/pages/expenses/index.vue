<template>
  <div class="container">
    <div class="page-header">
      <h1>💸 ບັນທຶກຄ່າໃຊ້ຈ່າຍ</h1>
      <p class="subtitle">ຈັດການແລະຕິດຕາມຄ່າໃຊ້ຈ່າຍທຸລະກິດ</p>
    </div>

    <div class="tabs">
      <button :class="['tab-btn', { active: activeTab === 'create' }]" @click="activeTab = 'create'">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="16"></line>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
        <span>ບັນທຶກໃໝ່</span>
      </button>
      <button :class="['tab-btn', { active: activeTab === 'list' }]" @click="activeTab = 'list'">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="8" y1="6" x2="21" y2="6"></line>
          <line x1="8" y1="12" x2="21" y2="12"></line>
          <line x1="8" y1="18" x2="21" y2="18"></line>
          <line x1="3" y1="6" x2="3.01" y2="6"></line>
          <line x1="3" y1="12" x2="3.01" y2="12"></line>
          <line x1="3" y1="18" x2="3.01" y2="18"></line>
        </svg>
        <span>ປະຫວັດ</span>
      </button>
      <button :class="['tab-btn', { active: activeTab === 'categories' }]" @click="activeTab = 'categories'">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
        <span>ໝວດໝູ່</span>
      </button>
    </div>

    <!-- Form to add/edit expense -->
    <div v-show="activeTab === 'create'" class="form-card">
      <div class="card-header">
        <h2>{{ isEditing ? '✏️ ແກ້ໄຂຄ່າໃຊ້ຈ່າຍ' : '➕ ບັນທຶກຄ່າໃຊ້ຈ່າຍໃໝ່' }}</h2>
      </div>

      <form @submit.prevent="saveExpense">
        <div class="form-row">
          <div class="form-group">
            <label>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              ໝວດໝູ່ <span class="required">*</span>
            </label>
            <select v-model="form.category_id" required class="input-field">
              <option value="">-- ເລືອກໝວດໝູ່ --</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
            <div class="quick-add">
              <input v-model="newCategoryName" type="text" placeholder="ເພີ່ມໝວດໝູ່ໃໝ່..." class="input-field" />
              <button type="button" class="btn-add-category" @click="createCategory">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
              ຈຳນວນເງິນ (LAK) <span class="required">*</span>
            </label>
            <input v-model.number="form.amount" type="number" step="0.01" required class="input-field" placeholder="0.00" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              ວັນທີ່ຈ່າຍ
            </label>
            <input v-model="form.expense_date" type="datetime-local" class="input-field" />
          </div>

          <div class="form-group">
            <label>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              ໝາຍເຫດ
            </label>
            <textarea v-model="form.remark" rows="3" placeholder="ເຊັ່ນ: ຄ່າຈັດສົ່ງ, ຄ່າວັດສະດຸ..." class="input-field"></textarea>
          </div>
        </div>

        <div class="form-group full-width">
          <label>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            ຮູບໃບບີນ (ຖ້າມີ)
          </label>
          <div class="file-upload-area">
            <input ref="fileInput" type="file" @change="handleFileUpload" accept="image/*" class="file-input" id="fileUpload" />
            <label for="fileUpload" class="file-label">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <span>{{ uploading ? 'ກຳລັງອັບໂຫລດ...' : 'ເລືອກໄຟລ໌ຮູບພາບ' }}</span>
            </label>
            <div v-if="form.image_url" class="image-preview">
              <img :src="form.image_url" alt="receipt" />
              <button type="button" class="btn-remove-image" @click="form.image_url = ''" title="ລົບຮູບ">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
              </button>
            </div>
          </div>
          <small class="hint">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            ໄຟລ໌ຈະຖືກອັບໂຫລດໄປຍັງ bucket ຊື່ <code>expense_receipts</code> (ສ້າງໃນ Supabase Storage ກ່ອນໃຊ້ງານ)
          </small>
        </div>

        <div v-if="error" class="error-message">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          {{ error }}
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-primary">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            {{ isEditing ? 'ບັນທຶກການແກ້ໄຂ' : 'ບັນທຶກຄ່າໃຊ້ຈ່າຍ' }}
          </button>
          <button v-if="isEditing" type="button" class="btn-secondary" @click="cancelEdit">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            ຍົກເລີກ
          </button>
        </div>
      </form>
    </div>

    <!-- Expenses list -->
    <div v-show="activeTab === 'list'" class="list-card">
      <div class="card-header">
        <h2>📋 ປະຫວັດຄ່າໃຊ້ຈ່າຍ</h2>
      </div>

      <div class="filter-section">
        <div class="filter-group">
          <label>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            ໝວດໝູ່
          </label>
          <select v-model="filter.category_id" class="input-field">
            <option value="">ທຸກໝວດໝູ່</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            ຈາກວັນທີ່
          </label>
          <input type="date" v-model="filter.from" class="input-field" />
        </div>
        <div class="filter-group">
          <label>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            ຫາວັນທີ່
          </label>
          <input type="date" v-model="filter.to" class="input-field" />
        </div>
        <div class="filter-actions">
          <button class="btn-filter" @click="fetchExpenses">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            ຄົ້ນຫາ
          </button>
          <button class="btn-reset" @click="resetFilter">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="1 4 1 10 7 10"></polyline>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
            </svg>
            ຣີເຊັດ
          </button>
        </div>
      </div>

      <div class="summary-stats">
        <div class="stat-card">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
          </div>
          <div class="stat-content">
            <p class="stat-label">ທັງໝົດ</p>
            <p class="stat-value">{{ expenses.length }}</p>
          </div>
        </div>
        <div class="stat-card highlight">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div class="stat-content">
            <p class="stat-label">ຍອດລວມຄ່າໃຊ້ຈ່າຍ</p>
            <p class="stat-value">{{ formatNumber(totalExpenses) }} LAK</p>
          </div>
        </div>
      </div>

      <div v-if="loading" class="loading-state">
        <svg class="spinner" viewBox="0 0 50 50" width="40" height="40">
          <circle cx="25" cy="25" r="20" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round" stroke-dasharray="31.4 31.4"></circle>
        </svg>
        <p>ກຳລັງໂຫລດ...</p>
      </div>

      <div v-else-if="expenses.length === 0" class="no-data-state">
        <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <p>ບໍ່ມີຂໍ້ມູນຄ່າໃຊ້ຈ່າຍ</p>
        <button class="btn-primary" @click="activeTab = 'create'">ເພີ່ມຂໍ້ມູນໃໝ່</button>
      </div>

      <div v-else class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>ວັນທີ່</th>
              <th>ໝວດໝູ່</th>
              <th>ຈຳນວນເງິນ</th>
              <th>ໝາຍເຫດ</th>
              <th>ໃບບີນ</th>
              <th>ການກະທຳ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in expenses" :key="row.id">
              <td class="date-cell">{{ formatDate(row.expense_date) }}</td>
              <td>
                <span class="category-badge">{{ row.category?.name || '-' }}</span>
              </td>
              <td class="amount-cell">{{ formatNumber(row.amount) }} LAK</td>
              <td class="remark-cell">{{ row.remark || '-' }}</td>
              <td>
                <a v-if="row.image_url" :href="row.image_url" target="_blank" class="image-link">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                  ເບິ່ງຮູບ
                </a>
                <span v-else class="no-image">-</span>
              </td>
              <td class="actions-cell">
                <button class="btn-edit" @click="startEdit(row)" title="ແກ້ໄຂ">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
                <button class="btn-delete" @click="removeExpense(row.id)" title="ລຶບ">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Categories management -->
    <div v-show="activeTab === 'categories'" class="categories-card">
      <div class="card-header">
        <h2>🗂️ ໝວດໝູ່ຄ່າໃຊ້ຈ່າຍ</h2>
      </div>
      
      <div v-if="categories.length === 0" class="no-data-state">
        <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
        <p>ບໍ່ມີໝວດໝູ່ຄ່າໃຊ້ຈ່າຍ</p>
      </div>

      <div v-else class="categories-grid">
        <div v-for="cat in categories" :key="cat.id" class="category-card">
          <div class="category-info">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span class="category-name">{{ cat.name }}</span>
          </div>
          <button class="btn-delete-cat" @click="deleteCategory(cat.id)" title="ລົບໝວດໝູ່">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </div>
      </div>

      <div v-if="catError" class="error-message">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        {{ catError }}
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})

import { ref, computed, onMounted } from 'vue'
const supabase = useSupabaseClient()
const navigate = useRouter()

const activeTab = ref('list')
const loading = ref(false)
const error = ref(null)
const catError = ref(null)

const categories = ref([])
const expenses = ref([])

const form = ref({
  id: null,
  category_id: '',
  amount: 0,
  expense_date: new Date().toISOString().slice(0, 16),
  remark: '',
  image_url: ''
})

const isEditing = ref(false)
const newCategoryName = ref('')
const fileInput = ref(null)
const uploading = ref(false)

const filter = ref({ category_id: '', from: '', to: '' })

const totalExpenses = computed(() => {
  return expenses.value.reduce((sum, exp) => sum + (exp.amount || 0), 0)
})

function formatNumber(value) {
  return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
}

function formatDate(date) {
  if (!date) return '-'
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${day}-${month}-${year} ${hours}:${minutes}`
}

async function fetchCategories() {
  try {
    const { data, error: fetchError } = await supabase.from('expense_categories').select('*').order('name')
    if (fetchError) throw fetchError
    categories.value = data || []
  } catch (err) {
    catError.value = 'ບໍ່ສາມາດໂຫລດໝວດໝູ່ໄດ້: ' + err.message
    console.error(err)
  }
}

async function createCategory() {
  if (!newCategoryName.value.trim()) return
  try {
    catError.value = null
    const { data, error: insertError } = await supabase.from('expense_categories').insert([{ name: newCategoryName.value.trim() }]).select()
    if (insertError) throw insertError
    newCategoryName.value = ''
    await fetchCategories()
  } catch (err) {
    catError.value = 'ບໍ່ສາມາດເພີ່ມໝວດໝູ່: ' + err.message
    console.error(err)
  }
}

async function deleteCategory(id) {
  if (!confirm('ລຶບໝວດໝູ່ນີ້? ຈະບໍ່ສາມາດກູ້ຄືນໄດ້')) return
  try {
    const { error: delError } = await supabase.from('expense_categories').delete().eq('id', id)
    if (delError) throw delError
    await fetchCategories()
  } catch (err) {
    catError.value = 'ບໍ່ສາມາດລຶບໝວດໝູ່: ' + err.message
    console.error(err)
  }
}

function resetForm() {
  form.value = {
    id: null,
    category_id: '',
    amount: 0,
    expense_date: new Date().toISOString().slice(0, 16),
    remark: '',
    image_url: ''
  }
  isEditing.value = false
}

function startEdit(row) {
  form.value = { ...row, expense_date: new Date(row.expense_date).toISOString().slice(0,16) }
  isEditing.value = true
  activeTab.value = 'create'
}

function cancelEdit() {
  resetForm()
}

async function handleFileUpload(event) {
  const files = event.target.files
  if (!files || files.length === 0) return

  try {
    uploading.value = true
    const file = files[0]
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${fileName}`

    // NOTE: ensure bucket 'expense_receipts' exists in Supabase Storage
    const { data, error: uploadError } = await supabase.storage.from('expense_receipts').upload(filePath, file)
    if (uploadError) throw uploadError

    const { data: publicData } = supabase.storage.from('expense_receipts').getPublicUrl(filePath)
    form.value.image_url = publicData.publicUrl

    if (fileInput.value) fileInput.value.value = ''
  } catch (err) {
    // Provide clearer guidance when the bucket is missing
    const msg = err?.message || String(err)
    if (msg.includes('Bucket not found') || msg.includes('bucket not found') || err?.status === 404) {
      error.value = 'ไม่พบ bucket ชื่อ "expense_receipts" ใน Supabase Storage — โปรดสร้าง bucket นี้ (หรือเปลี่ยนชื่อ bucket ในโค้ด)'
    } else {
      error.value = 'ບໍ່ສາມາດອັບໂຫລດໄຟລ໌ໄດ້: ' + msg
    }
    console.error(err)
  } finally {
    uploading.value = false
  }
}

async function saveExpense() {
  try {
    error.value = null
    if (!form.value.category_id) {
      error.value = 'ກະລຸນາເລືອກໝວດໝູ່'
      return
    }
    const payload = {
      category_id: form.value.category_id,
      amount: form.value.amount || 0,
      expense_date: form.value.expense_date || new Date().toISOString(),
      remark: form.value.remark || null,
      image_url: form.value.image_url || null
    }

    if (isEditing.value && form.value.id) {
      const { error: updateError } = await supabase.from('expenses').update(payload).eq('id', form.value.id)
      if (updateError) throw updateError
    } else {
      const { error: insertError } = await supabase.from('expenses').insert([payload])
      if (insertError) throw insertError
    }

    resetForm()
    await fetchExpenses()
    activeTab.value = 'list'
  } catch (err) {
    error.value = 'ບໍ່ສາມາດບັນທຶກຄ່າໃຊ້ຈ່າຍໄດ້: ' + err.message
    console.error(err)
  }
}

async function fetchExpenses() {
  try {
    loading.value = true
    error.value = null

    let query = supabase.from('expenses').select(`id, amount, expense_date, remark, image_url, category:expense_categories(name)`).order('expense_date', { ascending: false })

    if (filter.value.category_id) query = query.eq('category_id', filter.value.category_id)
    if (filter.value.from) query = query.gte('expense_date', filter.value.from)
    if (filter.value.to) query = query.lte('expense_date', filter.value.to + 'T23:59:59')

    const { data, error: fetchError } = await query
    if (fetchError) throw fetchError
    expenses.value = data || []
  } catch (err) {
    error.value = 'ບໍ່ສາມາດໂຫລດຂໍ້ມູນໄດ້: ' + err.message
    console.error(err)
  } finally {
    loading.value = false
  }
}

function resetFilter() {
  filter.value = { category_id: '', from: '', to: '' }
  fetchExpenses()
}

function viewExpense(id) {
  navigate.push(`/expenses/${id}`)
}

async function removeExpense(id) {
  if (!confirm('ลบรายการนี้?')) return
  try {
    const { error: delError } = await supabase.from('expenses').delete().eq('id', id)
    if (delError) throw delError
    await fetchExpenses()
  } catch (err) {
    error.value = 'ບໍ່ສາມາດລຶບໄດ້: ' + err.message
    console.error(err)
  }
}

onMounted(async () => {
  await fetchCategories()
  await fetchExpenses()
})
</script>

<style scoped>
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Phetsarath-OT', sans-serif;
}

/* Page Header */
.page-header {
  margin-bottom: 32px;
  text-align: center;
}

.page-header h1 {
  color: #1a202c;
  font-size: 2.5rem;
  margin: 0 0 8px 0;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  color: #718096;
  font-size: 1rem;
  margin: 0;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 30px;
  background: #f7fafc;
  padding: 6px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  color: #4a5568;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: 'Phetsarath-OT', sans-serif;
}

.tab-btn svg {
  transition: transform 0.3s;
}

.tab-btn:hover {
  background: #edf2f7;
  color: #2d3748;
}

.tab-btn:hover svg {
  transform: scale(1.1);
}

.tab-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* Cards */
.form-card, .list-card, .categories-card {
  background: white;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.card-header {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f7fafc;
}

.card-header h2 {
  color: #2d3748;
  font-size: 1.5rem;
  margin: 0;
  font-weight: 700;
}

/* Form Elements */
.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #4a5568;
  font-weight: 600;
  font-size: 0.95rem;
}

.form-group label svg {
  color: #667eea;
}

.required {
  color: #f56565;
}

.input-field {
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.95rem;
  transition: all 0.3s;
  font-family: 'Phetsarath-OT', sans-serif;
  background: #ffffff;
}

.input-field:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.amount-input {
  font-size: 1.1rem;
  font-weight: 600;
}

.quick-add {
  display: flex;
  gap: 8px;
}

.quick-add .input-field {
  flex: 1;
}

.btn-add-category {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  flex-shrink: 0;
}

.btn-add-category:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

/* File Upload */
.file-upload-area {
  position: relative;
}

.file-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.file-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 32px;
  border: 2px dashed #cbd5e0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  background: #f7fafc;
}

.file-label:hover {
  border-color: #667eea;
  background: #edf2f7;
}

.file-label svg {
  color: #667eea;
}

.file-label span {
  color: #4a5568;
  font-weight: 500;
}

.image-preview {
  position: relative;
  margin-top: 16px;
  display: inline-block;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.image-preview img {
  max-width: 100%;
  max-height: 300px;
  display: block;
}

.btn-remove-image {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(245, 101, 101, 0.9);
  backdrop-filter: blur(4px);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-remove-image:hover {
  background: #f56565;
  transform: scale(1.1);
}

.hint {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #718096;
  font-size: 0.85rem;
  margin-top: 8px;
}

.hint svg {
  flex-shrink: 0;
  color: #a0aec0;
}

.hint code {
  background: #edf2f7;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 30px;
  padding-top: 24px;
  border-top: 2px solid #f7fafc;
}

.btn-primary, .btn-secondary {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s;
  font-family: 'Phetsarath-OT', sans-serif;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #e2e8f0;
  color: #4a5568;
}

.btn-secondary:hover {
  background: #cbd5e0;
}

/* Filter Section */
.filter-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 30px;
  padding: 24px;
  background: #f7fafc;
  border-radius: 12px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #4a5568;
  font-weight: 600;
  font-size: 0.9rem;
}

.filter-group label svg {
  color: #667eea;
}

.filter-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%234a5568' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
}

.filter-actions {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.btn-filter, .btn-reset {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 18px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  font-family: 'Phetsarath-OT', sans-serif;
  white-space: nowrap;
}

.btn-filter {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-filter:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-reset {
  background: #e2e8f0;
  color: #4a5568;
}

.btn-reset:hover {
  background: #cbd5e0;
}

/* Summary Stats */
.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border-radius: 12px;
  border-left: 4px solid #667eea;
}

.stat-card.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-left-color: #f56565;
}

.stat-card.total .stat-icon {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.stat-card.total .stat-label,
.stat-card.total .stat-value {
  color: white;
}

.stat-icon {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 10px;
  color: #667eea;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 0.85rem;
  color: #718096;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 1.4rem;
  font-weight: 700;
  color: #2d3748;
}

/* Table */
.table-container {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

.data-table thead {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.data-table th {
  padding: 16px;
  text-align: left;
  font-weight: 600;
  white-space: nowrap;
}

.data-table td {
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.expense-row {
  transition: all 0.2s;
}

.expense-row:hover {
  background: #f7fafc;
}

.col-number {
  width: 60px;
  text-align: center;
  color: #718096;
  font-weight: 600;
}

.date-display {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #4a5568;
}

.date-display svg {
  color: #667eea;
  flex-shrink: 0;
}

.category-badge {
  display: inline-block;
  padding: 6px 14px;
  background: #edf2f7;
  color: #4a5568;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.85rem;
}

.col-amount {
  text-align: right;
}

.amount-display {
  font-weight: 700;
  font-size: 1.1rem;
  color: #2d3748;
}

.currency {
  font-size: 0.8rem;
  color: #718096;
  margin-left: 4px;
}

.col-remark {
  max-width: 250px;
  color: #718096;
  overflow: hidden;
  text-overflow: ellipsis;
}

.image-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #edf2f7;
  color: #667eea;
  text-decoration: none;
  border-radius: 6px;
  font-size: 0.85rem;
  transition: all 0.3s;
}

.image-link:hover {
  background: #e2e8f0;
  color: #764ba2;
}

.no-image {
  color: #cbd5e0;
}

.action-buttons {
  display: flex;
  gap: 6px;
}

.btn-action {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-view {
  background: #e6fffa;
  color: #319795;
}

.btn-view:hover {
  background: #b2f5ea;
  transform: scale(1.1);
}

.btn-edit {
  background: #feebc8;
  color: #dd6b20;
}

.btn-edit:hover {
  background: #fbd38d;
  transform: scale(1.1);
}

.btn-delete {
  background: #fed7d7;
  color: #c53030;
}

.btn-delete:hover {
  background: #fc8181;
  transform: scale(1.1);
}

/* Categories Grid */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}

.category-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border-radius: 10px;
  border-left: 4px solid #667eea;
  transition: all 0.3s;
}

.category-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.category-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.category-info svg {
  color: #667eea;
}

.category-name {
  font-weight: 600;
  color: #2d3748;
}

.btn-delete-category {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fed7d7;
  color: #c53030;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-delete-category:hover {
  background: #fc8181;
  transform: scale(1.1);
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #718096;
}

.spinner {
  color: #667eea;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* No Data State */
.no-data-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #a0aec0;
}

.no-data-state svg {
  margin-bottom: 20px;
}

.no-data-state p {
  font-size: 1.1rem;
  margin: 0 0 20px 0;
}

.btn-add-first {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  font-family: 'Phetsarath-OT', sans-serif;
}

.btn-add-first:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* Error Message */
.error-message {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: #fff5f5;
  color: #c53030;
  border-radius: 10px;
  border-left: 4px solid #f56565;
  margin-top: 20px;
}

.error-message svg {
  flex-shrink: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    padding: 15px;
  }

  .page-header h1 {
    font-size: 1.8rem;
  }

  .tabs {
    flex-direction: column;
  }

  .tab-btn {
    justify-content: flex-start;
    padding: 12px 16px;
  }

  .form-card, .list-card, .categories-card {
    padding: 20px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .filter-section {
    grid-template-columns: 1fr;
  }

  .filter-actions {
    grid-column: 1 / -1;
  }

  .summary-stats {
    grid-template-columns: 1fr;
  }

  .data-table {
    font-size: 0.85rem;
  }

  .data-table th,
  .data-table td {
    padding: 10px 8px;
  }

  .categories-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-primary, .btn-secondary {
    width: 100%;
    justify-content: center;
  }
}
</style>
<template>
  <div class="container">
    <h1>ບັນທຶກຄ່າໃຊ້ຈ່າຍ</h1>

    <div class="tabs">
      <button :class="['tab-btn', { active: activeTab === 'create' }]" @click="activeTab = 'create'">➕ ອອກຄ່າໃຊ້ຈ່າຍ</button>
      <button :class="['tab-btn', { active: activeTab === 'list' }]" @click="activeTab = 'list'">📋 ປະຫວັດຄ່າໃຊ້ຈ່າຍ</button>
      <button :class="['tab-btn', { active: activeTab === 'categories' }]" @click="activeTab = 'categories'">🗂️ ໝວດໝູ່</button>
    </div>

    <!-- Form to add/edit expense -->
    <div v-show="activeTab === 'create'" class="form-card">
      <h2>{{ isEditing ? 'ແກ້ໄຂຄ່າໃຊ້ຈ່າຍ' : 'ບັນທຶກຄ່າໃຊ້ຈ່າຍໃໝ່' }}</h2>

      <form @submit.prevent="saveExpense">
        <div class="form-row">
          <div class="form-group">
            <label>ໝວດໝູ່: *</label>
            <div class="inline-add">
              <select v-model="form.category_id" required>
                <option value="">-- ເລືອກໝວດໝູ່ --</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>

              <input v-model="newCategoryName" type="text" placeholder="ເພີ່ມໝວດໝູ່ໃໝ່" />
              <button type="button" class="btn-small" @click="createCategory">ເພີ່ມ</button>
            </div>
          </div>

          <div class="form-group">
            <label>ຈໍານວນເງິນ (LAK): *</label>
            <input v-model.number="form.amount" type="number" step="0.01" min="0" required />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>ວັນທີ່ຈ່າຍ:</label>
            <input v-model="form.expense_date" type="datetime-local" />
          </div>

          <div class="form-group">
            <label>ໝາຍເຫດ:</label>
            <textarea v-model="form.remark" rows="2" placeholder="ตัวอย่าง: ค่าจัดส่ง, ค่าวัสดุ..."></textarea>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>ຮູບໃບບີນ (ຖ້າມີ):</label>
            <input ref="fileInput" type="file" @change="handleFileUpload" accept="image/*" />
            <div v-if="uploading" class="uploading">ກຳລັງອັບໂຫລດ...</div>
            <div v-if="form.image_url" class="preview">
              <img :src="form.image_url" alt="receipt" />
              <button type="button" class="btn-remove" @click="form.image_url = ''">ລົບຮູບ</button>
            </div>
            <small class="hint">ໄຟລ໌ຈະຖືກອັບໂຫລດໄປຍັງ bucket ຊື່ <code>expense_receipts</code> (ສ້າງໃນ Supabase Storage ກ່ອນໃຊ້ງານ)</small>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-primary">{{ isEditing ? 'ບັນທຶກການແກ້ໄຂ' : 'ບັນທຶກຄ່າໃຊ້ຈ່າຍ' }}</button>
          <button v-if="isEditing" type="button" class="btn-secondary" @click="cancelEdit">ຍົກເລີກ</button>
        </div>
      </form>

      <div v-if="error" class="error">{{ error }}</div>
    </div>

    <!-- Expenses list -->
    <div v-show="activeTab === 'list'" class="list-card">
      <h2>ປະຫວັດຄ່າໃຊ້ຈ່າຍ</h2>

      <div class="filters">
        <select v-model="filter.category_id">
          <option value="">ທຸກໝວດໝູ່</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>
        <input type="date" v-model="filter.from" />
        <input type="date" v-model="filter.to" />
        <button class="btn-small" @click="fetchExpenses">ຄົ້ນຫາ</button>
        <button class="btn-small" @click="resetFilter">ຣີເຊັດ</button>
      </div>

      <div v-if="loading" class="loading">ກຳລັງໂຫລດ...</div>
      <div v-else-if="expenses.length === 0" class="no-data">ຍັງບໍ່ມີລາຍການ</div>
      <div v-else>
        <div class="table-info">ທັງໝົດ {{ expenses.length }} ລາຍການ</div>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>ວັນທີ່</th>
                <th>ໝວດໝູ່</th>
                <th>ຈໍານວນເງິນ</th>
                <th>ໝາຍເຫດ</th>
                <th>ຮູບ</th>
                <th>ຈັດການ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in expenses" :key="row.id">
                <td>{{ index + 1 }}</td>
                <td>{{ formatDate(row.expense_date) }}</td>
                <td>{{ row.category?.name || '-' }}</td>
                <td class="amount">{{ formatNumber(row.amount) }}</td>
                <td class="remark">{{ row.remark || '-' }}</td>
                <td>
                  <a v-if="row.image_url" :href="row.image_url" target="_blank">ເບີ່ງຮູບ</a>
                  <span v-else>-</span>
                </td>
                <td class="actions">
                  <button class="btn-detail" @click="viewExpense(row.id)">👁️</button>
                  <button class="btn-edit" @click="startEdit(row)">✏️</button>
                  <button class="btn-delete" @click="removeExpense(row.id)">🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="error" class="error">{{ error }}</div>
    </div>

    <!-- Categories management -->
    <div v-show="activeTab === 'categories'" class="categories-card">
      <h2>ໝວດໝູ່ຄ່າໃຊ້ຈ່າຍ</h2>
      <div v-if="categories.length === 0" class="no-data">ຍັງບໍ່ມີໝວດໝູ່</div>
      <div v-else>
        <ul class="category-list">
          <li v-for="cat in categories" :key="cat.id">
            <span>{{ cat.name }}</span>
            <button class="btn-delete" @click="deleteCategory(cat.id)">ລຶບ</button>
          </li>
        </ul>
      </div>

      <div v-if="catError" class="error">{{ catError }}</div>
    </div>
  </div>
</template>

<script setup>
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 { color: #333; margin-bottom: 20px }

/* Tabs */
.tabs { display: flex; gap: 0; margin-bottom: 20px; border-bottom: 2px solid #eee }
.tab-btn {
  padding: 12px 20px; background: transparent; border: none; cursor: pointer; font-weight: 700; color: #444
}
.tab-btn.active { border-bottom: 3px solid #667eea; color: #222 }

.form-card, .list-card, .categories-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.06) }
.form-row { display: flex; gap: 16px; margin-bottom: 12px }
.form-group { flex: 1; display: flex; flex-direction: column; gap: 8px }
.form-actions { display: flex; gap: 12px; margin-top: 12px }

.btn-primary { background: #667eea; color: white; padding: 10px 18px; border: none; border-radius: 6px }
.btn-secondary { background: #f0f0f0; padding: 10px 18px; border: none; border-radius: 6px }
.btn-small { background: #eee; padding: 6px 10px; border: none; border-radius: 6px; margin-left: 8px }
.btn-remove { background: #ff6b6b; color: white; border: none; padding: 6px 8px; border-radius: 4px }

.inline-add { display: flex; gap: 8px; align-items: center }
.preview img { max-width: 240px; max-height: 160px; display: block; margin-top: 8px }
.hint { color: #666; font-size: 0.9rem }

.filters { display: flex; gap: 8px; margin-bottom: 12px; align-items: center }
.table-container { overflow-x: auto }
.data-table { width: 100%; border-collapse: collapse }
.data-table th, .data-table td { padding: 10px; border-bottom: 1px solid #eee; text-align: left }
.amount { text-align: right }
.actions button { margin-right: 6px }
.error { color: #b00020; margin-top: 8px }
.loading { color: #666 }
.no-data { color: #666 }
</style>
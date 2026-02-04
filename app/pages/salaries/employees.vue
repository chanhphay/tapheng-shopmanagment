<template>
  <div class="container">
    <h1>ຈັດການຂໍ້ມູນພະນັກງານ</h1>
    
    <!-- Employee Form -->
    <div class="employee-form">
      <h2>{{ isEditing ? 'ແກ້ໄຂຂໍ້ມູນພະນັກງານ' : 'ເພີ່ມພະນັກງານໃໝ່' }}</h2>
      <form @submit.prevent="saveEmployee">
        <div class="form-row">
          <div class="form-group">
            <label>ຊື່ - ນາມສະກຸນ: <span class="required">*</span></label>
            <input 
              v-model="form.full_name" 
              type="text" 
              required 
              placeholder="ເຊັ່ນ ນາງ ສົມສີ ໃຈດີ"
            />
          </div>
          
          <div class="form-group">
            <label>ຕຳແໜ່ງ:</label>
            <input 
              v-model="form.position" 
              type="text" 
              placeholder="ເຊັ່ນ ຊ່າງສະກຣີນ, ແອັດມິນ"
            />
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>ເງິນເດືອນພື້ນຖານ (LAK): <span class="required">*</span></label>
            <input 
              v-model.number="form.salary_rate" 
              type="number" 
              step="0.01"
              min="0"
              required 
              placeholder="0.00"
            />
          </div>
          
          <div class="form-group">
            <label>ເລກບັນຊີທະນາຄານ:</label>
            <input 
              v-model="form.bank_account" 
              type="text" 
              placeholder="xxx-x-xxxxx-x"
            />
          </div>
        </div>
        
        <div class="form-group">
          <label class="checkbox-label">
            <input 
              v-model="form.is_active" 
              type="checkbox"
            />
            <span>ພະນັກງານຍັງເຮັດວຽກຢູ່</span>
          </label>
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn-primary" :disabled="saving">
            <svg v-if="!saving" class="btn-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            <span>{{ isEditing ? 'ບັນທຶກການແກ້ໄຂ' : 'ເພີ່ມພະນັກງານ' }}</span>
          </button>
          <button 
            v-if="isEditing" 
            type="button" 
            class="btn-secondary" 
            @click="cancelEdit"
          >
            ຍົກເລີກ
          </button>
        </div>
      </form>
    </div>

    <!-- Employees List -->
    <div class="employees-list">
      <h2>ລາຍການພະນັກງານ</h2>
      
      <div class="filter-tabs">
        <button 
          :class="['tab-btn', { active: filterActive === 'all' }]" 
          @click="filterActive = 'all'"
        >
          ທັງໝົດ ({{ employees.length }})
        </button>
        <button 
          :class="['tab-btn', { active: filterActive === 'active' }]" 
          @click="filterActive = 'active'"
        >
          ເຮັດວຽກຢູ່ ({{ activeEmployees.length }})
        </button>
        <button 
          :class="['tab-btn', { active: filterActive === 'inactive' }]" 
          @click="filterActive = 'inactive'"
        >
          ອອກແລ້ວ ({{ inactiveEmployees.length }})
        </button>
      </div>
      
      <div v-if="loading" class="loading">ກຳລັງໂຫຼດ...</div>
      <div v-else-if="filteredEmployees.length === 0" class="no-data">
        {{ filterActive === 'all' ? 'ຍັງບໍ່ມີພະນັກງານ' : filterActive === 'active' ? 'ບໍ່ມີພະນັກງານທີ່ເຮັດວຽກຢູ່' : 'ບໍ່ມີພະນັກງານທີ່ອອກແລ້ວ' }}
      </div>
      <div v-else class="table-container">
        <table>
          <thead>
            <tr>
              <th>ຊື່ - ນາມສະກຸນ</th>
              <th>ຕຳແໜ່ງ</th>
              <th class="text-right">ເງິນເດືອນ (LAK)</th>
              <th>ເລກບັນຊີ</th>
              <th>ສະຖານະ</th>
              <th>ສ້າງເມື່ອ</th>
              <th>ຈັດການ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="employee in filteredEmployees" :key="employee.id" :class="{ inactive: !employee.is_active }">
              <td class="employee-name">{{ employee.full_name }}</td>
              <td>{{ employee.position || '-' }}</td>
              <td class="text-right">{{ formatNumber(employee.salary_rate) }}</td>
              <td class="bank-account">{{ employee.bank_account || '-' }}</td>
              <td>
                <span :class="['status-badge', employee.is_active ? 'active' : 'inactive']">
                  {{ employee.is_active ? '✓ ເຮັດວຽກຢູ່' : '✗ ອອກແລ້ວ' }}
                </span>
              </td>
              <td>{{ formatDate(employee.created_at) }}</td>
              <td class="actions">
                <button 
                  class="btn-edit" 
                  @click="editEmployee(employee)"
                  title="ແກ້ໄຂ"
                >
                  ✏️
                </button>
                <button 
                  class="btn-delete" 
                  @click="deleteEmployee(employee.id)"
                  title="ລົບ"
                >
                  🗑️
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
const supabase = useSupabaseClient()

const employees = ref([])
const loading = ref(true)
const saving = ref(false)
const error = ref(null)
const isEditing = ref(false)
const editingId = ref(null)
const filterActive = ref('active')

const form = ref({
  full_name: '',
  position: '',
  salary_rate: 0,
  bank_account: '',
  is_active: true
})

const activeEmployees = computed(() => employees.value.filter(e => e.is_active))
const inactiveEmployees = computed(() => employees.value.filter(e => !e.is_active))

const filteredEmployees = computed(() => {
  if (filterActive.value === 'active') return activeEmployees.value
  if (filterActive.value === 'inactive') return inactiveEmployees.value
  return employees.value
})

async function fetchEmployees() {
  try {
    loading.value = true
    error.value = null
    
    const { data, error: fetchError } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (fetchError) throw fetchError
    
    employees.value = data || []
  } catch (err) {
    console.error('Error fetching employees:', err)
    error.value = 'ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ: ' + err.message
  } finally {
    loading.value = false
  }
}

async function saveEmployee() {
  try {
    saving.value = true
    error.value = null
    
    if (isEditing.value) {
      const { error: updateError } = await supabase
        .from('employees')
        .update({
          full_name: form.value.full_name,
          position: form.value.position,
          salary_rate: form.value.salary_rate,
          bank_account: form.value.bank_account,
          is_active: form.value.is_active
        })
        .eq('id', editingId.value)
      
      if (updateError) throw updateError
    } else {
      const { error: insertError } = await supabase
        .from('employees')
        .insert([{
          full_name: form.value.full_name,
          position: form.value.position,
          salary_rate: form.value.salary_rate,
          bank_account: form.value.bank_account,
          is_active: form.value.is_active
        }])
      
      if (insertError) throw insertError
    }
    
    await fetchEmployees()
    resetForm()
  } catch (err) {
    console.error('Error saving employee:', err)
    error.value = 'ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກ: ' + err.message
  } finally {
    saving.value = false
  }
}

function editEmployee(employee) {
  isEditing.value = true
  editingId.value = employee.id
  form.value = {
    full_name: employee.full_name,
    position: employee.position || '',
    salary_rate: employee.salary_rate || 0,
    bank_account: employee.bank_account || '',
    is_active: employee.is_active
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function cancelEdit() {
  resetForm()
}

function resetForm() {
  isEditing.value = false
  editingId.value = null
  form.value = {
    full_name: '',
    position: '',
    salary_rate: 0,
    bank_account: '',
    is_active: true
  }
}

async function deleteEmployee(id) {
  if (!confirm('ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລົບພະນັກງານນີ້?')) return
  
  try {
    error.value = null
    
    const { error: deleteError } = await supabase
      .from('employees')
      .delete()
      .eq('id', id)
    
    if (deleteError) throw deleteError
    
    await fetchEmployees()
  } catch (err) {
    console.error('Error deleting employee:', err)
    error.value = 'ເກີດຂໍ້ຜິດພາດໃນການລົບ: ' + err.message
  }
}

function formatNumber(value) {
  return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value || 0)
}

function formatDate(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('th-TH', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  }).format(date)
}

onMounted(() => {
  fetchEmployees()
})
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #2d3748;
  margin-bottom: 30px;
  font-family: 'Phetsarath-OT', sans-serif;
  font-size: 2rem;
}

h2 {
  color: #4a5568;
  margin-bottom: 20px;
  font-family: 'Phetsarath-OT', sans-serif;
  font-size: 1.3rem;
}

.employee-form {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 30px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 8px;
  color: #4a5568;
  font-weight: 500;
  font-family: 'Phetsarath-OT', sans-serif;
}

.required {
  color: #e53e3e;
}

.form-group input[type="text"],
.form-group input[type="number"] {
  padding: 10px 12px;
  border: 1px solid #cbd5e0;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
  font-family: 'Phetsarath-OT', sans-serif;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.form-actions {
  display: flex;
  gap: 15px;
  margin-top: 25px;
}

.btn-primary, .btn-secondary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
  font-family: 'Phetsarath-OT', sans-serif;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #e2e8f0;
  color: #4a5568;
}

.btn-secondary:hover {
  background: #cbd5e0;
}

.btn-icon {
  flex-shrink: 0;
}

.employees-list {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.filter-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.tab-btn {
  padding: 10px 20px;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Phetsarath-OT', sans-serif;
  font-weight: 500;
  transition: all 0.3s;
  color: #4a5568;
}

.tab-btn:hover {
  background: #edf2f7;
}

.tab-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}

.loading, .error, .no-data {
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  font-family: 'Phetsarath-OT', sans-serif;
}

.loading {
  background: #e6fffa;
  color: #234e52;
}

.error {
  background: #fff5f5;
  color: #c53030;
  margin-top: 20px;
}

.no-data {
  background: #f7fafc;
  color: #718096;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

thead {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

th {
  padding: 12px;
  text-align: left;
  font-weight: 600;
  font-family: 'Phetsarath-OT', sans-serif;
  white-space: nowrap;
}

td {
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;
  font-family: 'Phetsarath-OT', sans-serif;
}

tbody tr:hover {
  background-color: #f7fafc;
}

tbody tr.inactive {
  opacity: 0.6;
}

.employee-name {
  font-weight: 600;
  color: #2d3748;
}

.bank-account {
  font-family: monospace;
  color: #4a5568;
}

.text-right {
  text-align: right;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  font-family: 'Phetsarath-OT', sans-serif;
}

.status-badge.active {
  background: #c6f6d5;
  color: #22543d;
}

.status-badge.inactive {
  background: #fed7d7;
  color: #742a2a;
}

.actions {
  display: flex;
  gap: 8px;
}

.btn-edit, .btn-delete {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  padding: 5px 10px;
  border-radius: 6px;
  transition: all 0.3s;
}

.btn-edit:hover {
  background: #edf2f7;
}

.btn-delete:hover {
  background: #fff5f5;
}

@media (max-width: 768px) {
  .container {
    padding: 15px;
  }

  h1 {
    font-size: 1.5rem;
  }

  .employee-form, .employees-list {
    padding: 20px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-primary, .btn-secondary {
    width: 100%;
    justify-content: center;
  }

  table {
    font-size: 12px;
  }

  th, td {
    padding: 8px 6px;
  }
}
</style>

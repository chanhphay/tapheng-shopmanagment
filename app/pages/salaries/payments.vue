<template>
  <div class="container">
    <h1>ບັນທຶກການຈ່າຍເງິນເດືອນ</h1>
    
    <!-- Payment Form -->
    <div class="payment-form">
      <h2>{{ isEditing ? 'ແກ້ໄຂການຈ່າຍເງິນເດືອນ' : 'ບັນທຶກການຈ່າຍເງິນເດືອນ' }}</h2>
      <form @submit.prevent="savePayment">
        <div class="form-row">
          <div class="form-group">
            <label>ເລືອກພະນັກງານ: <span class="required">*</span></label>
            <select v-model="form.employee_id" required @change="onEmployeeChange">
              <option value="">-- ເລືອກພະນັກງານ --</option>
              <option v-for="emp in activeEmployees" :key="emp.id" :value="emp.id">
                {{ emp.full_name }} - {{ emp.position || 'ບໍ່ລະບຸຕຳແໜ່ງ' }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label>ຈ່າຍງວດເດືອນ: <span class="required">*</span></label>
            <input 
              v-model="form.period_month" 
              type="text" 
              required 
              placeholder="ເຊັ່ນ ມັງກອນ 2024"
            />
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>ຍອດເງິນທີ່ຈ່າຍ (LAK): <span class="required">*</span></label>
            <input 
              v-model.number="form.amount" 
              type="number" 
              step="0.01"
              min="0"
              required 
              placeholder="0.00"
            />
            <small v-if="selectedEmployee" class="hint">
              ເງິນເດືອນພື້ນຖານ: {{ formatNumber(selectedEmployee.salary_rate) }} LAK
            </small>
          </div>
          
          <div class="form-group">
            <label>ວັນທີ່ຈ່າຍ: <span class="required">*</span></label>
            <input 
              v-model="form.payment_date" 
              type="date" 
              required 
            />
          </div>
        </div>
        
        <div class="form-group">
          <label>ໝາຍເຫດ:</label>
          <textarea 
            v-model="form.remark" 
            rows="3"
            placeholder="ເຊັ່ນ ລວມຄ່າໂອທີ 2 ຊົ່ວໂມງ, ຫັກປະກັນສັງຄົມ"
          ></textarea>
        </div>
        
        <div class="form-group">
          <label>URL ຮູບສະລິບ:</label>
          <input 
            v-model="form.slip_url" 
            type="text" 
            placeholder="https://..."
          />
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn-primary" :disabled="saving">
            <svg v-if="!saving" class="btn-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            <span>{{ isEditing ? 'ບັນທຶກການແກ້ໄຂ' : 'ບັນທຶກການຈ່າຍ' }}</span>
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

    <!-- Payments List -->
    <div class="payments-list">
      <div class="list-header">
        <h2>ປະຫວັດການຈ່າຍເງິນເດືອນ</h2>
        <div class="filter-group">
          <select v-model="filterEmployeeId" class="filter-select">
            <option value="">ທຸກຄົນ</option>
            <option v-for="emp in allEmployees" :key="emp.id" :value="emp.id">
              {{ emp.full_name }}
            </option>
          </select>
        </div>
      </div>
      
      <div v-if="loading" class="loading">ກຳລັງໂຫຼດ...</div>
      <div v-else-if="filteredPayments.length === 0" class="no-data">
        ຍັງບໍ່ມີການບັນທຶກການຈ່າຍເງິນເດືອນ
      </div>
      <div v-else class="table-container">
        <table>
          <thead>
            <tr>
              <th>ວັນທີ່ຈ່າຍ</th>
              <th>ພະນັກງານ</th>
              <th>ງວດເດືອນ</th>
              <th class="text-right">ຍອດເງິນ (LAK)</th>
              <th>ໝາຍເຫດ</th>
              <th>ສະລິບ</th>
              <th>ຈັດການ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="payment in filteredPayments" :key="payment.id">
              <td>{{ formatDate(payment.payment_date) }}</td>
              <td class="employee-info">
                <div class="name">{{ payment.employee?.full_name || '-' }}</div>
                <div class="position">{{ payment.employee?.position || '-' }}</div>
              </td>
              <td>{{ payment.period_month }}</td>
              <td class="text-right amount">{{ formatNumber(payment.amount) }}</td>
              <td class="remark">{{ payment.remark || '-' }}</td>
              <td>
                <a v-if="payment.slip_url" :href="payment.slip_url" target="_blank" class="slip-link">
                  🔗 ເບິ່ງສະລິບ
                </a>
                <span v-else>-</span>
              </td>
              <td class="actions">
                <button 
                  class="btn-edit" 
                  @click="editPayment(payment)"
                  title="ແກ້ໄຂ"
                >
                  ✏️
                </button>
                <button 
                  class="btn-delete" 
                  @click="deletePayment(payment.id)"
                  title="ລົບ"
                >
                  🗑️
                </button>
              </td>
            </tr>
          </tbody>
          <tfoot v-if="filteredPayments.length > 0">
            <tr class="summary-row">
              <td colspan="3"><strong>ລວມທັງໝົດ</strong></td>
              <td class="text-right"><strong>{{ formatNumber(totalAmount) }} LAK</strong></td>
              <td colspan="3"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
const supabase = useSupabaseClient()

const payments = ref([])
const allEmployees = ref([])
const loading = ref(true)
const saving = ref(false)
const error = ref(null)
const isEditing = ref(false)
const editingId = ref(null)
const filterEmployeeId = ref('')

const form = ref({
  employee_id: '',
  amount: 0,
  payment_date: new Date().toISOString().slice(0, 10),
  period_month: '',
  remark: '',
  slip_url: ''
})

const activeEmployees = computed(() => 
  allEmployees.value.filter(e => e.is_active)
)

const selectedEmployee = computed(() => 
  allEmployees.value.find(e => e.id === form.value.employee_id)
)

const filteredPayments = computed(() => {
  if (!filterEmployeeId.value) return payments.value
  return payments.value.filter(p => p.employee_id === filterEmployeeId.value)
})

const totalAmount = computed(() => 
  filteredPayments.value.reduce((sum, p) => sum + (p.amount || 0), 0)
)

async function fetchEmployees() {
  try {
    const { data, error: fetchError } = await supabase
      .from('employees')
      .select('*')
      .order('full_name')
    
    if (fetchError) throw fetchError
    
    allEmployees.value = data || []
  } catch (err) {
    console.error('Error fetching employees:', err)
    error.value = 'ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນພະນັກງານ: ' + err.message
  }
}

async function fetchPayments() {
  try {
    loading.value = true
    error.value = null
    
    const { data, error: fetchError } = await supabase
      .from('salary_payments')
      .select(`
        *,
        employee:employees(id, full_name, position, salary_rate)
      `)
      .order('payment_date', { ascending: false })
    
    if (fetchError) throw fetchError
    
    payments.value = data || []
  } catch (err) {
    console.error('Error fetching payments:', err)
    error.value = 'ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ: ' + err.message
  } finally {
    loading.value = false
  }
}

function onEmployeeChange() {
  if (selectedEmployee.value && !isEditing.value) {
    form.value.amount = selectedEmployee.value.salary_rate || 0
  }
}

async function savePayment() {
  try {
    saving.value = true
    error.value = null
    
    const paymentData = {
      employee_id: form.value.employee_id,
      amount: form.value.amount,
      payment_date: form.value.payment_date,
      period_month: form.value.period_month,
      remark: form.value.remark,
      slip_url: form.value.slip_url || null
    }
    
    if (isEditing.value) {
      const { error: updateError } = await supabase
        .from('salary_payments')
        .update(paymentData)
        .eq('id', editingId.value)
      
      if (updateError) throw updateError
    } else {
      const { error: insertError } = await supabase
        .from('salary_payments')
        .insert([paymentData])
      
      if (insertError) throw insertError
    }
    
    await fetchPayments()
    resetForm()
  } catch (err) {
    console.error('Error saving payment:', err)
    error.value = 'ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກ: ' + err.message
  } finally {
    saving.value = false
  }
}

function editPayment(payment) {
  isEditing.value = true
  editingId.value = payment.id
  form.value = {
    employee_id: payment.employee_id,
    amount: payment.amount,
    payment_date: payment.payment_date,
    period_month: payment.period_month,
    remark: payment.remark || '',
    slip_url: payment.slip_url || ''
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
    employee_id: '',
    amount: 0,
    payment_date: new Date().toISOString().slice(0, 10),
    period_month: '',
    remark: '',
    slip_url: ''
  }
}

async function deletePayment(id) {
  if (!confirm('ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລົບການບັນທຶກນີ້?')) return
  
  try {
    error.value = null
    
    const { error: deleteError } = await supabase
      .from('salary_payments')
      .delete()
      .eq('id', id)
    
    if (deleteError) throw deleteError
    
    await fetchPayments()
  } catch (err) {
    console.error('Error deleting payment:', err)
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

onMounted(async () => {
  await fetchEmployees()
  await fetchPayments()
})
</script>

<style scoped>
.container {
  max-width: 1400px;
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

.payment-form {
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

.form-group input,
.form-group select,
.form-group textarea {
  padding: 10px 12px;
  border: 1px solid #cbd5e0;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
  font-family: 'Phetsarath-OT', sans-serif;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.hint {
  margin-top: 5px;
  color: #718096;
  font-size: 12px;
  font-family: 'Phetsarath-OT', sans-serif;
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

.payments-list {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.filter-group {
  display: flex;
  gap: 10px;
  align-items: center;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #cbd5e0;
  border-radius: 6px;
  font-family: 'Phetsarath-OT', sans-serif;
  min-width: 200px;
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

.employee-info .name {
  font-weight: 600;
  color: #2d3748;
}

.employee-info .position {
  font-size: 12px;
  color: #718096;
  margin-top: 2px;
}

.text-right {
  text-align: right;
}

.amount {
  font-weight: 600;
  color: #2d3748;
}

.remark {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.slip-link {
  color: #667eea;
  text-decoration: none;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.slip-link:hover {
  text-decoration: underline;
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

.summary-row {
  background-color: #f7fafc;
  font-weight: bold;
  border-top: 2px solid #667eea;
}

.summary-row td {
  padding: 15px 12px;
  font-family: 'Phetsarath-OT', sans-serif;
}

@media (max-width: 768px) {
  .container {
    padding: 15px;
  }

  h1 {
    font-size: 1.5rem;
  }

  .payment-form, .payments-list {
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

  .list-header {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-select {
    width: 100%;
  }

  table {
    font-size: 12px;
  }

  th, td {
    padding: 8px 6px;
  }
}
</style>

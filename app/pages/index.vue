<template>
  <div class="container">
    <h1>ຈັດການສິນຄ້າ (Products Management)</h1>
    
    <!-- ຟອມເພີ່ມ/ແກ້ໄຂສິນຄ້າ -->
    <div class="product-form">
      <h2>{{ isEditing ? 'ແກ້ໄຂສິນຄ້າ' : 'ເພີ່ມສິນຄ້າໃໝ່' }}</h2>
      <form @submit.prevent="saveProduct">
        <div class="form-group">
          <label>ຊື່ສິນຄ້າ:</label>
          <input 
            v-model="form.name" 
            type="text" 
            required 
            placeholder="ເຊັ່ນ Body Suit ແຂນສັ້ນ"
          />
        </div>
        
        <div class="form-row">
          <div class="form-group">  
            <label>ຕົ້ນທືນ (LAK):</label>
            <input 
              v-model.number="form.base_cost" 
              type="number" 
              step="0.01"
              min="0"
              required 
            />
          </div>
          
          <div class="form-group">
            <label>ລາຄາຂາຍ (LAK ):</label>
            <input 
              v-model.number="form.base_price" 
              type="number" 
              step="0.01"
              min="0"
              required 
            />
          </div>
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn-primary">
            {{ isEditing ? 'ບັນທຶກການແກ້ໄຂ' : 'ເພີ່ມສິນຄ້າ' }}
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

    <!-- ตารางแสดงสินค้า -->
    <div class="products-list">
      <h2>ລາຍການສິນຄ້າ</h2>
      <div v-if="loading" class="loading">ກຳລັງໂຫຼດ...</div>
      <div v-else-if="products.length === 0" class="no-data">ຍັງບໍ່ມີສິນຄ້າ</div>
      <div v-else class="table-container">
      <table>
        <thead>
          <tr>
            <th>ຊື່ສິນຄ້າ</th>
            <th>ຕົ້ນທືນ (LAK)</th>
            <th>ລາຄາຂາຍ (LAK)</th>
            <th>ກຳໄລ (LAK)</th>
            <th>ສ້າງເມື່ອ</th>
            <th>ຈັດການ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.id">
            <td>{{ product.name }}</td>
            <td class="text-right">{{ formatNumber(product.base_cost) }}</td>
            <td class="text-right">{{ formatNumber(product.base_price) }}</td>
            <td class="text-right profit">
              {{ formatNumber(product.base_price - product.base_cost) }}
            </td>
            <td>{{ formatDate(product.created_at) }}</td>
            <td class="actions">
              <button 
                class="btn-edit" 
                @click="editProduct(product)"
                title="ແກ້ໄຂ"
              >
                ✏️
              </button>
              <button 
                class="btn-delete" 
                @click="deleteProduct(product.id)"
                title="ລົບ"
              >
                🗑️
              </button>
              <button 
                class="btn-variants" 
                @click="manageVariants(product.id)"
                title="ຈັດການສີ/ສະຕ໋ອກ"
              >
                📦
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>

    <!-- แสดงข้อผิดพลาด -->
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})

const supabase = useSupabaseClient()

// State
const products = ref([])
const loading = ref(true)
const error = ref(null)
const isEditing = ref(false)
const editingId = ref(null)

const form = ref({
  name: '',
  base_cost: 0,
  base_price: 0
})

// Debug logging
console.log('Index page loaded')
console.log('Supabase client:', supabase ? 'initialized' : 'not initialized')

// ดึงข้อมูลสินค้าทั้งหมด
async function fetchProducts() {
  try {
    console.log('Fetching products...')
    loading.value = true
    error.value = null
    
    if (!supabase) {
      throw new Error('Supabase client not initialized')
    }
    
    const { data, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (fetchError) throw fetchError
    
    console.log('Products loaded:', data?.length || 0)
    products.value = data || []
  } catch (err) {
    error.value = 'ບໍ່ສາມາດໂຫຼດຂໍ້ມູນສິນຄ້າໄດ້: ' + err.message
    console.error('Error fetching products:', err)
  } finally {
    loading.value = false
  }
}

// บันทึกสินค้า (เพิ่มหรือแก้ไข)
async function saveProduct() {
  try {
    error.value = null
    
    if (isEditing.value) {
      // แก้ไขสินค้า
      const { error: updateError } = await supabase
        .from('products')
        .update({
          name: form.value.name,
          base_cost: form.value.base_cost,
          base_price: form.value.base_price
        })
        .eq('id', editingId.value)
      
      if (updateError) throw updateError
    } else {
      // เพิ่มสินค้าใหม่
      const { error: insertError } = await supabase
        .from('products')
        .insert([{
          name: form.value.name,
          base_cost: form.value.base_cost,
          base_price: form.value.base_price
        }])
      
      if (insertError) throw insertError
    }
    
    // รีเซ็ตฟอร์มและโหลดข้อมูลใหม่
    resetForm()
    await fetchProducts()
  } catch (err) {
    error.value = 'ບໍ່ສາມາດບັນທຶກສິນຄ້າໄດ້: ' + err.message
    console.error('Error saving product:', err)
  }
}

// แก้ไขสินค้า
function editProduct(product) {
  isEditing.value = true
  editingId.value = product.id
  form.value = {
    name: product.name,
    base_cost: product.base_cost,
    base_price: product.base_price
  }
  // เลื่อนไปที่ฟอร์ม
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ยกเลิกการแก้ไข
function cancelEdit() {
  resetForm()
}

// ลบสินค้า
async function deleteProduct(id) {
  if (!confirm('ທ່ານຕ້ອງການລົບສິນຄ້ານີ້ແມ່ນບໍ?')) return
  
  try {
    error.value = null
    
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
    
    if (deleteError) throw deleteError
    
    await fetchProducts()
  } catch (err) {
    error.value = 'ບໍ່ສາມາດລົບສິນຄ້າໄດ້: ' + err.message
    console.error('Error deleting product:', err)
  }
}

// จัดการ variants (ยังไม่ได้ implement)
function manageVariants(productId) {
  // TODO: นำไปหน้าจัดการ variants
  navigateTo(`/products/${productId}/variants`)
}

// รีเซ็ตฟอร์ม
function resetForm() {
  isEditing.value = false
  editingId.value = null
  form.value = {
    name: '',
    base_cost: 0,
    base_price: 0
  }
}

// ฟอร์แมตตัวเลข
function formatNumber(value) {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

// ฟอร์แมตวันที่
function formatDate(date) {
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  
  return `${day}-${month}-${year} ${hours}:${minutes}`
}

// โหลดข้อมูลเมื่อเริ่มต้น
onMounted(() => {
  fetchProducts()
})
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #333;
  margin-bottom: 30px;
}

h2 {
  color: #555;
  margin-bottom: 20px;
  font-size: 1.3rem;
}

/* ฟอร์ม */
.product-form {
  background: #f9f9f9;
  padding: 25px;
  border-radius: 8px;
  margin-bottom: 40px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.form-group {
  margin-bottom: 15px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #555;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  font-family: 'Phetsarath-OT', sans-serif;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #4CAF50;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

button {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-family: 'Phetsarath-OT', sans-serif;
  transition: all 0.2s;
  min-height: 48px;
  min-width: 48px;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
}

.btn-primary:hover {
  background-color: #45a049;
}

.btn-primary:active {
  background-color: #3d8b40;
  transform: scale(0.98);
}

.btn-secondary {
  background-color: #999;
  color: white;
}

.btn-secondary:hover {
  background-color: #777;
}

.btn-secondary:active {
  background-color: #666;
  transform: scale(0.98);
}

/* ตาราง */
.products-list {
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background-color: #f0f0f0;
}

th {
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #555;
  border-bottom: 2px solid #ddd;
}

td {
  padding: 12px;
  border-bottom: 1px solid #eee;
}

.text-right {
  text-align: right;
}

.profit {
  color: #4CAF50;
  font-weight: 600;
}

.actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.btn-edit, .btn-delete, .btn-variants {
  padding: 8px 12px;
  font-size: 1.3rem;
  background: white;
  border: 1px solid #ddd;
  cursor: pointer;
  border-radius: 6px;
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  -webkit-tap-highlight-color: transparent;
}

.btn-edit:hover {
  background-color: #e3f2fd;
  border-color: #2196F3;
}

.btn-edit:active {
  background-color: #bbdefb;
  transform: scale(0.95);
}

.btn-delete:hover {
  background-color: #ffebee;
  border-color: #f44336;
}

.btn-delete:active {
  background-color: #ffcdd2;
  transform: scale(0.95);
}

.btn-variants:hover {
  background-color: #fff3e0;
  border-color: #ff9800;
}

.btn-variants:active {
  background-color: #ffe0b2;
  transform: scale(0.95);
}

/* สถานะ */
.loading, .no-data {
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 1.1rem;
}

.error {
  background-color: #ffebee;
  color: #c62828;
  padding: 15px;
  border-radius: 4px;
  margin-top: 20px;
  border-left: 4px solid #c62828;
}

/* Responsive - Tablet and iPad */
@media (max-width: 1024px) and (min-width: 769px) {
  .container {
    padding: 20px;
  }
  
  .product-form {
    padding: 25px;
  }
  
  button {
    padding: 14px 28px;
    font-size: 1.05rem;
    min-height: 50px;
  }
  
  .btn-edit, .btn-delete, .btn-variants {
    min-width: 48px;
    min-height: 48px;
    padding: 10px 14px;
  }
  
  .table-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 12px;
  }
  
  h1 {
    font-size: 1.5rem;
    margin-bottom: 20px;
  }
  
  .product-form {
    padding: 18px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .form-actions {
    flex-direction: column;
    gap: 12px;
  }
  
  .form-actions button {
    width: 100%;
  }
  
  .table-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    margin: 0 -12px;
    padding: 0 12px;
  }
  
  table {
    font-size: 0.9rem;
    min-width: 600px;
  }
  
  th, td {
    padding: 10px 8px;
  }
  
  .actions {
    gap: 8px;
  }
  
  .btn-edit, .btn-delete, .btn-variants {
    min-width: 48px;
    min-height: 48px;
    font-size: 1.4rem;
  }
  
  button {
    font-size: 1rem;
    padding: 14px 20px;
    min-height: 50px;
  }
  
  input {
    font-size: 1rem;
    padding: 12px;
    min-height: 48px;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 10px;
  }
  
  h1 {
    font-size: 1.4rem;
    margin-bottom: 15px;
  }
  
  .product-form {
    padding: 15px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .form-actions button {
    width: 100%;
    min-height: 52px;
  }
  
  .table-container {
    margin: 0 -10px;
    padding: 0 10px;
  }
  
  table {
    font-size: 0.85rem;
    min-width: 550px;
  }
  
  th, td {
    padding: 8px 5px;
    white-space: nowrap;
  }
  
  .actions {
    gap: 6px;
  }
  
  .btn-edit, .btn-delete, .btn-variants {
    min-width: 46px;
    min-height: 46px;
    padding: 8px 10px;
    font-size: 1.3rem;
  }
  
  button {
    font-size: 0.95rem;
    padding: 12px 18px;
    min-height: 50px;
  }
  
  input {
    font-size: 1rem;
    padding: 12px;
    min-height: 48px;
  }
}
</style>

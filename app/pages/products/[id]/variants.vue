<template>
  <div class="container">
    <div class="header">
      <button class="btn-back" @click="navigateTo('/')">← กลับ</button>
      <h1>ຈັດການສະຕ໋ອກ</h1>
    </div>

    <!-- ข้อมูลสินค้า -->
    <div v-if="product" class="product-info">
      <h2>{{ product.name }}</h2>
      <div class="info-grid">
        <div>
          <span class="label">ຕົ້ນທືນ:</span>
          <span class="value">{{ formatNumber(product.base_cost) }} บาท</span>
        </div>
        <div>
          <span class="label">ລາຄາຂາຍ:</span>
          <span class="value">{{ formatNumber(product.base_price) }} บาท</span>
        </div>
      </div>
    </div>

    <!-- ฟอร์มเพิ่ม/แก้ไข variant -->
    <div class="variant-form">
      <h3>{{ isEditing ? 'ແກ້ໄຂສີນຄ້າ' : 'ເພີ່ມສີນຄ້າໃໝ່' }}</h3>
      <form @submit.prevent="saveVariant">
        <div class="form-row">
          <div class="form-group">
            <label>ສີ/ແບບ:</label>
            <input 
              v-model="form.color" 
              type="text" 
              required 
              placeholder="ເຊັ່ນ ຂາວຂອບແດງ, ຟ້າ"
            />
          </div>
          
          <div class="form-group">
            <label>ຂະໜາດ:</label>
            <input 
              v-model="form.size" 
              type="text" 
              required 
              placeholder="S, M, L, XL"
              @input="form.size = form.size.toUpperCase()"
            />
          </div>
          
          <div class="form-group">
            <label>ຈຳນວນໃນສະຕ໋ອກ:</label>
            <input 
              v-model.number="form.stock_qty" 
              type="number" 
              min="0"
              required 
            />
          </div>
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn-primary">
            {{ isEditing ? 'ບັນທຶກການແກ້ໄຂ' : 'ເພີ່ມສີ/ແບບໃໝ່' }}
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

    <!-- ตารางแสดง variants -->
    <div class="variants-list">
      <h3>ລາຍການສີ/ແບບທັງໝົດ</h3>
      <div v-if="loading" class="loading">ກຳລັງໂຫຼດ...</div>
      <div v-else-if="variants.length === 0" class="no-data">
        ຍັງບໍ່ມີສີ/ແບບ ກະລຸນາເພີ່ມໃໝ່
      </div>
      <table v-else>
        <thead>
          <tr>
            <th>ສີ/ແບບ</th>
            <th>ຂະໜາດ</th>
            <th>ຈຳນວນໃນສະຕ໋ອກ</th>
            <th>ສະຖານະ</th>
            <th>ອັບເດດລ່າສຸດ</th>
            <th>ຈັດການ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="variant in variants" :key="variant.id">
            <td class="color-name">{{ variant.color }}</td>
            <td class="size-name">{{ variant.size }}</td>
            <td class="stock-qty">
              <span :class="getStockClass(variant.stock_qty)">
                {{ variant.stock_qty }}
              </span>
            </td>
            <td>
              <span :class="getStatusClass(variant.stock_qty)">
                {{ getStockStatus(variant.stock_qty) }}
              </span>
            </td>
            <td>{{ formatDate(variant.updated_at) }}</td>
            <td class="actions">
              <button 
                class="btn-edit" 
                @click="editVariant(variant)"
                title="ແກ້ໄຂ"
              >
                ✏️
              </button>
              <button 
                class="btn-delete" 
                @click="deleteVariant(variant.id)"
                title="ລຶບ"
              >
                🗑️
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- สรุปสต็อกรวม -->
      <div v-if="variants.length > 0" class="summary">
        <strong>ສະຫຼຸບສະຕ໋ອກລວມ:</strong> {{ totalStock }} ຊຸດ
      </div>
    </div>

    <!-- แสดงข้อผิดพลาด -->
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script setup>
const route = useRoute()
const supabase = useSupabaseClient()
const productId = route.params.id

// State
const product = ref(null)
const variants = ref([])
const loading = ref(true)
const error = ref(null)
const isEditing = ref(false)
const editingId = ref(null)

const form = ref({
  color: '',
  size: '',
  stock_qty: 0
})

// Computed
const totalStock = computed(() => {
  return variants.value.reduce((sum, v) => sum + v.stock_qty, 0)
})

// ดึงข้อมูลสินค้า
async function fetchProduct() {
  try {
    const { data, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single()
    
    if (fetchError) throw fetchError
    product.value = data
  } catch (err) {
    error.value = 'ບໍ່ສາມາດໂຫລດຂໍ້ມູນສິນຄ້າໄດ້: ' + err.message
    console.error('Error fetching product:', err)
  }
}

// ดึงข้อมูล variants
async function fetchVariants() {
  try {
    loading.value = true
    error.value = null
    
    const { data, error: fetchError } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .order('color', { ascending: true })
    
    if (fetchError) throw fetchError
    
    variants.value = data || []
  } catch (err) {
    error.value = 'ບໍ່ສາມາດໂຫຼດຂໍ້ມູນສີ/ແບບໄດ້: ' + err.message
    console.error('Error fetching variants:', err)
  } finally {
    loading.value = false
  }
}

// บันทึก variant
async function saveVariant() {
  try {
    error.value = null
    
    if (isEditing.value) {
      // แก้ไข variant
      const { error: updateError } = await supabase
        .from('product_variants')
        .update({
          color: form.value.color,
          size: form.value.size,
          stock_qty: form.value.stock_qty
        })
        .eq('id', editingId.value)
      
      if (updateError) throw updateError
    } else {
      // เพิ่ม variant ใหม่
      const { error: insertError } = await supabase
        .from('product_variants')
        .insert([{
          product_id: productId,
          color: form.value.color,
          size: form.value.size,
          stock_qty: form.value.stock_qty
        }])
      
      if (insertError) throw insertError
    }
    
    resetForm()
    await fetchVariants()
  } catch (err) {
    error.value = 'ບໍ່ສາມາດບັນທຶກສີ/ແບບໄດ້: ' + err.message
    console.error('Error saving variant:', err)
  }
}

// แก้ไข variant
function editVariant(variant) {
  isEditing.value = true
  editingId.value = variant.id
  form.value = {
    color: variant.color,
    size: variant.size,
    stock_qty: variant.stock_qty
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ยกเลิกการแก้ไข
function cancelEdit() {
  resetForm()
}

// ลบ variant
async function deleteVariant(id) {
  if (!confirm('ທ່ານຕ້ອງການລົບສີ/ແບບນີ້ແມ່ນບໍ?')) return
  
  try {
    error.value = null
    
    const { error: deleteError } = await supabase
      .from('product_variants')
      .delete()
      .eq('id', id)
    
    if (deleteError) throw deleteError
    
    await fetchVariants()
  } catch (err) {
    error.value = 'ບໍ່ສາມາດລົບສີ/ແບບໄດ້: ' + err.message
    console.error('Error deleting variant:', err)
  }
}

// ກູ້ຄືນແບບ
function resetForm() {
  isEditing.value = false
  editingId.value = null
  form.value = {
    color: '',
    size: '',
    stock_qty: 0
  }
}

// ຟັງກຊັນຊ່ວຍ
function formatNumber(value) {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

function formatDate(date) {
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  };
  const formattedDate = new Date(date).toLocaleString('th-TH', options);
  return formattedDate.replace(',', '');
}

function getStockStatus(qty) {
  if (qty === 0) return 'ຫມົດສະຕ໋ອກ'
  if (qty < 5) return 'ໃກ້ຫມົດ'
  return 'ພ້ອມຂາຍ'
}

function getStatusClass(qty) {
  if (qty === 0) return 'status-out'
  if (qty < 5) return 'status-low'
  return 'status-ok'
}

function getStockClass(qty) {
  if (qty === 0) return 'qty-out'
  if (qty < 5) return 'qty-low'
  return 'qty-ok'
}

// โหลดข้อมูลเมื่อเริ่มต้น
onMounted(async () => {
  await fetchProduct()
  await fetchVariants()
})
</script>

<style scoped>
.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}

.btn-back {
  padding: 8px 16px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.btn-back:hover {
  background-color: #e0e0e0;
}

h1 {
  color: #333;
  margin: 0;
}

h3 {
  color: #555;
  margin-bottom: 15px;
}

/* ข้อมูลสินค้า */
.product-info {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.product-info h2 {
  margin: 0 0 15px 0;
  font-size: 1.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.label {
  font-weight: 600;
  margin-right: 10px;
}

.value {
  font-size: 1.1rem;
}

/* ฟอร์ม */
.variant-form {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 15px;
}

.form-group {
  margin-bottom: 10px;
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
  font-family: 'Phetsarath OT', sans-serif;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #667eea;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-family: 'Phetsarath OT', sans-serif;
  transition: all 0.3s;
}

.btn-primary {
  background-color: #667eea;
  color: white;
}

.btn-primary:hover {
  background-color: #5568d3;
}

.btn-secondary {
  background-color: #999;
  color: white;
}

.btn-secondary:hover {
  background-color: #777;
}

/* ตาราง */
.variants-list {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
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

.color-name {
  font-weight: 600;
  color: #333;
}

.stock-qty {
  text-align: center;
  font-weight: 600;
  font-size: 1.1rem;
}

 qty-ok {
  color: #4CAF50;
}

 qty-low {
  color: #FF9800;
}

 qty-out {
  color: #f44336;
}

.status-ok {
  background-color: #E8F5E9;
  color: #2E7D32;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-low {
  background-color: #FFF3E0;
  color: #E65100;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-out {
  background-color: #FFEBEE;
  color: #C62828;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
}

.actions {
  display: flex;
  gap: 5px;
}

.btn-edit, .btn-delete {
  padding: 5px 10px;
  font-size: 1.2rem;
  background: transparent;
  border: 1px solid #ddd;
  cursor: pointer;
  border-radius: 4px;
}

.btn-edit:hover {
  background-color: #e3f2fd;
}

.btn-delete:hover {
  background-color: #ffebee;
}

/* สรุป */
.summary {
  padding: 15px;
  background-color: #f0f0f0;
  border-radius: 4px;
  text-align: center;
  font-size: 1.1rem;
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

/* Responsive */
@media (max-width: 1024px) {
  .container {
    padding: 15px;
  }
  
  .product-info, .variant-form, .variants-section {
    padding: 20px;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 10px;
  }
  
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  h1 {
    font-size: 1.3rem;
  }
  
  h2 {
    font-size: 1.1rem;
  }
  
  .btn-back {
    font-size: 0.9rem;
    padding: 6px 12px;
  }
  
  .product-info, .variant-form, .variants-section {
    padding: 15px;
  }
  
  .form-row, .info-grid {
    grid-template-columns: 1fr;
  }
  
  .table-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  table {
    font-size: 0.8rem;
    min-width: 500px;
  }
  
  th, td {
    padding: 8px 4px;
  }
  
  button {
    font-size: 0.9rem;
  }
  
  input {
    font-size: 0.9rem;
    padding: 8px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .form-actions button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 8px;
  }
  
  h1 {
    font-size: 1.1rem;
  }
  
  .product-info, .variant-form, .variants-section {
    padding: 12px;
  }
  
  table {
    font-size: 0.75rem;
  }
  
  th, td {
    padding: 6px 3px;
  }
  
  button {
    font-size: 0.85rem;
    padding: 6px 12px;
  }
}
</style>

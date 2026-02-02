<template>
  <div class="container">
    <h1>ນຳເຂົ້າສິນຄ້າ</h1>
    
    <!-- Tabs -->
    <div class="tabs">
      <button 
        :class="['tab-btn', { active: activeTab === 'create' }]"
        @click="activeTab = 'create'"
      >
        ➕ ບັນທຶກການນຳເຂົ້າໃໝ່
      </button>
      <button 
        :class="['tab-btn', { active: activeTab === 'list' }]"
        @click="activeTab = 'list'"
      >
        📋 ປະຫວັດການນຳເຂົ້າ
      </button>
    </div>
    
    <!-- ແບບຟອມບັນທຶກການນຳເຂົ້າໃໝ່ -->
    <div class="import-form" v-show="activeTab === 'create'">
      <h2>{{ isEditing ? 'ແກ້ໄຂການນຳເຂົ້າ' : 'ບັນທຶກການນຳເຂົ້າສິນຄ້າໃໝ່' }}</h2>
      <form @submit.prevent="saveImport">
        <!-- ຂໍ້ມູນຜູ້ສະໜອງ -->
        <div class="section">
          <h3>ຂໍ້ມູນການນຳເຂົ້າ</h3>
          <div class="form-row">
            <div class="form-group">
              <label>ຊື່ຮ້ານ/ຜູ້ສະໜອງ: *</label>
              <input 
                v-model="form.supplier_name" 
                type="text" 
                required 
                placeholder="ຊື່ຮ້ານທີ່ສັ່ງສິນຄ້າມາ"
              />
            </div>
            <div class="form-group">
              <label>ວັນທີນຳເຂົ້າ:</label>
              <input 
                v-model="form.import_date" 
                type="datetime-local" 
                required 
              />
            </div>
          </div>
          <div class="form-group">
            <label>ໝາຍເຫດ:</label>
            <textarea 
              v-model="form.notes" 
              rows="2"
              placeholder="ເບີໂທ, ລາຍລະອຽດເພີ່ມເຕີມ..."
            ></textarea>
          </div>
        </div>

        <!-- ລາຍການສິນຄ້າທີ່ນຳເຂົ້າ -->
        <div class="section">
          <h3>ລາຍການສິນຄ້າ</h3>
          <div v-for="(item, index) in form.items" :key="index" class="import-item">
            <div class="item-row">
              <div class="form-group flex-2">
                <label>ສິນຄ້າ:</label>
                <select 
                  v-model="item.variant_id" 
                  @change="handleVariantChange(index)"
                  required
                >
                  <option value="">-- ເລືອກສິນຄ້າ --</option>
                  <optgroup 
                    v-for="product in products" 
                    :key="product.id" 
                    :label="product.name"
                  >
                    <option 
                      v-for="variant in product.variants" 
                      :key="variant.id"
                      :value="variant.id"
                    >
                      {{ variant.color }} - {{ variant.size }}
                    </option>
                  </optgroup>
                </select>
              </div>
              
              <div class="form-group">
                <label>ຈຳນວນ:</label>
                <input 
                  v-model.number="item.quantity_added" 
                  type="number" 
                  min="1"
                  required 
                />
              </div>
              
              <div class="form-group">
                <label>ຕົ້ນທືນ/ອັນ:</label>
                <input 
                  v-model.number="item.cost_per_unit" 
                  type="number" 
                  step="0.01"
                  min="0"
                  required 
                />
              </div>

              <div class="form-group">
                <label>ລວມ:</label>
                <input 
                  :value="formatNumber(item.quantity_added * item.cost_per_unit)" 
                  type="text" 
                  readonly
                  class="readonly"
                />
              </div>

              <button 
                type="button" 
                class="btn-remove" 
                @click="removeItem(index)"
                v-if="form.items.length > 1"
              >
                🗑️
              </button>
            </div>
          </div>
          
          <button type="button" class="btn-add-item" @click="addItem">
            ➕ ເພີ່ມສິນຄ້າ
          </button>
        </div>

        <!-- ສະຫລຸບ -->
        <div class="section">
          <h3>ສະຫລຸບ</h3>
          <div class="form-row">
            <div class="form-group">
              <label>ຍອດລວມທັງໝົດ:</label>
              <input 
                :value="formatNumber(totalCost)" 
                type="text" 
                readonly
                class="readonly grand-total"
              />
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-primary">
            {{ isEditing ? 'ບັນທຶກການແກ້ໄຂ' : 'ບັນທຶກການນຳເຂົ້າ' }}
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

    <!-- ຕາຕະລາງປະຫວັດການນຳເຂົ້າ -->
    <div class="imports-list" v-show="activeTab === 'list'">
      <h2>ປະຫວັດການນຳເຂົ້າສິນຄ້າ</h2>
      
      <div v-if="loading" class="loading">ກຳລັງໂຫລດ...</div>
      <div v-else-if="imports.length === 0" class="no-data">
        ຍັງບໍ່ມີການນຳເຂົ້າສິນຄ້າ
      </div>
      <div v-else>
        <div class="table-info">
          <span>ທັງໝົດ {{ imports.length }} ລາຍການ</span>
        </div>
        
        <div class="table-container">
          <table class="imports-table">
            <thead>
              <tr>
                <th>#</th>
                <th>ວັນທີນຳເຂົ້າ</th>
                <th>ຜູ້ສະໜອງ</th>
                <th>ຍອດລວມ</th>
                <th>ໝາຍເຫດ</th>
                <th>ຈັດການ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(importRecord, index) in imports" :key="importRecord.id">
                <td>{{ index + 1 }}</td>
                <td>{{ formatDate(importRecord.import_date) }}</td>
                <td class="supplier-name">{{ importRecord.supplier_name }}</td>
                <td class="amount">{{ formatNumber(importRecord.total_cost) }}</td>
                <td class="notes-cell">{{ importRecord.notes || '-' }}</td>
                <td class="actions-cell">
                  <button class="btn-detail" @click="viewImport(importRecord.id)" title="ລາຍລະອຽດ">
                    👁️
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- แสดงข้อผิดพลาด -->
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script setup>
const supabase = useSupabaseClient()

// State
const imports = ref([])
const products = ref([])
const loading = ref(true)
const error = ref(null)
const isEditing = ref(false)
const editingId = ref(null)
const activeTab = ref('list')

const form = ref({
  supplier_name: '',
  import_date: new Date().toISOString().slice(0, 16),
  notes: '',
  items: [
    {
      variant_id: '',
      quantity_added: 1,
      cost_per_unit: 0
    }
  ]
})

// Computed
const totalCost = computed(() => {
  return form.value.items.reduce((sum, item) => {
    return sum + (item.quantity_added * item.cost_per_unit)
  }, 0)
})

// ດຶງຂໍ້ມູນສິນຄ້າແລະ variants
async function fetchProducts() {
  try {
    const { data, error: fetchError } = await supabase
      .from('products')
      .select(`
        id,
        name,
        base_cost,
        variants:product_variants(id, color, size, stock_qty)
      `)
      .order('name', { ascending: true })
    
    if (fetchError) throw fetchError
    
    products.value = data || []
  } catch (err) {
    error.value = 'ບໍ່ສາມາດໂຫລດຂໍ້ມູນສິນຄ້າໄດ້: ' + err.message
    console.error('Error fetching products:', err)
  }
}

// ດຶງຂໍ້ມູນການນຳເຂົ້າ
async function fetchImports() {
  try {
    loading.value = true
    error.value = null
    
    const { data, error: fetchError } = await supabase
      .from('stock_imports')
      .select('*')
      .order('import_date', { ascending: false })
    
    if (fetchError) throw fetchError
    
    imports.value = data || []
  } catch (err) {
    error.value = 'ບໍ່ສາມາດໂຫລດຂໍ້ມູນການນຳເຂົ້າໄດ້: ' + err.message
    console.error('Error fetching imports:', err)
  } finally {
    loading.value = false
  }
}

// ບັນທຶກການນຳເຂົ້າ
async function saveImport() {
  try {
    error.value = null
    
    // ຕວວຈສອບວ່າເລືອກສິນຄ້າຄົບທຸກລາຍການ
    for (const item of form.value.items) {
      if (!item.variant_id) {
        error.value = 'ກະລຸນາເລືອກສິນຄ້າໃຫ້ຄົບທຸກລາຍການ'
        return
      }
    }
    
    // ບັນທຶກການນຳເຂົ້າ
    const { data: importData, error: importError } = await supabase
      .from('stock_imports')
      .insert([{
        supplier_name: form.value.supplier_name,
        import_date: form.value.import_date,
        total_cost: totalCost.value,
        notes: form.value.notes || null
      }])
      .select()
    
    if (importError) throw importError
    
    const importId = importData[0].id
    
    // ບັນທຶກລາຍການສິນຄ້າ
    const importItems = form.value.items.map(item => {
      // ຫາ size ຈາກ variant_id
      let size = ''
      for (const product of products.value) {
        const variant = product.variants.find(v => v.id === item.variant_id)
        if (variant) {
          size = variant.size
          break
        }
      }
      
      return {
        import_id: importId,
        variant_id: item.variant_id,
        quantity_added: item.quantity_added,
        size: size,
        cost_per_unit: item.cost_per_unit
      }
    })
    
    const { error: itemsError } = await supabase
      .from('stock_import_items')
      .insert(importItems)
    
    if (itemsError) throw itemsError
    
    // ເພີ່ມສະຕ໋ອກ
    for (const item of form.value.items) {
      const { data: variantData } = await supabase
        .from('product_variants')
        .select('stock_qty')
        .eq('id', item.variant_id)
        .single()
      
      const newStock = variantData.stock_qty + item.quantity_added
      
      const { error: stockError } = await supabase
        .from('product_variants')
        .update({ stock_qty: newStock })
        .eq('id', item.variant_id)
      
      if (stockError) throw stockError
    }
    
    resetForm()
    await fetchImports()
    await fetchProducts()
    activeTab.value = 'list'
    
  } catch (err) {
    error.value = 'ບໍ່ສາມາດບັນທຶກການນຳເຂົ້າໄດ້: ' + err.message
    console.error('Error saving import:', err)
  }
}

// ເບິ່ງລາຍລະອຽດ
function viewImport(id) {
  navigateTo(`/stock-imports/${id}`)
}

// ຟັງກຊັນຊ່ວຍ
function addItem() {
  form.value.items.push({
    variant_id: '',
    quantity_added: 1,
    cost_per_unit: 0
  })
}

function removeItem(index) {
  form.value.items.splice(index, 1)
}

function handleVariantChange(index) {
  const item = form.value.items[index]
  const selectedVariantId = item.variant_id
  
  if (!selectedVariantId) return
  
  // ກວດວ່າມີການເລືອກສິນຄ້ານີ້ແລ້ວບໍ່
  const duplicateIndex = form.value.items.findIndex((i, idx) => 
    idx !== index && i.variant_id === selectedVariantId
  )
  
  if (duplicateIndex !== -1) {
    // ຊອກຫາຊື່ສິນຄ້າ
    let productName = ''
    for (const product of products.value) {
      const variant = product.variants.find(v => v.id === selectedVariantId)
      if (variant) {
        productName = `${product.name} - ${variant.color} - ${variant.size}`
        break
      }
    }
    
    alert(`ສິນຄ້ານີ້ຖືກເລືອກແລ້ວໃນລາຍການທີ່ ${duplicateIndex + 1}\n${productName}`)
    
    // ລ້າງການເລືອກ
    item.variant_id = ''
    item.cost_per_unit = 0
    return
  }
  
  // ອັບເດດຕົ້ນທືນ
  updateItemCost(index)
}

function updateItemCost(index) {
  const item = form.value.items[index]
  if (!item.variant_id) return
  
  // ຫາຕົ້ນທືນຈາກ product
  for (const product of products.value) {
    const variant = product.variants.find(v => v.id === item.variant_id)
    if (variant) {
      item.cost_per_unit = product.base_cost
      break
    }
  }
}

function cancelEdit() {
  resetForm()
}

function resetForm() {
  isEditing.value = false
  editingId.value = null
  form.value = {
    supplier_name: '',
    import_date: new Date().toISOString().slice(0, 16),
    notes: '',
    items: [{
      variant_id: '',
      quantity_added: 1,
      cost_per_unit: 0
    }]
  }
}

function formatNumber(value) {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

function formatDate(date) {
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  
  return `${day}-${month}-${year} ${hours}:${minutes}`
}

// โหลດข้อมูลเมื่อเริ่มต้น
onMounted(async () => {
  await fetchProducts()
  await fetchImports()
})
</script>

<style scoped>
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #333;
  margin-bottom: 30px;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 0;
  margin-bottom: 30px;
  border-bottom: 2px solid #e0e0e0;
}

.tab-btn {
  padding: 12px 24px;
  background-color: transparent;
  color: #666;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 600;
  transition: all 0.3s;
  border-radius: 0;
}

.tab-btn:hover {
  background-color: #f5f5f5;
  color: #667eea;
}

.tab-btn.active {
  color: #667eea;
  border-bottom-color: #667eea;
  background-color: transparent;
}

h2 {
  color: #555;
  margin-bottom: 20px;
  font-size: 1.3rem;
}

h3 {
  color: #666;
  margin-bottom: 15px;
  font-size: 1.1rem;
}

/* ຟອມ */
.import-form {
  background: #fff;
  padding: 25px;
  border-radius: 8px;
  margin-bottom: 40px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.section {
  margin-bottom: 25px;
  padding-bottom: 25px;
  border-bottom: 1px solid #eee;
}

.section:last-child {
  border-bottom: none;
}

.form-group {
  margin-bottom: 15px;
  flex: 1;
}

.form-group.flex-2 {
  flex: 2;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.item-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr auto;
  gap: 10px;
  align-items: end;
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #555;
  font-family: 'Phetsarath-OT', sans-serif;
}

input, select, textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  font-family: 'Phetsarath-OT', sans-serif;
  box-sizing: border-box;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: #667eea;
}

input.readonly {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

input.grand-total {
  font-weight: 700;
  color: #4CAF50;
  font-size: 1.2rem;
  background-color: #E8F5E9;
}

textarea {
  resize: vertical;
  font-family: 'Phetsarath-OT', sans-serif;
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-family: 'Phetsarath-OT', sans-serif;
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

.btn-add-item {
  background-color: #4CAF50;
  color: white;
  width: 100%;
}

.btn-add-item:hover {
  background-color: #45a049;
}

.btn-remove {
  padding: 8px 12px;
  background-color: #f44336;
  color: white;
  font-size: 1.2rem;
}

.btn-remove:hover {
  background-color: #d32f2f;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

/* ປະຫວັດການນຳເຂົ້າ */
.imports-list {
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.table-info {
  margin-bottom: 15px;
  color: #666;
  font-size: 0.95rem;
}

.table-container {
  overflow-x: auto;
  margin-bottom: 20px;
}

.imports-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.imports-table thead {
  background-color: #667eea;
  color: white;
}

.imports-table th {
  padding: 12px 8px;
  text-align: left;
  font-weight: 600;
  white-space: nowrap;
  font-size: 0.95rem;
}

.imports-table td {
  padding: 12px 8px;
  border-bottom: 1px solid #eee;
  font-size: 0.9rem;
}

.imports-table tbody tr:hover {
  background-color: #f8f9fa;
}

.supplier-name {
  font-weight: 600;
  color: #333;
}

.amount {
  color: #4CAF50;
  font-weight: 700;
  white-space: nowrap;
}

.notes-cell {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.actions-cell {
  display: flex;
  gap: 5px;
  justify-content: center;
}

.btn-detail {
  padding: 6px 10px;
  background-color: #667eea;
  color: white;
  font-size: 1rem;
  cursor: pointer;
}

.btn-detail:hover {
  background-color: #5568d3;
}

/* ສະຖານະ */
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
  
  .import-form, .imports-list {
    padding: 20px;
  }
  
  .item-row {
    grid-template-columns: 2fr 1fr 1fr 1fr auto;
    gap: 8px;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 10px;
  }
  
  h1 {
    font-size: 1.5rem;
    margin-bottom: 20px;
  }
  
  h2 {
    font-size: 1.1rem;
  }
  
  h3 {
    font-size: 1rem;
  }
  
  .tabs {
    flex-wrap: wrap;
  }
  
  .tab-btn {
    padding: 10px 16px;
    font-size: 0.95rem;
    flex: 1;
    min-width: 150px;
  }
  
  .import-form, .imports-list {
    padding: 15px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .item-row {
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 10px;
    background: #f8f9fa;
    border-radius: 8px;
    margin-bottom: 10px;
  }
  
  .btn-remove {
    width: 100%;
  }
  
  .table-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  .imports-table {
    font-size: 0.75rem;
    min-width: 600px;
  }
  
  .imports-table th,
  .imports-table td {
    padding: 8px 4px;
  }
  
  .notes-cell {
    max-width: 100px;
  }
  
  .actions-cell {
    flex-direction: column;
    gap: 4px;
  }
  
  .btn-detail {
    font-size: 0.9rem;
    padding: 4px 8px;
  }
  
  button {
    font-size: 0.9rem;
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
    font-size: 1.3rem;
  }
  
  .tab-btn {
    padding: 8px 12px;
    font-size: 0.85rem;
    min-width: 120px;
  }
  
  .import-form, .imports-list {
    padding: 12px;
  }
  
  input, select, textarea {
    font-size: 0.9rem;
    padding: 8px;
  }
  
  .imports-table {
    font-size: 0.7rem;
  }
  
  .table-info {
    font-size: 0.85rem;
  }
}
</style>

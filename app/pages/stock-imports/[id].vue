<template>
  <div class="container">
    <div class="header">
      <button class="btn-back" @click="navigateTo('/stock-imports')">← ກັບຄືນ</button>
      <h1>ລາຍລະອຽດການນຳເຂົ້າສິນຄ້າ</h1>
    </div>

    <div v-if="loading" class="loading">ກຳລັງໂຫລດ...</div>
    
    <div v-else-if="!importRecord" class="error">
      ບໍ່ພົບຂໍ້ມູນການນຳເຂົ້າ
    </div>

    <div v-else class="detail-container">
      <!-- ຂໍ້ມູນການນຳເຂົ້າ -->
      <div class="import-info">
        <h2>ຂໍ້ມູນການນຳເຂົ້າ</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">ວັນທີນຳເຂົ້າ:</span>
            <span class="value">{{ formatDate(importRecord.import_date) }}</span>
          </div>
          <div class="info-item">
            <span class="label">ຜູ້ສະໜອງ/ຮ້ານ:</span>
            <span class="value">{{ importRecord.supplier_name }}</span>
          </div>
          <div class="info-item">
            <span class="label">ຍອດລວມທັງໝົດ:</span>
            <span class="value total">{{ formatNumber(importRecord.total_cost) }} LAK</span>
          </div>
          <div class="info-item" v-if="importRecord.notes">
            <span class="label">ໝາຍເຫດ:</span>
            <span class="value">{{ importRecord.notes }}</span>
          </div>
        </div>
      </div>

      <!-- ລາຍການສິນຄ້າ -->
      <div class="items-section">
        <h2>ລາຍການສິນຄ້າທີ່ນຳເຂົ້າ</h2>
        <div class="table-container">
          <table class="items-table">
            <thead>
              <tr>
                <th>#</th>
                <th>ສິນຄ້າ</th>
                <th>ສີ</th>
                <th>ຂະໜາດ</th>
                <th>ຈຳນວນ</th>
                <th>ຕົ້ນທືນ/ອັນ</th>
                <th>ລວມ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in items" :key="item.id">
                <td>{{ index + 1 }}</td>
                <td class="product-name">{{ item.product_name }}</td>
                <td>{{ item.color }}</td>
                <td class="size">{{ item.size }}</td>
                <td class="quantity">{{ item.quantity_added }}</td>
                <td class="cost">{{ formatNumber(item.cost_per_unit) }}</td>
                <td class="total">{{ formatNumber(item.quantity_added * item.cost_per_unit) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="summary-row">
                <td colspan="4" class="text-right"><strong>ລວມທັງໝົດ:</strong></td>
                <td class="quantity"><strong>{{ totalQuantity }}</strong></td>
                <td></td>
                <td class="total"><strong>{{ formatNumber(importRecord.total_cost) }} LAK</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- ປຸ່ມຈັດການ -->
      <!-- <div class="actions">
        <button class="btn-edit" @click="editImport">
          ✏️ ແກ້ໄຂການນຳເຂົ້ານີ້
        </button>
      </div> -->
    </div>

    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script setup>
const route = useRoute()
const supabase = useSupabaseClient()
const importId = route.params.id

const importRecord = ref(null)
const items = ref([])
const loading = ref(true)
const error = ref(null)

const totalQuantity = computed(() => {
  return items.value.reduce((sum, item) => sum + item.quantity_added, 0)
})

// ດຶງຂໍ້ມູນການນຳເຂົ້າ
async function fetchImportDetails() {
  try {
    loading.value = true
    error.value = null

    // ດຶງຂໍ້ມູນການນຳເຂົ້າ
    const { data: importData, error: importError } = await supabase
      .from('stock_imports')
      .select('*')
      .eq('id', importId)
      .single()

    if (importError) throw importError
    importRecord.value = importData

    // ດຶງລາຍການສິນຄ້າ
    const { data: itemsData, error: itemsError } = await supabase
      .from('stock_import_items')
      .select(`
        id,
        quantity_added,
        size,
        cost_per_unit,
        variant:product_variants(
          id,
          color,
          product:products(
            id,
            name
          )
        )
      `)
      .eq('import_id', importId)

    if (itemsError) throw itemsError

    // ຈັດຮູບແບບຂໍ້ມູນ
    items.value = itemsData.map(item => ({
      id: item.id,
      quantity_added: item.quantity_added,
      size: item.size,
      cost_per_unit: item.cost_per_unit,
      color: item.variant?.color || '-',
      product_name: item.variant?.product?.name || '-'
    }))

  } catch (err) {
    error.value = 'ບໍ່ສາມາດໂຫລດຂໍ້ມູນໄດ້: ' + err.message
    console.error('Error fetching import details:', err)
  } finally {
    loading.value = false
  }
}

// ແກ້ໄຂການນຳເຂົ້າ
function editImport() {
  navigateTo('/stock-imports?edit=' + importId)
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

onMounted(() => {
  fetchImportDetails()
})
</script>

<style scoped>
.container {
  max-width: 1200px;
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
  font-family: 'Phetsarath-OT', sans-serif;
}

.btn-back:hover {
  background-color: #e0e0e0;
}

h1 {
  color: #333;
  margin: 0;
}

h2 {
  color: #555;
  margin-bottom: 20px;
  font-size: 1.2rem;
}

.detail-container {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* ຂໍ້ມູນການນຳເຂົ້າ */
.import-info {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.import-info h2 {
  color: white;
  margin-bottom: 20px;
  font-size: 1.3rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.label {
  font-weight: 600;
  font-size: 0.9rem;
  opacity: 0.9;
}

.value {
  font-size: 1.1rem;
  font-weight: 500;
}

.value.total {
  font-size: 1.4rem;
  font-weight: 700;
  color: #ffd700;
}

/* ລາຍການສິນຄ້າ */
.items-section {
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.table-container {
  overflow-x: auto;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
}

.items-table thead {
  background-color: #667eea;
  color: white;
}

.items-table th {
  padding: 12px;
  text-align: left;
  font-weight: 600;
  white-space: nowrap;
}

.items-table td {
  padding: 12px;
  border-bottom: 1px solid #eee;
}

.items-table tbody tr:hover {
  background-color: #f8f9fa;
}

.product-name {
  font-weight: 600;
  color: #333;
}

.size {
  font-weight: 600;
  color: #667eea;
  text-align: center;
}

.quantity {
  text-align: center;
  font-weight: 600;
  color: #4CAF50;
}

.cost {
  text-align: right;
  color: #666;
}

.total {
  text-align: right;
  font-weight: 700;
  color: #4CAF50;
}

.items-table tfoot {
  background-color: #f8f9fa;
  border-top: 2px solid #667eea;
}

.summary-row td {
  padding: 15px 12px;
  font-size: 1.1rem;
}

.text-right {
  text-align: right;
}

/* ປຸ່ມຈັດການ */
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-edit {
  padding: 10px 20px;
  background-color: #ff9800;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-family: 'Phetsarath-OT', sans-serif;
  transition: all 0.3s;
}

.btn-edit:hover {
  background-color: #f57c00;
}

/* ສະຖານະ */
.loading {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 1.2rem;
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
  
  .import-info, .items-section {
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
  
  .import-info, .items-section {
    padding: 15px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .value.total {
    font-size: 1.2rem;
  }
  
  .table-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  .items-table {
    font-size: 0.8rem;
    min-width: 600px;
  }
  
  .items-table th,
  .items-table td {
    padding: 8px 4px;
  }
  
  .btn-edit {
    width: 100%;
    padding: 12px 20px;
    font-size: 0.95rem;
  }
  
  .actions {
    position: sticky;
    bottom: 0;
    background: white;
    padding: 15px;
    box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
    margin: 0 -10px -10px;
  }
}

@media (max-width: 480px) {
  h1 {
    font-size: 1.1rem;
  }
  
  h2 {
    font-size: 1rem;
  }
  
  .import-info, .items-section {
    padding: 12px;
  }
  
  .items-table {
    font-size: 0.75rem;
  }
  
  .summary-row td {
    font-size: 0.95rem;
  }
  
  .btn-edit {
    font-size: 0.9rem;
  }
}
</style>

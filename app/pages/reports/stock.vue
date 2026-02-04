<template>
  <div class="container">
    <h1>ລາຍງານສະຕ໋ອກສິນຄ້າ</h1>
    
    <div class="filters">
      <div class="search-box">
        <label>ຄົ້ນຫາ:</label>
        <input 
          type="text" 
          v-model="searchText" 
          placeholder="ຄົ້ນຫາຊື່ສິນຄ້າ, ສີ, ຂະໜາດ..."
        />
      </div>
      <button class="btn-primary" @click="loadStockReport" :disabled="loading">
        <svg v-if="!loading" class="btn-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden>
          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
        <svg v-else class="spinner" viewBox="0 0 50 50" width="16" height="16" aria-hidden>
          <circle cx="25" cy="25" r="20" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round" stroke-dasharray="31.4 31.4"></circle>
        </svg>
        <span class="btn-label">ໂຫຼດຂໍ້ມູນ</span>
      </button>
    </div>

    <div v-if="loading" class="loading">ກຳລັງໂຫຼດຂໍ້ມູນ...</div>
    <div v-if="error" class="error">{{ error }}</div>
    
    <div v-if="!loading && !error" class="results">
      <!-- Summary Cards -->
      <div class="summary-cards">
        <div class="card">
          <div class="card-label">ປະເພດສິນຄ້າທັງໝົດ</div>
          <div class="card-value">{{ summary.totalProducts }}</div>
        </div>
        <div class="card">
          <div class="card-label">ຈຳນວນສະຕ໋ອກທັງໝົດ</div>
          <div class="card-value">{{ summary.totalStock }}</div>
        </div>
        <div class="card">
          <div class="card-label">ມູນຄ່າສະຕ໋ອກ (ຕົ້ນທຶນ)</div>
          <div class="card-value">{{ formatNumber(summary.totalCostValue) }} LAK</div>
        </div>
        <div class="card">
          <div class="card-label">ມູນຄ່າສະຕ໋ອກ (ຂາຍ)</div>
          <div class="card-value">{{ formatNumber(summary.totalSaleValue) }} LAK</div>
        </div>
      </div>

      <!-- Stock Table -->
      <div class="table-container">
        <table class="stock-table">
          <thead>
            <tr>
              <th>ຊື່ສິນຄ້າ</th>
              <th>ສີ/ແບບ</th>
              <th>ຂະໜາດ</th>
              <th class="text-right">ຈຳນວນໃນສະຕ໋ອກ</th>
              <th class="text-right">ຕົ້ນທຶນ/ຊິ້ນ</th>
              <th class="text-right">ລາຄາຂາຍ/ຊິ້ນ</th>
              <th class="text-right">ມູນຄ່າຕົ້ນທຶນ</th>
              <th class="text-right">ມູນຄ່າຂາຍ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredStockData" :key="item.variant_id" :class="getStockClass(item.stock_qty)">
              <td>{{ item.product_name }}</td>
              <td>{{ item.color }}</td>
              <td class="text-center">{{ item.size }}</td>
              <td class="text-right stock-qty">{{ item.stock_qty }}</td>
              <td class="text-right">{{ formatNumber(item.base_cost) }}</td>
              <td class="text-right">{{ formatNumber(item.base_price) }}</td>
              <td class="text-right">{{ formatNumber(item.stock_qty * item.base_cost) }}</td>
              <td class="text-right">{{ formatNumber(item.stock_qty * item.base_price) }}</td>
            </tr>
          </tbody>
          <tfoot v-if="filteredStockData.length > 0">
            <tr class="summary-row">
              <td colspan="3"><strong>ລວມທັງໝົດ</strong></td>
              <td class="text-right"><strong>{{ filteredSummary.totalStock }}</strong></td>
              <td colspan="2"></td>
              <td class="text-right"><strong>{{ formatNumber(filteredSummary.totalCostValue) }} LAK</strong></td>
              <td class="text-right"><strong>{{ formatNumber(filteredSummary.totalSaleValue) }} LAK</strong></td>
            </tr>
          </tfoot>
        </table>
        <div v-if="filteredStockData.length === 0" class="no-data">
          ບໍ່ພົບຂໍ້ມູນທີ່ຄົ້ນຫາ
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
const supabase = useSupabaseClient()

const loading = ref(false)
const error = ref(null)
const stockData = ref([])
const searchText = ref('')

const summary = computed(() => {
  const uniqueProducts = new Set(stockData.value.map(item => item.product_id))
  const totalStock = stockData.value.reduce((sum, item) => sum + item.stock_qty, 0)
  const totalCostValue = stockData.value.reduce((sum, item) => sum + (item.stock_qty * item.base_cost), 0)
  const totalSaleValue = stockData.value.reduce((sum, item) => sum + (item.stock_qty * item.base_price), 0)
  
  return {
    totalProducts: uniqueProducts.size,
    totalStock,
    totalCostValue,
    totalSaleValue
  }
})

const filteredStockData = computed(() => {
  if (!searchText.value.trim()) {
    return stockData.value
  }
  
  const search = searchText.value.toLowerCase()
  return stockData.value.filter(item => 
    item.product_name.toLowerCase().includes(search) ||
    item.color.toLowerCase().includes(search) ||
    item.size.toLowerCase().includes(search)
  )
})

const filteredSummary = computed(() => {
  const totalStock = filteredStockData.value.reduce((sum, item) => sum + item.stock_qty, 0)
  const totalCostValue = filteredStockData.value.reduce((sum, item) => sum + (item.stock_qty * item.base_cost), 0)
  const totalSaleValue = filteredStockData.value.reduce((sum, item) => sum + (item.stock_qty * item.base_price), 0)
  
  return {
    totalStock,
    totalCostValue,
    totalSaleValue
  }
})

function formatNumber(value) {
  return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value || 0)
}

function getStockClass(qty) {
  if (qty === 0) return 'out-of-stock'
  if (qty <= 5) return 'low-stock'
  return ''
}

async function loadStockReport() {
  try {
    loading.value = true
    error.value = null
    
    // Query to get all products with their variants
    const { data, error: fetchError } = await supabase
      .from('product_variants')
      .select(`
        id,
        color,
        size,
        stock_qty,
        product_id,
        products (
          id,
          name,
          base_cost,
          base_price
        )
      `)
      .order('product_id')
      .order('color')
      .order('size')
    
    if (fetchError) throw fetchError
    
    // Transform the data
    stockData.value = data.map(item => ({
      variant_id: item.id,
      product_id: item.product_id,
      product_name: item.products.name,
      color: item.color,
      size: item.size,
      stock_qty: item.stock_qty,
      base_cost: item.products.base_cost,
      base_price: item.products.base_price
    }))
    
  } catch (err) {
    console.error('Error loading stock report:', err)
    error.value = 'ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ: ' + err.message
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadStockReport()
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

.filters {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 30px;
  display: flex;
  gap: 15px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 250px;
}

.search-box label {
  display: block;
  margin-bottom: 5px;
  color: #4a5568;
  font-weight: 500;
  font-family: 'Phetsarath-OT', sans-serif;
}

.search-box input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #cbd5e0;
  border-radius: 6px;
  font-size: 14px;
  font-family: 'Phetsarath-OT', sans-serif;
}

.search-box input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
  font-family: 'Phetsarath-OT', sans-serif;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-icon {
  flex-shrink: 0;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading, .error {
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
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border-left: 4px solid #667eea;
}

.card-label {
  font-size: 14px;
  color: #718096;
  margin-bottom: 10px;
  font-family: 'Phetsarath-OT', sans-serif;
}

.card-value {
  font-size: 24px;
  font-weight: bold;
  color: #2d3748;
  font-family: 'Phetsarath-OT', sans-serif;
}

.results {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
}

.table-container {
  overflow-x: auto;
}

.stock-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.stock-table thead {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stock-table th {
  padding: 12px;
  text-align: left;
  font-weight: 600;
  font-family: 'Phetsarath-OT', sans-serif;
  white-space: nowrap;
}

.stock-table td {
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;
  font-family: 'Phetsarath-OT', sans-serif;
}

.stock-table tbody tr:hover {
  background-color: #f7fafc;
}

.text-right {
  text-align: right;
}

.text-center {
  text-align: center;
}

.stock-qty {
  font-weight: 600;
}

.out-of-stock {
  background-color: #fff5f5;
}

.out-of-stock .stock-qty {
  color: #c53030;
}

.low-stock {
  background-color: #fffaf0;
}

.low-stock .stock-qty {
  color: #dd6b20;
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

.no-data {
  padding: 40px;
  text-align: center;
  color: #718096;
  font-family: 'Phetsarath-OT', sans-serif;
}

@media (max-width: 768px) {
  .container {
    padding: 15px;
  }

  h1 {
    font-size: 1.5rem;
  }

  .filters {
    padding: 15px;
  }

  .summary-cards {
    grid-template-columns: 1fr;
  }

  .stock-table {
    font-size: 12px;
  }

  .stock-table th,
  .stock-table td {
    padding: 8px 6px;
  }

  .card-value {
    font-size: 20px;
  }
}
</style>

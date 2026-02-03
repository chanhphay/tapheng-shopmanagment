<template>
  <div class="container">
    <h1>ລາຍງານຜົນກຳໄລ</h1>

    <div class="filters">
      <div class="tabs-inline">
        <button :class="['tab-btn', { active: activeTab === 'profit' }]" @click="activeTab = 'profit'">📊 ຜົນກຳໄລ</button>
        <button :class="['tab-btn', { active: activeTab === 'status' }]" @click="activeTab = 'status'">📑 ຍອດຕາມສະຖານະ</button>
      </div>

      <label>ຈາກວັນທີ:</label>
      <input type="date" v-model="from" />

      <div class="filter-controls">
        <label>ຫາວັນທີ:</label>
        <input type="date" v-model="to" />

        <button class="btn-primary" @click="runReports" :disabled="loading">
          <svg v-if="!loading" class="btn-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden>
            <rect x="3" y="3" width="18" height="18" rx="2"></rect>
            <path d="M8 7h8"></path>
            <path d="M8 11h8"></path>
            <path d="M8 15h8"></path>
          </svg>

          <svg v-else class="spinner" viewBox="0 0 50 50" width="16" height="16" aria-hidden>
            <circle cx="25" cy="25" r="20" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round" stroke-dasharray="31.4 31.4"></circle>
          </svg>

          <span class="btn-label">ຄຳນວນ</span>
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading">ກຳລັງຄຳນວນ...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="!loading && !error" class="results">
      <!-- Profit results -->
      <div v-if="activeTab === 'profit'">
        <table class="report-table">
          <tbody>
            <tr><th>ຈຳນວນອໍເດີ (status = 'ຈັດສົ່ງແລ້ວ')</th><td class="amount">{{ results.orderCount }}</td></tr>
            <tr><th>ຍອດລວມ (total_amount)</th><td class="amount">{{ formatNumber(results.orderAmount) }} LAK</td></tr>
            <tr><th>ຍອດຂາຍ (ລາຄາຂາຍ)</th><td class="amount">{{ formatNumber(results.revenue) }} LAK</td></tr>
            <tr><th>ຕົ້ນທຶນຂາຍ (ຄ່າຕົ້ນທຶນ)</th><td class="amount">{{ formatNumber(results.cogs) }} LAK</td></tr>
            <tr><th>ກຳໄລຂັ້ນຕົ້ນ</th><td class="amount">{{ formatNumber(results.grossProfit) }} LAK</td></tr>
            <tr><th>ຕົ້ນທຶນນຳເຂົ້າສີນຄ້າ (ລວມ ຈາກ stock_imports)</th><td class="amount">{{ formatNumber(results.stockImports) }} LAK</td></tr>
            <tr><th>ຄ່າໃຊ້ຈ່າຍອື່ນໆ</th><td class="amount">{{ formatNumber(results.expenses) }} LAK</td></tr>
          </tbody>
          <tfoot>
            <tr class="summary" :class="netClass()"><th>ກຳໄລສຸດທິ</th>   <td class="amountsum">{{ formatNumber(results.netProfit) }} LAK</td></tr>
          </tfoot>
        </table>

        <div class="notes">
          <p>ໝາຍເຫດ: ຄຳນວນຈາກຕາຕະລາງ <code>orders</code> (status = 'ຈັດສົ່ງແລ້ວ'), <code>order_items</code>, ແລະຂໍ້ມູນລາຄາຈາກ <code>products</code> (base_cost, base_price). ຫັກດ້ວຍຍອດຈາກ <code>stock_imports.total_cost</code> ແລະ <code>expenses.amount</code> ໃນຊ່ວງວັນທີທີ່ເລືອກ.</p>
        </div>
      </div>

      <!-- Status grouping results -->
      <div v-if="activeTab === 'status'">
        <h2>ລາຍງານອໍເດີ</h2>
        <div class="status-legend">
          <span class="legend-item status-delivered"><i></i> ຈັດສົ່ງແລ້ວ</span>
          <span class="legend-item status-cancelled"><i></i> ຍົກເລີກ</span>
          <span class="legend-item status-info"><i></i> ແຈ້ງລູກຄ້າ / ສັ່ງພີມ</span>
          <span class="legend-item status-design"><i></i> ອອກແບບ</span>
        </div>
        <div v-if="statusReport.length === 0" class="no-data">ຍັງບໍ່ມີບັນທຶກທີ່ແກ້ລະວັນທີນີ້</div>
        <div v-else class="table-container">
          <table class="report-table status">
            <thead>
              <tr><th>ສະຖານະ</th><th>ຈຳນວນ</th><th class="amount">ລວມ (LAK)</th></tr>
            </thead>
            <tbody>
              <tr v-for="row in statusReport" :key="row.status" :class="statusClass(row.status)">
                <td class="status-cell">{{ row.status }}</td>
                <td>{{ row.count }}</td>
                <td class="amount">{{ formatNumber(row.amount) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const supabase = useSupabaseClient()

const from = ref(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().slice(0,10))
const to = ref(new Date().toISOString().slice(0,10))
const loading = ref(false)
const error = ref(null)
const results = ref({ revenue: 0, cogs: 0, grossProfit: 0, stockImports: 0, expenses: 0, netProfit: 0, orderCount: 0, orderAmount: 0 })
const activeTab = ref('profit')
const statusReport = ref([])

function formatNumber(value) {
  return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
}

async function calculate() {
  try {
    loading.value = true
    error.value = null
    results.value = { revenue: 0, cogs: 0, grossProfit: 0, stockImports: 0, expenses: 0, netProfit: 0 }

    const fromISO = from.value + 'T00:00:00'
    const toISO = to.value + 'T23:59:59'

    // 1) find orders with status = 'ຈັດສົ່ງແລ້ວ' in date range (include total_amount)
    const { data: orders, error: ordersErr } = await supabase
      .from('orders')
      .select('id, total_amount')
      .eq('status', 'ຈັດສົ່ງແລ້ວ')
      .gte('order_date', fromISO)
      .lte('order_date', toISO)

    if (ordersErr) throw ordersErr

    const orderIds = (orders || []).map(o => o.id)
    // count orders and sum total_amount
    results.value.orderCount = (orders || []).length
    results.value.orderAmount = (orders || []).reduce((s, r) => s + Number(r.total_amount || 0), 0)

    if (orderIds.length > 0) {
      // 2) fetch order_items for these orders with product pricing
      const { data: items, error: itemsErr } = await supabase
        .from('order_items')
        .select(`quantity, variant:product_variants(product:products(base_cost, base_price))`)
        .in('order_id', orderIds)

      if (itemsErr) throw itemsErr

      // aggregate revenue and cogs
      for (const it of items || []) {
        const qty = it.quantity || 0
        const prod = it.variant?.product || { base_price: 0, base_cost: 0 }
        const bp = Number(prod.base_price || 0)
        const bc = Number(prod.base_cost || 0)
        results.value.revenue += qty * bp
        results.value.cogs += qty * bc
      }
    }

    results.value.grossProfit = results.value.revenue - results.value.cogs

    // 3) sum stock_imports.total_cost in date range
    const { data: imports, error: impErr } = await supabase
      .from('stock_imports')
      .select('total_cost')
      .gte('import_date', fromISO)
      .lte('import_date', toISO)

    if (impErr) throw impErr
    results.value.stockImports = (imports || []).reduce((s, r) => s + Number(r.total_cost || 0), 0)

    // 4) sum expenses.amount in date range
    const { data: exps, error: expErr } = await supabase
      .from('expenses')
      .select('amount')
      .gte('expense_date', fromISO)
      .lte('expense_date', toISO)

    if (expErr) throw expErr
    results.value.expenses = (exps || []).reduce((s, r) => s + Number(r.amount || 0), 0)

    // final net profit
    results.value.netProfit = results.value.grossProfit - results.value.stockImports - results.value.expenses

    // Also compute status report (lightweight client-side grouping for this date range)
    await calculateStatusReport(fromISO, toISO)
  } catch (err) {
    console.error('Profit calc error:', err)
    error.value = err?.message || String(err)
  } finally {
    loading.value = false
  }
}

async function calculateStatusReport(fromISO, toISO) {
  try {
    // fetch orders in range and group by status
    const { data: ordersAll, error: ordersAllErr } = await supabase
      .from('orders')
      .select('status, total_amount')
      .gte('order_date', fromISO)
      .lte('order_date', toISO)

    if (ordersAllErr) throw ordersAllErr

    const map = {}
    for (const o of ordersAll || []) {
      const st = (o.status || 'Unknown').trim()
      if (!map[st]) map[st] = { status: st, count: 0, amount: 0 }
      map[st].count += 1
      map[st].amount += Number(o.total_amount || 0)
    }

    statusReport.value = Object.values(map).sort((a,b) => b.amount - a.amount)
  } catch (err) {
    console.error('Status report error:', err)
  }
}

// Map status text to a CSS class for highlighting
function statusClass(status) {
  const s = (status || '').trim()
  if (s === 'ຈັດສົ່ງແລ້ວ') return 'status-delivered'
  if (s === 'ຍົກເລີກ') return 'status-cancelled'
  // Blue highlights for notify/print statuses
  if (s === 'ແຈ້ງລູກຄ້າ' || s === 'ສັ່ງພີມ') return 'status-info'
  // Yellow highlight for design/export
  if (s === 'ອອກແບບ') return 'status-design'
  return ''
} 

async function runReports() {
  // run profit calculation (which also triggers status computation)
  await calculate()
}

function netClass() {
  const v = Number(results.value.netProfit || 0)
  return v >= 0 ? 'profit-positive' : 'profit-negative'
}
</script>

<style scoped>
.container { max-width: 1100px; margin: 0 auto; padding: 20px }

/* Tabs and filters */
.filters { display: flex; gap: 16px; align-items: center; margin-bottom: 20px; flex-wrap: wrap; justify-content: space-between }
.tabs-inline { display: flex; gap: 8px; align-items: center; background: rgba(102,126,234,0.06); padding: 8px; border-radius: 12px }
.tab-btn {
  background: transparent;
  border: none;
  padding: 10px 14px;
  border-radius: 10px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  color: #273444;
  transition: all 0.18s ease;
  box-shadow: none;
}
.tab-btn:hover { transform: translateY(-3px); }
.tab-btn:focus { outline: 3px solid rgba(102,126,234,0.18); }
.tab-btn.active {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.18);
}

/* Right-side controls */
.filter-controls { display: flex; gap: 10px; align-items: center }
.filter-controls label { font-size: 0.95rem; margin-right: 6px }
.filter-controls input[type="date"] { padding: 8px; border: 1px solid #e6e9ef; border-radius: 8px }

/* Primary button styles (modern, gradient) */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 12px;
  border: none;
  color: #fff;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 8px 24px rgba(102,126,234,0.18);
  cursor: pointer;
  font-weight: 700;
  transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
}

.btn-primary:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 12px 30px rgba(102,126,234,0.22); }
.btn-primary:active:not(:disabled) { transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none }

.btn-icon { width: 16px; height: 16px; color: rgba(255,255,255,0.95); }
.spinner { width: 16px; height: 16px; color: rgba(255,255,255,0.95); animation: spin 1s linear infinite }

@keyframes spin {
  0% { transform: rotate(0deg) }
  100% { transform: rotate(360deg) }
}

/* Table container: enable horizontal scroll on small screens */
.table-container { overflow-x: auto; -webkit-overflow-scrolling: touch }

/* Profit table (two-column summary) — make rows compact and readable on mobile */
.report-table { width: 100%; border-collapse: collapse; margin-top: 8px }
.report-table tbody { display: block }
.report-table tbody tr { display: grid; grid-template-columns: 1fr auto; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f1f5f9; align-items: center }
.report-table tbody tr th, .report-table tbody tr td { padding: 0; margin: 0 }
.report-table tbody tr td.amount { text-align: right; font-weight: 700; color: #111 }
.report-table tbody tr td.amountsum { text-align: right; font-weight: 700; color: #05a53a }
.report-table thead { display: none }
..report-table tfoot { display: block; margin-top: 8px; border-top: 2px solid #f1f5f9 }
.report-table tfoot tr.summary { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; gap: 16px }
.report-table tfoot tr.summary th { font-size: 1.15rem; color: #05a53a; margin: 0 }
.report-table tfoot tr.summary td { font-weight: 900; font-size: 1.15rem; text-align: right; margin: 0 }
.report-table tfoot tr.summary td.amountsum { padding-left: 16px }

/* Status table: keep a normal table but allow scroll on small screens */
.report-table.status { min-width: 640px }

/* Status highlight classes */
.status-delivered td { background: linear-gradient(90deg, rgba(34,197,94,0.06), rgba(34,197,94,0.03)) }
.status-delivered td.amount { color: #166534; font-weight: 800 }
.status-delivered td.status-cell::before { content: ''; display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #16a34a; margin-right: 10px; vertical-align: middle }

.status-cancelled td { background: linear-gradient(90deg, rgba(239,68,68,0.06), rgba(239,68,68,0.03)) }
.status-cancelled td.amount { color: #991b1b; font-weight: 800 }
.status-cancelled td.status-cell::before { content: ''; display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #ef4444; margin-right: 10px; vertical-align: middle }

.status-info td { background: linear-gradient(90deg, rgba(59,130,246,0.06), rgba(59,130,246,0.03)) }
.status-info td.amount { color: #1e3a8a; font-weight: 800 }
.status-info td.status-cell::before { content: ''; display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #3b82f6; margin-right: 10px; vertical-align: middle }

.status-design td { background: linear-gradient(90deg, rgba(250,204,21,0.06), rgba(250,204,21,0.03)) }
.status-design td.amount { color: #92400e; font-weight: 800 }
.status-design td.status-cell::before { content: ''; display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #f59e0b; margin-right: 10px; vertical-align: middle }

/* Legend styles */
.status-legend { display: flex; gap: 10px; margin-bottom: 10px; align-items: center; flex-wrap: wrap }
.legend-item { display: inline-flex; align-items: center; gap: 8px; padding: 6px 10px; border-radius: 8px; font-weight: 600; color: #222 }
.legend-item::before { content: ''; display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 6px }
.legend-item.status-delivered::before { background: #16a34a }
.legend-item.status-cancelled::before { background: #ef4444 }
.legend-item.status-info::before { background: #3b82f6 }
.legend-item.status-design::before { background: #f59e0b }

.loading { color: #666 }
.error { color: #b00020 }
.notes { margin-top: 12px; color: #666 }

/* Responsive adjustments for small screens */
@media (max-width: 800px) {
  .filters { flex-direction: column; align-items: stretch; gap: 12px }
  .filter-controls { justify-content: space-between; gap: 8px }
  .tabs-inline { width: 100% }
  .filter-controls input[type="date"] { width: 100% }
  .btn-primary { width: 100%; justify-content: center }
}
@media (max-width: 480px) {
  h1 { font-size: 1.15rem }
  .tab-btn { padding: 8px 10px; font-size: 0.95rem }
  .filter-controls input[type="date"] { padding: 6px }
  .report-table tbody tr { grid-template-columns: 1fr auto }
  .report-table.status { width: 100%; overflow-x: auto }
}

/* Summary profit coloring */
.profit-positive th, .profit-positive td.amountsum { color: #16a34a; }
.profit-positive td.amountsum { font-weight: 900 }
.profit-negative th, .profit-negative td.amountsum { color: #b91c1c; }
.profit-negative td.amountsum { font-weight: 900 }
</style>
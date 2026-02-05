<template>
  <div class="container">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-icon">📊</div>
        <div>
          <h1>ລາຍງານຜົນກຳໄລ</h1>
          <p class="subtitle">ວິເຄາະຜົນກຳໄລແລະຍອດຂາຍ</p>
        </div>
      </div>
    </div>

    <!-- Filters Card -->
    <div class="filters-card">
      <div class="tabs-inline">
        <button :class="['tab-btn', { active: activeTab === 'profit' }]" @click="activeTab = 'profit'">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="20" x2="12" y2="10"></line>
            <line x1="18" y1="20" x2="18" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="16"></line>
          </svg>
          ຜົນກຳໄລ
        </button>
        <button :class="['tab-btn', { active: activeTab === 'status' }]" @click="activeTab = 'status'">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          ຍອດຕາມສະຖານະ
        </button>
      </div>

      <div class="date-filters">
        <div class="date-group">
          <label>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            ຈາກວັນທີ
          </label>
          <input type="date" v-model="from" />
        </div>

        <div class="date-group">
          <label>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            ຫາວັນທີ
          </label>
          <input type="date" v-model="to" />
        </div>

        <button class="btn-calculate" @click="runReports" :disabled="loading">
          <svg v-if="!loading" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
          <svg v-else class="spinner" viewBox="0 0 50 50" width="18" height="18">
            <circle cx="25" cy="25" r="20" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round" stroke-dasharray="31.4 31.4"></circle>
          </svg>
          <span>{{ loading ? 'ກຳລັງຄຳນວນ...' : 'ຄຳນວນ' }}</span>
        </button>
      </div>
    </div>

    <div v-if="error" class="error-message">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      {{ error }}
    </div>

    <div v-if="!loading && !error" class="results">
      <!-- Profit results -->
      <div v-if="activeTab === 'profit'" class="profit-section">
        <!-- Summary Cards -->
        <div class="summary-cards">
          <div class="summary-card orders">
            <div class="card-icon">📦</div>
            <div class="card-content">
              <div class="card-label">ຈຳນວນອໍເດີ</div>
              <div class="card-value">{{ results.orderCount }}</div>
              <div class="card-sublabel">ອໍເດີທີ່ຈັດສົ່ງແລ້ວ</div>
            </div>
          </div>

          <div class="summary-card revenue">
            <div class="card-icon">💰</div>
            <div class="card-content">
              <div class="card-label">ຍອດຂາຍ</div>
              <div class="card-value">{{ formatNumber(results.revenue) }}</div>
              <div class="card-sublabel">LAK</div>
            </div>
          </div>

          <div class="summary-card profit" :class="netClass()">
            <div class="card-icon">{{ results.netProfit >= 0 ? '📈' : '📉' }}</div>
            <div class="card-content">
              <div class="card-label">ກຳໄລສຸດທິ</div>
              <div class="card-value">{{ formatNumber(results.netProfit) }}</div>
              <div class="card-sublabel">LAK</div>
            </div>
          </div>
        </div>

        <!-- Detailed Table -->
        <div class="data-card">
          <h3 class="card-title">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
            ລາຍລະອຽດຜົນກຳໄລ
          </h3>
          
          <div class="table-wrapper">
            <table class="detail-table">
              <tbody>
                <tr>
                  <td class="label">
                    <div class="label-content">
                      <span class="label-icon">📊</span>
                      <span>ຈຳນວນອໍເດີທີ່ຈັດສົ່ງແລ້ວ</span>
                    </div>
                  </td>
                  <td class="value">{{ results.orderCount }} ອໍເດີ</td>
                </tr>
                <tr>
                  <td class="label">
                    <div class="label-content">
                      <span class="label-icon">💵</span>
                      <span>ຍອດລວມທັງໝົດ (Total Amount)</span>
                    </div>
                  </td>
                  <td class="value">{{ formatNumber(results.orderAmount) }} LAK</td>
                </tr>
                <tr class="highlight">
                  <td class="label">
                    <div class="label-content">
                      <span class="label-icon">💰</span>
                      <span>ຍອດຂາຍ (Revenue)</span>
                    </div>
                  </td>
                  <td class="value primary">{{ formatNumber(results.revenue) }} LAK</td>
                </tr>
                <tr>
                  <td class="label">
                    <div class="label-content">
                      <span class="label-icon">📦</span>
                      <span>ຕົ້ນທຶນຂາຍ (COGS)</span>
                    </div>
                  </td>
                  <td class="value">{{ formatNumber(results.cogs) }} LAK</td>
                </tr>
                <tr class="separator">
                  <td class="label">
                    <div class="label-content">
                      <span class="label-icon">📈</span>
                      <span>ກຳໄລຂັ້ນຕົ້ນ (Gross Profit)</span>
                    </div>
                  </td>
                  <td class="value success">{{ formatNumber(results.grossProfit) }} LAK</td>
                </tr>
                <tr>
                  <td class="label">
                    <div class="label-content">
                      <span class="label-icon">💸</span>
                      <span>ຄ່າໃຊ້ຈ່າຍອື່ນໆ (Expenses)</span>
                    </div>
                  </td>
                  <td class="value expense">-{{ formatNumber(results.expenses) }} LAK</td>
                </tr>
                <tr>
                  <td class="label">
                    <div class="label-content">
                      <span class="label-icon">👥</span>
                      <span>ຄ່າເງິນເດືອນພະນັກງານ (Salaries)</span>
                    </div>
                  </td>
                  <td class="value expense">-{{ formatNumber(results.salaryPayments) }} LAK</td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="total-row" :class="netClass()">
                  <td class="label">
                    <div class="label-content">
                      <span class="label-icon">{{ results.netProfit >= 0 ? '✅' : '❌' }}</span>
                      <span>ກຳໄລສຸດທິ (Net Profit)</span>
                    </div>
                  </td>
                  <td class="value total">{{ formatNumber(results.netProfit) }} LAK</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div class="notes">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <p>ຄຳນວນຈາກອໍເດີທີ່ຈັດສົ່ງແລ້ວ, ລາຄາຕົ້ນທຶນ ແລະລາຄາຂາຍຈາກຂໍ້ມູນສິນຄ້າ, ຫັກດ້ວຍຄ່າໃຊ້ຈ່າຍແລະເງິນເດືອນໃນຊ່ວງເວລາທີ່ເລືອກ</p>
          </div>
        </div>
      </div>

      <!-- Status grouping results -->
      <div v-if="activeTab === 'status'" class="status-section">
        <div class="data-card">
          <h3 class="card-title">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            ລາຍງານອໍເດີຕາມສະຖານະ
          </h3>
          
          <div class="status-legend">
            <div class="legend-item">
              <span class="legend-dot delivered"></span>
              <span>ຈັດສົ່ງແລ້ວ</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot cancelled"></span>
              <span>ຍົກເລີກ</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot info"></span>
              <span>ແຈ້ງລູກຄ້າ / ສັ່ງພີມ</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot design"></span>
              <span>ອອກແບບ</span>
            </div>
          </div>

          <div v-if="statusReport.length === 0" class="no-data">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p>ຍັງບໍ່ມີບັນທຶກໃນຊ່ວງເວລານີ້</p>
          </div>
          
          <div v-else class="status-grid">
            <div v-for="row in statusReport" :key="row.status" class="status-card" :class="statusClass(row.status)">
              <div class="status-header">
                <span class="status-name">{{ row.status }}</span>
                <span class="status-badge">{{ row.count }}</span>
              </div>
              <div class="status-amount">{{ formatNumber(row.amount) }} LAK</div>
              <div class="status-bar">
                <div class="status-fill" :style="{ width: getPercentage(row.amount) + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})

import { ref } from 'vue'
const supabase = useSupabaseClient()

const from = ref(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().slice(0,10))
const to = ref(new Date().toISOString().slice(0,10))
const loading = ref(false)
const error = ref(null)
const results = ref({ revenue: 0, cogs: 0, grossProfit: 0, expenses: 0, salaryPayments: 0, netProfit: 0, orderCount: 0, orderAmount: 0 })
const activeTab = ref('profit')
const statusReport = ref([])

function formatNumber(value) {
  return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
}

function getPercentage(amount) {
  const total = statusReport.value.reduce((sum, item) => sum + item.amount, 0)
  return total > 0 ? (amount / total * 100).toFixed(1) : 0
}

async function calculate() {
  try {
    loading.value = true
    error.value = null
    results.value = { revenue: 0, cogs: 0, grossProfit: 0, expenses: 0, salaryPayments: 0, netProfit: 0 }

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

    // 3) sum expenses.amount in date range
    const { data: exps, error: expErr } = await supabase
      .from('expenses')
      .select('amount')
      .gte('expense_date', fromISO)
      .lte('expense_date', toISO)

    if (expErr) throw expErr
    results.value.expenses = (exps || []).reduce((s, r) => s + Number(r.amount || 0), 0)

    // 4) sum salary_payments.amount in date range
    const { data: salaries, error: salErr } = await supabase
      .from('salary_payments')
      .select('amount')
      .gte('payment_date', fromISO)
      .lte('payment_date', toISO)

    if (salErr) throw salErr
    results.value.salaryPayments = (salaries || []).reduce((s, r) => s + Number(r.amount || 0), 0)

    // final net profit
    results.value.netProfit = results.value.grossProfit  - results.value.expenses - results.value.salaryPayments

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
/* iOS Compatibility */
* {
  -webkit-overflow-scrolling: touch;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  min-height: 100vh;
  /* iOS safe area support */
  padding-bottom: calc(24px + env(safe-area-inset-bottom));
}

/* Page Header */
.page-header {
  margin-bottom: 32px;
  animation: slideDown 0.5s ease-out;
  /* iOS transform fix */
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
    -webkit-transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    -webkit-transform: translateY(0);
  }
}

.header-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-icon {
  font-size: 56px;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    -webkit-transform: scale(1);
  }
  50% {
    transform: scale(1.05);
    -webkit-transform: scale(1.05);
  }
}

.page-header h1 {
  margin: 0;
  font-size: 32px;
  font-weight: 800;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  /* iOS gradient text fix */
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
}

.subtitle {
  margin: 4px 0 0 0;
  font-size: 16px;
  color: #718096;
  font-weight: 500;
}

/* Filters Card */
.filters-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  animation: fadeIn 0.5s ease-out 0.1s both;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tabs-inline {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  padding: 8px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
  border-radius: 16px;
}

.tab-btn {
  flex: 1;
  background: transparent;
  border: none;
  padding: 14px 20px;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-weight: 700;
  font-size: 15px;
  color: #475569;
  transition: all 0.3s ease;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  min-height: 48px; /* iOS touch target */
}

.tab-btn svg {
  transition: transform 0.3s ease;
  -webkit-transition: transform 0.3s ease;
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.6);
  transform: translateY(-2px);
  -webkit-transform: translateY(-2px);
}

.tab-btn:hover svg {
  transform: scale(1.1);
  -webkit-transform: scale(1.1);
}

.tab-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
}

.date-filters {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 16px;
  align-items: end;
}

.date-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.date-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  color: #334155;
}

.date-group label svg {
  color: #667eea;
}

.date-group input[type="date"] {
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px; /* Prevent iOS zoom on focus */
  transition: all 0.2s ease;
  background: white;
  -webkit-appearance: none;
  appearance: none;
}

.date-group input[type="date"]:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  /* Prevent iOS from adding default styling */
  -webkit-tap-highlight-color: transparent;
}

.btn-calculate {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.25);
  min-height: 48px; /* iOS touch target size */
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  -webkit-user-select: none;
  user-select: none;
}

.btn-calculate:hover:not(:disabled) {
  transform: translateY(-3px);
  -webkit-transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.35);
}

.btn-calculate:active:not(:disabled) {
  transform: translateY(-1px);
  -webkit-transform: translateY(-1px);
}

.btn-calculate:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error Message */
.error-message {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 16px;
  color: #b91c1c;
  font-weight: 600;
  margin-bottom: 24px;
  animation: shake 0.5s ease-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

/* Results Section */
.results {
  animation: fadeIn 0.5s ease-out 0.2s both;
}

/* Summary Cards */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.summary-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.summary-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.summary-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
}

.card-icon {
  font-size: 48px;
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  flex-shrink: 0;
}

.summary-card.orders .card-icon {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%);
}

.summary-card.revenue .card-icon {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.1) 100%);
}

.summary-card.profit .card-icon {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(126, 34, 206, 0.1) 100%);
}

.summary-card.profit.profit-negative .card-icon {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%);
}

.card-content {
  flex: 1;
}

.card-label {
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-value {
  font-size: 32px;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 4px;
}

.summary-card.profit.profit-positive .card-value {
  color: #16a34a;
}

.summary-card.profit.profit-negative .card-value {
  color: #dc2626;
}

.card-sublabel {
  font-size: 13px;
  color: #94a3b8;
  font-weight: 600;
}

/* Data Card */
.data-card {
  background: white;
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 24px 0;
  padding-bottom: 16px;
  border-bottom: 2px solid #f1f5f9;
}

.card-title svg {
  color: #667eea;
}

/* Detail Table */
.table-wrapper {
  overflow-x: auto;
  margin-bottom: 20px;
}

.detail-table {
  width: 100%;
  border-collapse: collapse;
}

.detail-table tbody tr {
  transition: all 0.2s ease;
}

.detail-table tbody tr:hover {
  background: linear-gradient(90deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%);
}

.detail-table tbody tr.highlight {
  background: linear-gradient(90deg, rgba(102, 126, 234, 0.06) 0%, rgba(118, 75, 162, 0.06) 100%);
}

.detail-table tbody tr.separator {
  border-top: 2px solid #e2e8f0;
  border-bottom: 2px solid #e2e8f0;
}

.detail-table td {
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
}

.detail-table td.label {
  font-weight: 600;
  color: #475569;
  width: 60%;
}

.label-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.label-icon {
  font-size: 20px;
  width: 32px;
  text-align: center;
}

.detail-table td.value {
  text-align: right;
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  font-family: 'Courier New', monospace;
}

.detail-table td.value.primary {
  color: #667eea;
  font-size: 20px;
}

.detail-table td.value.success {
  color: #16a34a;
  font-size: 20px;
}

.detail-table td.value.expense {
  color: #ef4444;
}

.detail-table tfoot tr.total-row {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
}

.detail-table tfoot td {
  padding: 20px 16px;
  border: none;
  font-size: 18px;
}

.detail-table tfoot td.value.total {
  font-size: 28px;
  font-weight: 900;
}

.detail-table tfoot.profit-positive tr.total-row {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.1) 100%);
}

.detail-table tfoot.profit-positive td.value.total {
  color: #16a34a;
}

.detail-table tfoot.profit-negative tr.total-row {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%);
}

.detail-table tfoot.profit-negative td.value.total {
  color: #dc2626;
}

/* Notes */
.notes {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.06) 0%, rgba(37, 99, 235, 0.06) 100%);
  border-radius: 12px;
  border-left: 4px solid #3b82f6;
}

.notes svg {
  flex-shrink: 0;
  margin-top: 2px;
  color: #3b82f6;
}

.notes p {
  margin: 0;
  font-size: 14px;
  color: #475569;
  line-height: 1.6;
}

/* Status Section */
.status-legend {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.legend-dot.delivered {
  background: #16a34a;
}

.legend-dot.cancelled {
  background: #dc2626;
}

.legend-dot.info {
  background: #3b82f6;
}

.legend-dot.design {
  background: #f59e0b;
}

/* No Data */
.no-data {
  text-align: center;
  padding: 60px 20px;
  color: #94a3b8;
}

.no-data svg {
  color: #cbd5e1;
  margin-bottom: 16px;
}

.no-data p {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

/* Status Grid */
.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.status-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  border: 2px solid #f1f5f9;
  transition: all 0.3s ease;
}

.status-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.status-card.status-delivered {
  border-color: rgba(34, 197, 94, 0.3);
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.03) 0%, rgba(22, 163, 74, 0.03) 100%);
}

.status-card.status-cancelled {
  border-color: rgba(239, 68, 68, 0.3);
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.03) 0%, rgba(220, 38, 38, 0.03) 100%);
}

.status-card.status-info {
  border-color: rgba(59, 130, 246, 0.3);
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.03) 0%, rgba(37, 99, 235, 0.03) 100%);
}

.status-card.status-design {
  border-color: rgba(245, 158, 11, 0.3);
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.03) 0%, rgba(217, 119, 6, 0.03) 100%);
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.status-name {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
}

.status-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
}

.status-amount {
  font-size: 24px;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 12px;
  font-family: 'Courier New', monospace;
}

.status-bar {
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.status-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.5s ease-out;
  border-radius: 4px;
}

.status-card.status-delivered .status-fill {
  background: linear-gradient(90deg, #16a34a 0%, #22c55e 100%);
}

.status-card.status-cancelled .status-fill {
  background: linear-gradient(90deg, #dc2626 0%, #ef4444 100%);
}

.status-card.status-info .status-fill {
  background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%);
}

.status-card.status-design .status-fill {
  background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%);
}

/* Responsive Design */
@media (max-width: 992px) {
  .summary-cards {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
}

@media (max-width: 768px) {
  .container {
    padding: 12px;
  }

  .page-header {
    margin-bottom: 20px;
  }

  .header-content {
    gap: 16px;
  }

  .page-header h1 {
    font-size: 22px;
  }

  .subtitle {
    font-size: 14px;
  }

  .header-icon {
    width: 60px;
    height: 60px;
    font-size: 36px;
    border-radius: 16px;
  }

  .filters-card {
    padding: 16px;
    margin-bottom: 16px;
  }

  .tabs-inline {
    margin-bottom: 20px;
  }

  .tab-btn {
    padding: 12px 16px;
    font-size: 14px;
  }

  .date-filters {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .btn-calculate {
    width: 100%;
    justify-content: center;
  }

  .summary-cards {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 16px;
  }

  .summary-card {
    padding: 20px;
  }

  .card-icon {
    width: 60px;
    height: 60px;
    font-size: 40px;
  }

  .card-value {
    font-size: 26px;
  }

  .card-label {
    font-size: 13px;
  }

  .data-card {
    padding: 20px;
    margin-bottom: 16px;
  }

  .card-title {
    font-size: 18px;
    margin-bottom: 20px;
    padding-bottom: 12px;
  }

  .detail-table td {
    padding: 14px 12px;
  }

  .detail-table td.label {
    font-size: 14px;
    width: 50%;
  }

  .label-icon {
    font-size: 18px;
    width: 28px;
  }

  .detail-table td.value {
    font-size: 15px;
  }

  .detail-table td.value.primary,
  .detail-table td.value.success {
    font-size: 17px;
  }

  .detail-table tfoot td {
    padding: 16px 12px;
  }

  .detail-table tfoot td.value.total {
    font-size: 22px;
  }

  .status-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .status-card {
    padding: 16px;
  }

  .status-amount {
    font-size: 20px;
  }

  .status-legend {
    padding: 12px;
    gap: 12px;
  }

  .legend-item {
    font-size: 13px;
  }

  .notes {
    padding: 14px;
  }

  .notes p {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 8px;
  }

  .page-header h1 {
    font-size: 20px;
  }

  .subtitle {
    font-size: 13px;
  }

  .header-icon {
    width: 56px;
    height: 56px;
    font-size: 32px;
  }

  .filters-card {
    padding: 12px;
  }

  .tabs-inline {
    padding: 6px;
    gap: 8px;
  }

  .tab-btn {
    padding: 10px 12px;
    font-size: 13px;
    gap: 6px;
  }

  .tab-btn svg {
    width: 16px;
    height: 16px;
  }

  .date-group label {
    font-size: 13px;
  }

  .date-group input[type="date"] {
    padding: 10px 12px;
    font-size: 14px;
  }

  .btn-calculate {
    padding: 12px 20px;
    font-size: 14px;
  }

  .summary-card {
    padding: 16px;
    flex-direction: row;
  }

  .card-icon {
    width: 56px;
    height: 56px;
    font-size: 36px;
  }

  .card-label {
    font-size: 12px;
  }

  .card-value {
    font-size: 22px;
  }

  .card-sublabel {
    font-size: 12px;
  }

  .data-card {
    padding: 16px;
  }

  .card-title {
    font-size: 16px;
    flex-wrap: wrap;
  }

  .card-title svg {
    width: 18px;
    height: 18px;
  }

  /* Make table more compact on mobile */
  .detail-table td {
    padding: 12px 8px;
  }

  .detail-table td.label {
    font-size: 13px;
  }

  .label-content {
    gap: 8px;
  }

  .label-icon {
    font-size: 16px;
    width: 24px;
  }

  .detail-table td.value {
    font-size: 14px;
  }

  .detail-table td.value.primary,
  .detail-table td.value.success {
    font-size: 16px;
  }

  .detail-table td.value.expense {
    font-size: 13px;
  }

  .detail-table tfoot td {
    padding: 14px 8px;
    font-size: 15px;
  }

  .detail-table tfoot td.value.total {
    font-size: 20px;
  }

  .status-card {
    padding: 14px;
  }

  .status-header {
    margin-bottom: 12px;
  }

  .status-name {
    font-size: 14px;
  }

  .status-badge {
    padding: 3px 10px;
    font-size: 12px;
  }

  .status-amount {
    font-size: 18px;
    margin-bottom: 10px;
  }

  .status-bar {
    height: 6px;
  }

  .status-legend {
    flex-direction: column;
    align-items: flex-start;
  }

  .legend-item {
    font-size: 12px;
  }

  .legend-dot {
    width: 10px;
    height: 10px;
  }

  .notes {
    padding: 12px;
    flex-direction: column;
    align-items: flex-start;
  }

  .notes p {
    font-size: 12px;
  }

  .error-message {
    padding: 12px 14px;
    font-size: 13px;
  }

  .error-message svg {
    width: 18px;
    height: 18px;
  }

  .no-data {
    padding: 40px 16px;
  }

  .no-data svg {
    width: 40px;
    height: 40px;
  }

  .no-data p {
    font-size: 14px;
  }
}

/* Extra small devices (very small phones) */
@media (max-width: 360px) {
  .page-header h1 {
    font-size: 18px;
  }

  .header-icon {
    width: 48px;
    height: 48px;
    font-size: 28px;
  }

  .card-value {
    font-size: 20px;
  }

  .detail-table td.label {
    font-size: 12px;
  }

  .detail-table td.value {
    font-size: 13px;
  }

  .detail-table tfoot td.value.total {
    font-size: 18px;
  }

  .status-amount {
    font-size: 16px;
  }
}

/* Landscape orientation on mobile */
@media (max-width: 768px) and (orientation: landscape) {
  .summary-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .status-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
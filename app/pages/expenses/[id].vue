<template>
  <div class="container">
    <div class="header">
      <button class="btn-back" @click="router.push('/expenses')">← ກັບ</button>
      <h1>ລາຍລະອຽດ</h1>
    </div>

    <div v-if="loading" class="loading">ກຳລັງໂຫລດ...</div>
    <div v-else-if="!expense" class="error">ບໍ່ພົບຂໍ້ມູນ</div>
    <div v-else class="detail-card">
      <div class="info">
        <div class="row"><strong>ວັນທີ່:</strong> {{ formatDate(expense.expense_date) }}</div>
        <div class="row"><strong>ໝວດໝູ່:</strong> {{ expense.category?.name || '-' }}</div>
        <div class="row"><strong>ຈໍານວນເງິນ:</strong> {{ formatNumber(expense.amount) }} LAK</div>
        <div class="row" v-if="expense.remark"><strong>ໝາຍເຫດ:</strong> {{ expense.remark }}</div>
      </div>

      <div v-if="expense.image_url" class="receipt">
        <h3>ຮູບໃບບີນ</h3>
        <img :src="expense.image_url" alt="receipt" />
        <a :href="expense.image_url" target="_blank" class="btn-link">ເປີດຮູບໃນແຖບໃໝ່</a>
      </div>

    </div>

    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
const route = useRoute()
const supabase = useSupabaseClient()
const id = route.params.id
const router = useRouter()

const expense = ref(null)
const loading = ref(true)
const error = ref(null)

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

async function fetchExpense() {
  try {
    loading.value = true
    const { data, error: fetchError } = await supabase.from('expenses').select('*, category:expense_categories(name)').eq('id', id).single()
    if (fetchError) throw fetchError
    expense.value = data
  } catch (err) {
    error.value = 'ບໍ່ສາມາດໂຫລດຂໍ້ມູນໄດ້: ' + err.message
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchExpense()
})
</script>

<style scoped>
.container { max-width: 900px; margin: 0 auto; padding: 20px }
.header { display: flex; gap: 16px; align-items: center; margin-bottom: 20px }
.btn-back { padding: 8px 12px; border: none; background: #f0f0f0; border-radius: 6px }
.detail-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.06) }
.info .row { margin-bottom: 8px }
.receipt img { max-width: 100%; height: auto; border-radius: 6px; margin-top: 8px }
.btn-link { display: inline-block; margin-top: 8px; color: #667eea }
.error { color: #b00020 }
.loading { color: #666 }
</style>
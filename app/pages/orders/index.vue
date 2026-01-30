<template>
  <div class="container">
    <h1>ອໍເດີລູກຄ້າ</h1>
    
    <!-- Tabs -->
    <div class="tabs">
      <button 
        :class="['tab-btn', { active: activeTab === 'create' }]"
        @click="activeTab = 'create'"
      >
        ➕ ສ້າງອໍເດີໃໝ່
      </button>
      <button 
        :class="['tab-btn', { active: activeTab === 'list' }]"
        @click="activeTab = 'list'"
      >
        📋ລາຍການ Order
      </button>
    </div>
    
    <!-- ແບບຟອມສ້າງອໍເດີໃໝ່ -->
    <div class="order-form" v-show="activeTab === 'create'">
      <h2>{{ isEditing ? 'ແກ້ໄຂອໍເດີ' : 'ສ້າງອໍເດີໃໝ່' }}</h2>
      <form @submit.prevent="saveOrder">
        <!-- ຂໍ້ມູນລູກຄ້າ -->
        <div class="section">
          <h3>ຂໍ້ມູນລູກຄ້າ</h3>
          <div class="form-row">
            <div class="form-group">
              <label>ຊື່ລູກຄ້າ: *</label>
              <input 
                v-model="form.customer_name" 
                type="text" 
                required 
                placeholder="ຊື່ລູກຄ້າ / facebook name"
              />
            </div>
            <div class="form-group">
              <label>ຊື່ລູກ: *</label>
              <input 
                v-model="form.customer_clid" 
                type="text" 
                required 
                placeholder="ຊື່ລູກ ຂອງລູກຄ້າ"
              />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>ຈາກເພກ:</label>
              <select v-model="form.frompage">
                <option value="">-- ເລືອກເພກ --</option>
                <option v-for="page in pages" :key="page.id" :value="page.page_name">
                  {{ page.page_name }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- ລາຍການສິນຄ້າ -->
        <div class="section">
          <h3>ລາຍການສິນຄ້າ</h3>
          <div v-for="(item, index) in form.items" :key="index" class="order-item">
            <div class="item-row">
              <div class="form-group flex-2">
                <label>ສິນຄ້າ:</label>
                <select 
                  v-model="item.variant_id" 
                  @change="updateItemPrice(index)"
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
                      :disabled="variant.stock_qty === 0"
                    >
                      <!-- {{ variant.color }} - {{ variant.size }} ( {{ variant.stock_qty }}) - {{ formatNumber(product.base_price) }} LAK -->
                         {{ variant.color }} - {{ variant.size }} ( Stock: {{ variant.stock_qty }})  LAK
                    </option>
                  </optgroup>
                </select>
              </div>
                 
              <div class="form-group">
                <label>ຈຳນວນ:</label>
                <input 
                  v-model.number="item.quantity" 
                  type="number" 
                  min="1"
                  :max="getMaxStock(item.variant_id)"
                  required 
                />
              </div>
              
              <div class="form-group">
                <label>ຂະໜາດ:</label>
                <input 
                  v-model="item.size" 
                  type="text" 
                  placeholder="ຂະໜາດ"
                />
              </div>
              
              <div class="form-group">
                <label>ລາຄາ/ອັນ:</label>
                <input 
                  v-model.number="item.unit_price" 
                  type="number" 
                  step="0.01"
                  min="0"
                  required 
                />
              </div>

              <div class="form-group">
                <label>ລວມ:</label>
                <input 
                  :value="formatNumber(item.quantity * item.unit_price)" 
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

        <!-- ຂໍ້ມູນການຊໍາລະເງິນແລະຈັດສົ່ງ -->
        <div class="section">
          <h3>ຂໍ້ມູນ</h3>

          <div class="form-row">
            <div class="form-group">
            <label>ທີ່ຢູ່, ເບິໂທ, ຂົນສົ່ງ ....:</label>
            <textarea 
              v-model="form.notes" 
              rows="3"
              placeholder="ອນສ ໂນຫວາຍ, 567890123, ..."
            ></textarea>
          </div>
            <!-- <div class="form-group">
              <label>ລາຄາລວມ:</label>
              <input 
                :value="formatNumber(totalItemsAmount)" 
                type="text" 
                readonly
                class="readonly total"
              />
            </div> -->
            <div class="form-group">
              <label>ຄ່າສົ່ງ/ຄ່າໃຊ້ຈ່າຍອື່ນ:</label>
              <input 
                v-model.number="form.other_expenses" 
                type="number" 
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>ຍອດລວມທັງໝົດ:</label>
              <input 
                :value="formatNumber(grandTotal)" 
                type="text" 
                readonly
                class="readonly grand-total"
              />
            </div>
            <div class="form-group">
              <label>ສະຖານະ:</label>
              <select v-model="form.status">
                <option v-for="status in orderStatuses" :key="status.id" :value="status.status">
                  {{ status.status }}
                </option>
              </select>
            </div>
          </div>

      

          

          <div class="form-group">
            <label>ຮູບພາບ:</label>
            <div class="image-upload">
              <input 
                type="file" 
                ref="fileInput"
                accept="image/*"
                multiple
                @change="handleFileUpload"
                style="display: none"
              />
              <button type="button" class="btn-upload-file" @click="$refs.fileInput.click()">
                📁 ເລືອກຮູບພາບ
              </button>
              <!-- <input 
                type="text" 
                v-model="newImageUrl" 
                placeholder="หรือวาง URL รูปภาพ"
                @keyup.enter="addImage"
              /> -->
              <!-- <button type="button" class="btn-add-image" @click="addImage">
                ➕ เพิ่ม URL
              </button> -->
            </div>
            <div v-if="uploading" class="upload-progress">
              กำลังอัพโหลด... {{ uploadProgress }}%
            </div>
            <div v-if="form.image_urls.length > 0" class="image-preview-grid">
              <div 
                v-for="(url, index) in form.image_urls" 
                :key="index"
                class="image-preview-item"
              >
                <img :src="url" :alt="`Image ${index + 1}`" />
                <button 
                  type="button" 
                  class="btn-remove-image" 
                  @click="removeImage(index)"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-primary">
            {{ isEditing ? 'ບັນທຶກການແກ້ໄຂ' : 'ສ້າງອໍເດີ' }}
          </button>
          <button 
            v-if="isEditing" 
            type="button" 
            class="btn-secondary" 
            @click="cancelEdit"
          >
            ยกเลิก
          </button>
        </div>
      </form>
    </div>

    <!-- ตารางแสดงออเดอร์ -->
    <div class="orders-list" v-show="activeTab === 'list'">
      <h2>ລາຍການ Order</h2>
      
      <!-- ຟິວເຕີສະຖານະ -->
      <div class="filters">
        <button 
          v-for="s in statuses" 
          :key="s"
          :class="['filter-btn', { active: statusFilter === s }]"
          @click="statusFilter = s"
        >
          {{ s }}
        </button>
      </div>

      <!-- Search Filters -->
      <div class="search-filters">
        <div class="search-group">
          <label>ຄົ້ນຫາລູກຄ້າ:</label>
          <input 
            v-model="searchCustomer"
            type="text"
            placeholder="ປ້ອນຊື່ລູກຄ້າ..."
            class="search-input"
          />
        </div>
        <div class="search-group">
          <label>ຄົ້ນຫາລູກ:</label>
          <input 
            v-model="searchChild"
            type="text"
            placeholder="ປ້ອນຊື່ລູກ..."
            class="search-input"
          />
        </div>

        <!-- Date range filter -->
        <div class="search-group date-range">
          <label>From:</label>
          <input type="date" v-model="fromDate" class="date-input" />
          <label>To:</label>
          <input type="date" v-model="toDate" class="date-input" />
        </div>

        <button 
          v-if="searchCustomer || searchChild || fromDate || toDate"
          class="btn-clear-search"
          @click="searchCustomer = ''; searchChild = ''; fromDate = ''; toDate = ''"
        >
          ✕ Clear Filters
        </button>
      </div>

      <div v-if="loading" class="loading">ກຳລັງໂຫລດ...</div>
      <div v-else-if="filteredOrders.length === 0" class="no-data">
        ບໍ່ມີອອເດີ້{{ statusFilter !== 'ທັງໝົດ' ? 'ໃນສະຖານະນີ້' : '' }}
      </div>
      <div v-else>
        <div class="table-info">
          <span>ສະແດງ {{ ((currentPage - 1) * itemsPerPage) + 1 }} - {{ Math.min(currentPage * itemsPerPage, filteredOrders.length) }} ຈາກທັງໝົດ {{ filteredOrders.length }} ອໍເດີ</span>
        </div>
        
        <div class="table-container">
          <table class="orders-table">
            <thead>
              <tr>
                <th>#</th>
                <th>ວັນທີ</th>
                <th>ລູກຄ້າ</th>
                <th>ລູກ</th>
                <th>ເພກ</th>
                <th>ຮູບພາບ</th>
                <th>ຍອດລວມ</th>
                <th>ສະຖານະ</th>
                <th>ທີ່ຢູ່, ເບິໂທ, ຂົນສົ່ງ ....</th>
                <th>ເບີ່ງ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(order, index) in paginatedOrders" :key="order.id" :class="{'cancelled-row': order.status === 'ຍົກເລີກ'}">
                <td>{{ ((currentPage - 1) * itemsPerPage) + index + 1 }}</td>
                <td>{{ formatDate(order.order_date) }}</td>
                <td class="customer-name">{{ order.customer_name }}</td>
                <td>{{ order.customer_clid }}</td>
                <td>{{ order.frompage || '-' }}</td>
                <td class="image-cell">
                  <div v-if="order.image_urls && order.image_urls.length > 0" class="image-preview">
                    <img 
                      :src="order.image_urls[0]" 
                      :alt="`Order image`"
                      class="thumbnail"
                      @click="openImageViewer(order.image_urls, 0)"
                    />
                    <button 
                      v-if="order.image_urls.length > 0"
                      class="btn-view-images"
                      @click="openImageViewer(order.image_urls, 0)"
                      :title="`ເບິ່ງຮູບພາບ ${order.image_urls.length} ຮູບ`"
                    >
                      🖼️ {{ order.image_urls.length }}
                    </button>
                  </div>
                  <span v-else>-</span>
                </td>
                <td class="amount">{{ formatNumber(order.total_amount) }}</td>
                <td>
                  <span class="status-badge">
                    {{ order.status }}
                  </span>
                </td>
                <td class="notes-cell">{{ order.notes || '-' }}</td>
                <td class="actions-cell">
                  <button class="btn-detail" @click="viewOrder(order.id)" title="ລາຍລະອຽດ">
                    👁️
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination" v-if="totalPages > 1">
          <button 
            class="page-btn"
            @click="goToPage(1)"
            :disabled="currentPage === 1"
          >
            ≪
          </button>
          <button 
            class="page-btn"
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
          >
            ‹
          </button>
          
          <template v-for="page in totalPages" :key="page">
            <button 
              v-if="page === 1 || page === totalPages || (page >= currentPage - 2 && page <= currentPage + 2)"
              :class="['page-btn', { active: page === currentPage }]"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
            <span v-else-if="page === currentPage - 3 || page === currentPage + 3" class="dots">...</span>
          </template>

          <button 
            class="page-btn"
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
          >
            ›
          </button>
          <button 
            class="page-btn"
            @click="goToPage(totalPages)"
            :disabled="currentPage === totalPages"
          >
            ≫
          </button>
        </div>
      </div>
    </div>

    <!-- Image Modal -->
    <div v-if="showImageModal" class="image-modal" @click="closeImageViewer">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="closeImageViewer">✕</button>
        
        <div class="modal-image-container">
          <button 
            class="modal-nav prev"
            @click="prevImage"
            :disabled="currentImageIndex === 0"
            v-if="modalImages.length > 1"
          >
            ‹
          </button>
          
          <img 
            :src="modalImages[currentImageIndex]" 
            :alt="`Image ${currentImageIndex + 1}`"
            class="modal-image"
          />
          
          <button 
            class="modal-nav next"
            @click="nextImage"
            :disabled="currentImageIndex === modalImages.length - 1"
            v-if="modalImages.length > 1"
          >
            ›
          </button>
        </div>
        
        <div class="modal-counter" v-if="modalImages.length > 1">
          {{ currentImageIndex + 1 }} / {{ modalImages.length }}
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
const orders = ref([])
const products = ref([])
const pages = ref([])
const orderStatuses = ref([])
const loading = ref(true)
const error = ref(null)
const isEditing = ref(false)
const editingId = ref(null)
const statusFilter = ref('ທັງໝົດ')
const newImageUrl = ref('')
const uploading = ref(false)
const uploadProgress = ref(0)
const fileInput = ref(null)
const currentPage = ref(1)
const itemsPerPage = 20
const showImageModal = ref(false)
const modalImages = ref([])
const currentImageIndex = ref(0)
const activeTab = ref('list') // 'create' or 'list'
const searchCustomer = ref('')
const searchChild = ref('')
const fromDate = ref('')
const toDate = ref('')

const statuses = computed(() => ['ທັງໝົດ', ...orderStatuses.value.map(s => s.status)])

const form = ref({
  customer_name: '',
  customer_clid: '',
  other_expenses: 0,
  status: 'ອອກແບບ',
  frompage: '',
  notes: '',
  image_urls: [],
  items: [
    {
      variant_id: '',
      quantity: 1,
      unit_price: 0,
      size: ''
    }
  ]
})

// Computed
const totalItemsAmount = computed(() => {
  return form.value.items.reduce((sum, item) => {
    return sum + (item.quantity * item.unit_price)
  }, 0)
})

const grandTotal = computed(() => {
  return totalItemsAmount.value + (form.value.other_expenses || 0)
})

const filteredOrders = computed(() => {
  let result = orders.value
  
  // Filter by status
  if (statusFilter.value !== 'ທັງໝົດ') {
    result = result.filter(o => o.status === statusFilter.value)
  }
  
  // Filter by customer name
  if (searchCustomer.value.trim()) {
    result = result.filter(o => 
      o.customer_name.toLowerCase().includes(searchCustomer.value.toLowerCase())
    )
  }
  
  // Filter by child name
  if (searchChild.value.trim()) {
    result = result.filter(o => 
      o.customer_clid.toLowerCase().includes(searchChild.value.toLowerCase())
    )
  }

  // Filter by from/to date range (order_date)
  if (fromDate.value) {
    const start = new Date(fromDate.value)
    start.setHours(0,0,0,0)
    result = result.filter(o => new Date(o.order_date) >= start)
  }

  if (toDate.value) {
    const end = new Date(toDate.value)
    end.setHours(23,59,59,999)
    result = result.filter(o => new Date(o.order_date) <= end)
  }
  
  return result
})

const totalPages = computed(() => {
  return Math.ceil(filteredOrders.value.length / itemsPerPage)
})

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredOrders.value.slice(start, end)
})

// ดึงข้อมูลสินค้าและ variants
async function fetchProducts() {
  try {
    const { data, error: fetchError } = await supabase
      .from('products')
      .select(`
        id,
        name,
        base_price,
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

// ດຶງຂໍ້ມູນເພກ
async function fetchPages() {
  try {
    const { data, error: fetchError } = await supabase
      .from('tb_page')
      .select('id, page_name')
      .order('page_name', { ascending: true })
    
    if (fetchError) throw fetchError
    
    pages.value = data || []
  } catch (err) {
    console.error('Error fetching pages:', err)
  }
}

// ດຶງຂໍ້ມູນສະຖານະອໍເດີ
async function fetchStatuses() {
  try {
    const { data, error: fetchError } = await supabase
      .from('tb_order_status')
      .select('id, status')
      .order('id', { ascending: true })
    
    if (fetchError) throw fetchError
    
    orderStatuses.value = data || []
  } catch (err) {
    console.error('Error fetching statuses:', err)
  }
}

// ดึงข้อมูลออเดอร์
async function fetchOrders() {
  try {
    loading.value = true
    error.value = null
    
    const { data, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .order('order_date', { ascending: false })
    
    if (fetchError) throw fetchError
    
    orders.value = data || []
  } catch (err) {
    error.value = 'ບໍ່ສາມາດໂຫລດຂໍ້ມູນອອເດີໄດ້: ' + err.message
    console.error('Error fetching orders:', err)
  } finally {
    loading.value = false
  }
}

// บันทึกออเดอร์
async function saveOrder() {
  try {
    error.value = null
    
    // ตรวจสอบสต็อก
    for (const item of form.value.items) {
      if (!item.variant_id) {
        error.value = 'ກະລຸນາເລືອກສິນຄ້າໃຫ້ຄົບທຸກລາຍການ'
        return
      }
      
      const maxStock = getMaxStock(item.variant_id)
      if (item.quantity > maxStock) {
        error.value = `ສະຕ໋ອກບໍ່ພຽງພໍ (ເຫຼືອ ${maxStock} ອັນ)`
        return
      }
    }
    
    // บันทึกออเดอร์
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([{
        customer_name: form.value.customer_name,
        customer_clid: form.value.customer_clid,
        total_amount: grandTotal.value,
        other_expenses: form.value.other_expenses || 0,
        status: form.value.status,
        frompage: form.value.frompage || null,
        notes: form.value.notes || null,
        image_urls: form.value.image_urls.length > 0 ? form.value.image_urls : []
      }])
      .select()
    
    if (orderError) throw orderError
    
    const orderId = orderData[0].id
    
    // บันทึกรายการสินค้า
    const orderItems = form.value.items.map(item => ({
      order_id: orderId,
      variant_id: item.variant_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      size: item.size || null
    }))
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
    
    if (itemsError) throw itemsError
    
    // ลดสต็อก
    for (const item of form.value.items) {
      const { data: variantData } = await supabase
        .from('product_variants')
        .select('stock_qty')
        .eq('id', item.variant_id)
        .single()
      
      const newStock = variantData.stock_qty - item.quantity
      
      const { error: stockError } = await supabase
        .from('product_variants')
        .update({ stock_qty: newStock })
        .eq('id', item.variant_id)
      
      if (stockError) throw stockError
    }
    
    resetForm()
    await fetchOrders()
    await fetchProducts()
    activeTab.value = 'list'
    
  } catch (err) {
    error.value = 'ບໍ່ສາມາດບັນທຶກອອເດີໄດ້: ' + err.message
    console.error('Error saving order:', err)
  }
}

// ลบออเดอร์
async function deleteOrder(id) {
  if (!confirm('ທ່ານຕ້ອງການລົບອອເດີ້ນີ້ແມ່ນບໍ? (ສະຕ໋ອກຈະບໍ່ຖືກຄືນ)')) return
  
  try {
    const { error: deleteError } = await supabase
      .from('orders')
      .delete()
      .eq('id', id)
    
    if (deleteError) throw deleteError
    
    await fetchOrders()
  } catch (err) {
    error.value = 'ບໍ່ສາມາດລົບອອເດີໄດ້: ' + err.message
  }
}

// ดูรายละเอียดออเดอร์
function viewOrder(id) {
  // pass the current status filter to the detail page so prev/next can respect it
  const status = statusFilter.value || ''
  // don't include 'ທັງໝົດ' (All) in the query — it means no filter
  const query = (status && status !== 'ທັງໝົດ') ? `?status=${encodeURIComponent(status)}` : ''
  navigateTo(`/orders/${id}${query}`)
}

// ฟังก์ชันช่วย
function addItem() {
  form.value.items.push({
    variant_id: '',
    quantity: 1,
    unit_price: 0,
    size: ''
  })
}

function removeItem(index) {
  form.value.items.splice(index, 1)
}

function updateItemPrice(index) {
  const item = form.value.items[index]
  if (!item.variant_id) return
  
  // หาราคาจาก product
  for (const product of products.value) {
    const variant = product.variants.find(v => v.id === item.variant_id)
    if (variant) {
      item.unit_price = product.base_price
      item.size = variant.size || ''
      break
    }
  }
}

function getMaxStock(variantId) {
  if (!variantId) return 0
  
  for (const product of products.value) {
    const variant = product.variants.find(v => v.id === variantId)
    if (variant) return variant.stock_qty
  }
  return 0
}

function cancelEdit() {
  resetForm()
}

function resetForm() {
  isEditing.value = false
  editingId.value = null
  newImageUrl.value = ''
  form.value = {
    customer_name: '',
    customer_clid: '',
    other_expenses: 0,
    status: 'ອອກແບບ',
    frompage: '',
    notes: '',
    image_urls: [],
    items: [{
      variant_id: '',
      quantity: 1,
      unit_price: 0
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

function addImage() {
  if (newImageUrl.value.trim()) {
    form.value.image_urls.push(newImageUrl.value.trim())
    newImageUrl.value = ''
  }
}

function removeImage(index) {
  form.value.image_urls.splice(index, 1)
}

function openImageViewer(images, startIndex = 0) {
  modalImages.value = images
  currentImageIndex.value = startIndex
  showImageModal.value = true
}

function closeImageViewer() {
  showImageModal.value = false
  modalImages.value = []
  currentImageIndex.value = 0
}

function nextImage() {
  if (currentImageIndex.value < modalImages.value.length - 1) {
    currentImageIndex.value++
  }
}

function prevImage() {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
  }
}

function goToPage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

watch([statusFilter, searchCustomer, searchChild, fromDate, toDate], () => {
  currentPage.value = 1
})

async function handleFileUpload(event) {
  const files = event.target.files
  if (!files || files.length === 0) return
  
  try {
    uploading.value = true
    uploadProgress.value = 0
    error.value = null
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${fileName}`
      
      const { data, error: uploadError } = await supabase.storage
        .from('order_image')
        .upload(filePath, file)
      
      if (uploadError) throw uploadError
      
      // Get public URL
      const { data: publicData } = supabase.storage
        .from('order_image')
        .getPublicUrl(filePath)
      
      form.value.image_urls.push(publicData.publicUrl)
      uploadProgress.value = Math.round(((i + 1) / files.length) * 100)
    }
    
    // Reset file input
    if (fileInput.value) {
      fileInput.value.value = ''
    }
    
  } catch (err) {
    error.value = 'ບໍ່ສາມາດອັບໂຫຼດຮູບພາບໄດ້: ' + err.message
    console.error('Error uploading images:', err)
  } finally {
    uploading.value = false
    uploadProgress.value = 0
  }
}

// โหลດข้อมูลเมื่อเริ่มต้น
onMounted(async () => {
  await fetchStatuses()
  await fetchPages()
  await fetchProducts()
  await fetchOrders()
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

/* ฟอร์ม */
.order-form {
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
  font-family: 'Phetsarath OT', sans-serif;
}

input, select, textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  font-family: 'Phetsarath OT', sans-serif;
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

input.total {
  font-weight: 600;
  color: #667eea;
  font-size: 1.1rem;
}

input.grand-total {
  font-weight: 700;
  color: #4CAF50;
  font-size: 1.2rem;
  background-color: #E8F5E9;
}

textarea {
  resize: vertical;
  font-family: 'Phetsarath OT', sans-serif;
}

.image-upload {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.image-upload input[type="text"] {
  flex: 1;
  min-width: 200px;
}

.btn-upload-file {
  background-color: #FF9800;
  color: white;
  white-space: nowrap;
}

.btn-upload-file:hover {
  background-color: #F57C00;
}

.btn-add-image {
  background-color: #2196F3;
  color: white;
  white-space: nowrap;
}

.btn-add-image:hover {
  background-color: #1976D2;
}

.upload-progress {
  background-color: #E3F2FD;
  color: #1976D2;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 10px;
  text-align: center;
  font-weight: 600;
}

.image-preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
  margin-top: 10px;
}

.image-preview-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #e0e0e0;
}

.image-preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-remove-image {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: rgba(244, 67, 54, 0.9);
  color: white;
  font-size: 0.9rem;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.btn-remove-image:hover {
  background-color: #d32f2f;
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

/* รายการออเดอร์ */
.orders-list {
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 8px 16px;
  background-color: #f0f0f0;
  color: #666;
  border: 2px solid transparent;
  font-family: 'Phetsarath OT', sans-serif;
}

.filter-btn:hover {
  background-color: #e0e0e0;
}

.filter-btn.active {
  background-color: #667eea;
  color: white;
  border-color: #5568d3;
}

.search-filters {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.search-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
  min-width: 200px;
}

.search-group label {
  font-weight: 600;
  color: #555;
  font-size: 0.9rem;
}

.search-input {
  padding: 8px 12px;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  font-family: 'Phetsarath OT', sans-serif;
  transition: border-color 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
}

.btn-clear-search {
  padding: 8px 16px;
  white-space: nowrap;
  align-self: flex-end;
}

/* Date range styles */
.search-group.date-range {
  /* occupy full row under the other search fields */
  display: flex;
  gap: 8px;
  align-items: center;
  flex: 1 1 100%;
  min-width: 0;
  flex-wrap: wrap;
  margin-top: 8px;
}
.search-group.date-range label {
  margin: 0 4px 0 0;
  align-self: center;
  white-space: nowrap;
}
.date-input {
  padding: 8px 10px;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-width: 160px;
}

.btn-clear-search:hover {
  background-color: #d32f2f;
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

.orders-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.orders-table thead {
  background-color: #667eea;
  color: white;
}

.orders-table th {
  padding: 12px 8px;
  text-align: left;
  font-weight: 600;
  white-space: nowrap;
  font-size: 0.95rem;
}

.orders-table td {
  padding: 12px 8px;
  border-bottom: 1px solid #eee;
  font-size: 0.9rem;
}

.orders-table tbody tr:hover {
  background-color: #f8f9fa;
}

.customer-name {
  font-weight: 600;
  color: #333;
}

.image-cell {
  text-align: center;
}

.image-preview {
  display: flex;
  align-items: center;
  gap: 8px;
}

.thumbnail {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  border: 2px solid #e0e0e0;
  transition: all 0.3s;
}

.thumbnail:hover {
  border-color: #667eea;
  transform: scale(1.1);
}

.btn-view-images {
  padding: 4px 8px;
  background-color: #667eea;
  color: white;
  font-size: 0.85rem;
  cursor: pointer;
  white-space: nowrap;
}

.btn-view-images:hover {
  background-color: #5568d3;
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
  text-align: center;
  vertical-align: middle;
}

.btn-detail {
  padding: 6px 10px;
  background-color: #667eea;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  border: none;
  border-radius: 4px;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  min-height: 40px;
}

.btn-detail:hover {
  background-color: #5568d3;
  transform: scale(1.05);
}

.status-badge {
  padding: 5px 12px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-design {
  background-color: #E3F2FD;
  color: #1976D2;
}

.status-screen {
  background-color: #FFF3E0;
  color: #E65100;
}

.status-paid {
  background-color: #F3E5F5;
  color: #7B1FA2;
}

.status-shipped {
  background-color: #E8F5E9;
  color: #2E7D32;
}

.order-details {
  margin-bottom: 15px;
}

.order-images {
  display: flex;
  gap: 5px;
  margin-bottom: 12px;
  align-items: center;
}

.order-thumbnail {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  border: 2px solid #e0e0e0;
}

.more-images {
  background-color: #667eea;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.95rem;
}

.detail-row .label {
  color: #666;
  font-weight: 600;
}

.detail-row .amount {
  color: #4CAF50;
  font-weight: 700;
  font-size: 1.1rem;
}

.order-actions {
  display: flex;
  gap: 10px;
}

.btn-view {
  flex: 1;
  background-color: #667eea;
  color: white;
  padding: 8px 16px;
}

.btn-view:hover {
  background-color: #5568d3;
}

.btn-delete-small {
  padding: 8px 12px;
  background-color: #f44336;
  color: white;
  font-size: 1.2rem;
}

.btn-delete-small:hover {
  background-color: #d32f2f;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  margin-top: 20px;
}

.page-btn {
  padding: 8px 12px;
  background-color: #f0f0f0;
  color: #333;
  border: 1px solid #ddd;
  cursor: pointer;
  font-size: 0.95rem;
  min-width: 40px;
}

.page-btn:hover:not(:disabled) {
  background-color: #667eea;
  color: white;
}

.page-btn.active {
  background-color: #667eea;
  color: white;
  border-color: #5568d3;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dots {
  padding: 0 5px;
  color: #999;
}

/* Image Modal */
.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  background: white;
  border-radius: 8px;
  padding: 20px;
}

.modal-close {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 40px;
  height: 40px;
  background-color: rgba(244, 67, 54, 0.9);
  color: white;
  font-size: 1.5rem;
  border-radius: 50%;
  cursor: pointer;
  z-index: 10001;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.modal-close:hover {
  background-color: #d32f2f;
}

.modal-image-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.modal-image {
  max-width: 80vw;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 4px;
}

.modal-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  background-color: rgba(102, 126, 234, 0.9);
  color: white;
  font-size: 2rem;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.modal-nav:hover:not(:disabled) {
  background-color: #5568d3;
}

.modal-nav:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.modal-nav.prev {
  left: -25px;
}

.modal-nav.next {
  right: -25px;
}

.modal-counter {
  text-align: center;
  margin-top: 15px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
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
  
  .order-form, .orders-list {
    padding: 20px;
  }
  
  .search-filters {
    flex-direction: column;
    gap: 10px;
  }
  
  .search-group {
    width: 100%;
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
  
  h2, h3 {
    font-size: 1.1rem;
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
  
  .order-form, .orders-list {
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
  
  .search-filters {
    padding: 12px;
  }
  
  .search-group input {
    font-size: 0.9rem;
    padding: 8px;
  }
  
  .table-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  .orders-table {
    font-size: 0.75rem;
    min-width: 800px;
  }
  
  .orders-table th,
  .orders-table td {
    padding: 8px 4px;
  }
  
  .thumbnail {
    width: 35px;
    height: 35px;
  }
  
  .image-preview {
    width: 50px;
    height: 50px;
  }
  
  .pagination {
    flex-wrap: wrap;
    gap: 5px;
    font-size: 0.85rem;
  }
  
  .page-btn {
    min-width: 35px;
    padding: 6px 10px;
  }
  
  .modal-content {
    margin: 20px;
    max-width: calc(100vw - 40px);
  }
  
  .modal-image {
    max-width: 95vw;
    max-height: 70vh;
  }
  
  .modal-nav.prev {
    left: 5px;
  }
  
  .modal-nav.next {
    right: 5px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .form-actions button {
    width: 100%;
  }
  
  button, input[type="file"] + label {
    font-size: 0.9rem;
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
  
  .order-form, .orders-list {
    padding: 12px;
  }
  
  input, select, textarea {
    font-size: 0.9rem;
    padding: 8px;
  }
  
  .orders-table {
    font-size: 0.7rem;
    min-width: 700px;
  }
  
  .thumbnail {
    width: 30px;
    height: 30px;
  }
  
  .pagination {
    font-size: 0.8rem;
  }
  
  .page-btn {
    min-width: 30px;
    padding: 4px 8px;
  }
  
  .modal-nav button {
    width: 35px;
    height: 35px;
    font-size: 1.2rem;
  }
}
</style>

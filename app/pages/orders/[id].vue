<template>
    <div class="container">
        <div class="header">
            <button class="btn-back" @click="navigateTo('/orders')">← ກັບຄືນ</button>
            <h1>ລາຍລະອຽດອໍເດີ</h1>
            <div class="header-actions">
                <button class="btn-nav btn-prev" @click="goToPrevOrder" :disabled="!prevOrderId">‹</button>
                <button class="btn-nav btn-next" @click="goToNextOrder" :disabled="!nextOrderId">›</button>

            </div>
            <!-- Sticker Print Modal removed: now opens in new tab -->
        </div>

        <div v-if="loading" class="loading">ກຳລັງໂຫລດ...</div>

        <div v-else-if="!order" class="error">
            ບໍ່ພົບຂໍ້ມູນອໍເດີ
        </div>

        <div v-else class="detail-container">
            <!-- ຂໍ້ມູນລູກຄ້າ -->
            <div class="order-info">
                <div class="order-info-top">
                    <h2>ຂໍ້ມູນອໍເດີ</h2>
                    <div class="order-status-actions">
                        <div class="status-label">
                            <span class="label">ສະຖານະ:</span>
                            <span class="value status">{{ order.status }}</span>
                        </div>
                        <div class="status-buttons">
                            <button v-if="order.status === 'ອອກແບບ'" class="btn-design-completed" @click="markDesignCompleted">Design completed</button>
                            <button v-if="order.status === 'ສັ່ງພີມ'" class="btn-update-status" @click="markNotifyCustomer">Update to : ແຈ້ງລູກຄ້າ</button>
                            <button v-if="order.status === 'ແຈ້ງລູກຄ້າ'" class="btn-update-status" @click="markDelivered">Update to: ຈັດສົ່ງແລ້ວ</button>
                        </div>
                    </div>
                </div>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="label">ວັນທີສັ່ງ:</span>
                        <span class="value">{{ formatDate(order.order_date) }}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">ຊື່ລູກຄ້າ:</span>
                        <span class="value" v-if="!isEditingDetail">{{ order.customer_name }}</span>
                        <input v-else v-model="editForm.customer_name" type="text" class="input-inline" />
                    </div>
                    <div class="info-item">
                        <span class="label">ຊື່ລູກ:</span>
                        <span class="value" v-if="!isEditingDetail">{{ order.customer_clid || '-' }}</span>
                        <input v-else v-model="editForm.customer_clid" type="text" class="input-inline" />
                    </div>
                    <div class="info-item">
                        <span class="label">ຈາກເພກ:</span>
                        <span class="value" v-if="!isEditingDetail">{{ order.frompage || '-' }}</span>
                        <!-- <input v-else v-model="editForm.frompage" type="text" class="input-inline" /> -->
                    </div>
                    <!-- <div class="info-item">
                        <span class="label">ເບີໂທ:</span>
                        <span class="value" v-if="!isEditingDetail">{{ order.mobile_no || '-' }}</span>
                        <input v-else v-model="editForm.mobile_no" type="text" class="input-inline" />
                    </div> -->
                    <div class="info-item">
                        <span class="label">ທີ່ຢູ່, ເບິໂທ, ຂົນສົ່ງ ....:</span>
                        <span class="value" v-if="!isEditingDetail">{{ order.notes }}</span>
                        <textarea v-else v-model="editForm.notes" class="input-block"></textarea>
                    </div>

                    <!-- <div class="info-item">
            <span class="label">ຍອດລວມ:</span>
            <span class="value total">{{ formatNumber(order.total_amount) }} LAK</span>
          </div> -->
                    <!-- <div class="info-item full-width" v-if="order.notes">
            <span class="label">ທີ່ຢູ່, ເບິໂທ, ຂົນສົ່ງ ....:</span>
            <span class="value">{{ order.notes }}</span>
          </div> -->
                </div>
            </div>

            <!-- ຮູບພາບອໍເດີ -->
            <div class="images-section" v-if="order.images && order.images.length > 0">
                <div class="images-header">
                    <h2>ຮູບພາບອໍເດີ</h2>
                    <div class="images-actions">
                        <button
                            v-if="order && (order.status === 'ສັ່ງພີມ' || order.status === 'ແຈ້ງລູກຄ້າ' || order.status === 'ອອກແບບ')"
                            class="btn-print-order" @click="printOrderDetail">Print</button>
                        <button
                            v-if="order && (order.status === 'ສັ່ງພີມ' || order.status === 'ແຈ້ງລູກຄ້າ' || order.status === 'ອອກແບບ')"
                            class="btn-print-sticker" @click="openStickerPreview">Sticker Print</button>
                        <!-- Edit controls -->
                        <button v-if="!isEditingDetail" class="btn-secondary" @click="enterEditMode">Edit</button>
                        <button v-if="isEditingDetail" class="btn-primary" @click="saveDetailEdits" :disabled="savingEdits">Save</button>
                        <button v-if="isEditingDetail" class="btn-cancel" @click="cancelDetailEdit" :disabled="savingEdits">Cancel</button>
                        <input ref="detailFileInput" type="file" accept="image/*" multiple style="display:none" @change="handleDetailFileUpload" />
                        <button class="btn-add-image" @click="$refs.detailFileInput.click()" v-if="isEditingDetail">Add image</button>
                    </div>
                </div>
                <div class="images-grid">
                    <div v-for="(image, index) in (isEditingDetail ? editForm.image_urls : order.images)" :key="image || index" class="image-card">
                        <img :src="image" :alt="`Order image ${index + 1}`" @click="!isEditingDetail && openImageModal(index)" />
                        <button v-if="isEditingDetail" class="image-delete" @click.stop="deleteOrderImage(image)" :disabled="(deletingImages && deletingImages[image])">{{ (deletingImages && deletingImages[image]) ? '...' : '✕' }}</button>
                    </div>
                </div>
            </div>

            <!-- ລາຍການສິນຄ້າ -->
            <div class="items-section">
                <div class="section-header">
                    <h2>ລາຍການສິນຄ້າ</h2>
                    <div class="section-actions">
                        <button v-if="order.status !== 'ຍົກເລີກ' && order.status !== 'ຈັດສົ່ງແລ້ວ'"
                            class="btn-add-product" @click="showAddForm = !showAddForm">
                            {{ showAddForm ? '✕ ປິດຟອມ' : '➕ ເພີ່ມສິນຄ້າ' }}
                        </button>
                        <button v-if="order && order.status !== 'ຍົກເລີກ' && order.status !== 'ຈັດສົ່ງແລ້ວ'" class="btn-cancel-order"
                            @click="cancelOrder">ຍົກເລີກອໍເດີ</button>
                    </div>
                </div>

                <!-- Add Product Form -->
                <div v-if="showAddForm" class="add-product-form">
                    <h3>ເພີ່ມສິນຄ້າໃໝ່ເຂົ້າອໍເດີ</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label>ສິນຄ້າ:</label>
                            <select v-model="newItem.variant_id" @change="updateNewItemPrice" required>
                                <option value="">-- ເລືອກສິນຄ້າ --</option>
                                <optgroup v-for="product in products" :key="product.id" :label="product.name">
                                    <option v-for="variant in product.variants" :key="variant.id" :value="variant.id"
                                        :disabled="variant.stock_qty === 0">
                                        {{ variant.color }} - {{ variant.size }} (ສະຕ໋ອກ: {{ variant.stock_qty }}) - {{
                                        formatNumber(product.base_price) }} LAK
                                    </option>
                                </optgroup>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>ຈຳນວນ:</label>
                            <input v-model.number="newItem.quantity" type="number" min="1"
                                :max="getMaxStock(newItem.variant_id)" required />
                        </div>

                        <div class="form-group">
                            <label>ຂະໜາດ:</label>
                            <input v-model="newItem.size" type="text" placeholder="ຂະໜາດ" />
                        </div>

                        <div class="form-group">
                            <label>ລາຄາ/ອັນ:</label>
                            <input v-model.number="newItem.unit_price" type="number" step="0.01" min="0" required />
                        </div>

                        <div class="form-group">
                            <label>ລວມ:</label>
                            <input :value="formatNumber(newItem.quantity * newItem.unit_price)" type="text" readonly
                                class="readonly" />
                        </div>
                    </div>

                    <div class="form-actions">
                        <button class="btn-save" @click="addProductToOrder" :disabled="addingProduct">
                            {{ addingProduct ? 'ກຳລັງບັນທຶກ...' : '💾 ບັນທຶກ' }}
                        </button>
                        <button class="btn-cancel" @click="cancelAddProduct">
                            ຍົກເລີກ
                        </button>
                    </div>
                </div>

                <div class="table-container">
                    <table class="items-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>ສິນຄ້າ</th>
                                <th>ສີ</th>
                                <th>ຂະໜາດ</th>
                                <th>ຈຳນວນ</th>
                                <th>ລາຄາ/ອັນ</th>
                                <th>ລວມ</th>
                                <th>ລົບ</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in items" :key="item.id">
                                <td>{{ index + 1 }}</td>
                                <td class="product-name">{{ item.product_name }}</td>
                                <td>{{ item.color }}</td>
                                <td class="size">{{ item.size }}</td>
                                <td class="quantity">{{ item.quantity }}</td>
                                <td class="price">{{ formatNumber(item.price) }}</td>
                                <td class="total">{{ formatNumber(item.quantity * item.price) }}</td>
                                <td class="actions">
                                    <button v-if="order.status !== 'ຍົກເລີກ' && order.status !== 'ຈັດສົ່ງແລ້ວ'"
                                        class="btn-delete" @click="deleteOrderItem(item)" title="ລົບລາຍການ">
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr class="summary-row">
                                <td colspan="4" class="text-right"><strong>ລວມທັງໝົດ:</strong></td>
                                <td class="quantity"><strong>{{ totalQuantity }}</strong></td>
                                <td></td>
                                <td class="total"><strong>{{ formatNumber(order.total_amount) }} LAK</strong></td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>

        <!-- Image Modal -->
        <div v-if="showModal" class="modal" @click="closeImageModal">
            <div class="modal-content" @click.stop>
                <button class="modal-close" @click="closeImageModal">✕</button>
                <img :src="order.images[currentImageIndex]" :alt="`Order image ${currentImageIndex + 1}`"
                    class="modal-image" />
                <div class="modal-nav" v-if="order.images.length > 1">
                    <button class="prev" @click.stop="prevImage" v-if="currentImageIndex > 0">
                        <‹
                    </button>
                    <button class="next" @click.stop="nextImage" v-if="currentImageIndex < order.images.length - 1">
                        ›>
                    </button>
                </div>
                <div class="modal-counter">{{ currentImageIndex + 1 }} / {{ order.images.length }}</div>
            </div>
        </div>

        <div v-if="error" class="error">{{ error }}</div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

function openStickerPreview() {
    // Open a new tab with the sticker preview and a print button
    const orderNo = order.value?.order_no || '';
    const frompage = order.value?.frompage || '-';
    const customerName = order.value?.customer_name || '-';
    const customerClid = order.value?.customer_clid || '-';
    const notes = order.value?.notes || '';
    const mobile_no = order.value?.mobile_no || '99261650';
    const totalQty = totalQuantity.value;
    //   const totalAmount = formatNumber(order.value?.total_amount);
    const itemsRows = (items.value || []).map((item, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td style="text-align:left">${item.product_name}</td>
      <td>${item.color}</td>
      <td>${item.size}</td>
      <td>${item.quantity}</td>
 
  
    </tr>
  `).join('');
    const printContent = `
    <div >
      <table class="sticker-main-table">
        <tr class="margin:10px">
          <td colspan="7" style="border:1px solid #000;padding:4px 4px; "> <span style="font-weight:normal"></span></td>
        <tr>
          <td colspan="7" style="border:1px solid #000;padding:4px 4px;">Order name : <span style="font-weight:normal">${customerClid}</span></td>
        </tr>
        <tr>
          <td colspan="7" style="border:1px solid #000;padding:4px 4px;">ຮ້ານ : ${frompage}  <br>
            ເບີໂທ : <span style="font-weight:normal">${mobile_no}
            
            </span></td>
        </tr>
       
        <tr>
          <td colspan="7" style="border:1px solid #000;padding:4px 4px;"> ຊື່ລູກຄ້າ: ${customerName} <br> 
            ເບີໂທ+ທີ່ຢູ່  : ${notes} <br>
            </td>
        </tr>
        <tr>
          <td colspan="7" style="border:1px solid #000;padding:0;">
            <table class="sticker-items-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>ສິນຄ້າ</th>
                  <th>ສີ</th>
                  <th>size</th>
                  <th>จຳນວນ</th>
                
              
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="4" style="text-align:right"><strong>ລວມຈຳນວນ:</strong></td>
                  <td><strong>${totalQty}</strong></td>
                  <td></td>
                 
                </tr>
              </tfoot>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
    <html>
      <head>
        <title>Sticker Print Preview</title>
        <style>
          body { margin: 15px 15px 0 15px; padding: 0; }
          .sticker-layout {
            width: 10cm;
            height: 15cm;
            box-sizing: border-box;
            border: 1px solid #000;
            padding: 0.2cm;
            font-family: 'Phetsarath-OT', sans-serif;
            background: #fff;
          }
          .sticker-main-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 1em;
          }
          .sticker-main-table td {
            border: 1px solid #000;
            padding: 2px 4px;
            font-size: 1em;
          }
          .sticker-items-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.95em;
            margin: 0;
          }
          .sticker-items-table th, .sticker-items-table td {
            border: 1px solid #000;
            padding: 2px 4px;
            text-align: center;
            font-size: 1em;
          }
          .sticker-items-table th {
            background: #fff;
            font-weight: 600;
          }
          .sticker-items-table tfoot td {
            background: #fff;
            font-weight: 700;
            color: #388e3c;
          }
          .print-btn {
            display: block;
            margin: 20px auto 0 auto;
            padding: 12px 32px;
            background: #388e3c;
            color: #fff;
            border: none;
            border-radius: 6px;
            font-size: 1.1em;
            font-family: 'Phetsarath-OT', sans-serif;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.3s;
          }
          .print-btn:hover {
            background: #256029;
          }
        </style>
      </head>
      <body>
        ${printContent}
        <button class="print-btn" onclick="window.print()">Print Sticker</button>
      </body>
    </html>
  `);
    printWindow.document.close();
}
function printStickerForm() {
    // Print a clean sticker form (new window) with layout matching the screenshot
    const orderNo = order.value?.order_no || '';
    const frompage = order.value?.frompage || '-';
    const customerName = order.value?.customer_name || '-';
    const customerClid = order.value?.customer_clid || '-';
    const notes = order.value?.notes || '';
    const totalQty = totalQuantity.value;
    const totalAmount = formatNumber(order.value?.total_amount);
    const itemsRows = (items.value || []).map((item, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td style="text-align:left">${item.product_name}</td>
      <td>${item.color}</td>
      <td>${item.size}</td>
      <td>${item.quantity}</td>
      <td>${formatNumber(item.price)}</td>
      <td>${formatNumber(item.quantity * item.price)}</td>
    </tr>
  `).join('');
    const printContent = `
    <div class="sticker-layout">
      <table class="sticker-main-table">
        <tr>
          <td colspan="7" style="border:1px solid #000;padding:2px 4px;">Order no : <span style="font-weight:normal">${orderNo}</span></td>
        </tr>
        <tr>
          <td colspan="7" style="border:1px solid #000;padding:2px 4px;">ຈາກເພກ: <span style="font-weight:normal">${frompage}</span></td>
        </tr>
        <tr>
          <td colspan="7" style="border:1px solid #000;padding:2px 4px;">ຊື່ລູກຄ້າ: <span style="font-weight:normal">${customerName}</span></td>
        </tr>
        <tr>
          <td colspan="7" style="border:1px solid #000;padding:2px 4px;">ຊື່ລູກ: <span style="font-weight:normal">${customerClid}</span></td>
        </tr>
        <tr>
          <td colspan="7" style="border:1px solid #000;padding:2px 4px;">Notes : <span style="font-weight:normal">${notes}</span></td>
        </tr>
        <tr>
          <td colspan="7" style="border:1px solid #000;padding:0;">
            <table class="sticker-items-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>ສິນຄ້າ</th>
                  <th>ສີ</th>
                  <th>size</th>
                  <th>จຳນວນ</th>
                  <th>ລາຄາ/ອັນ</th>
                  <th>ລວມ</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="4" style="text-align:right"><strong>ລວມຈຳນວນ:</strong></td>
                  <td><strong>${totalQty}</strong></td>
                  <td></td>
                  <td><strong>${totalAmount} LAK</strong></td>
                </tr>
              </tfoot>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
    <html>
      <head>
        <title>Sticker Print</title>
        <style>
          body { margin: 0; padding: 0; }
          .sticker-layout {
            width: 10cm;
            height: 15cm;
            box-sizing: border-box;
            border: 1px solid #000;
            padding: 0.2cm;
            font-family: 'Phetsarath-OT', sans-serif;
            background: #fff;
          }
          .sticker-main-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 1em;
          }
          .sticker-main-table td {
           
            border: 1px solid #000;
            padding: 10px 10px;
            font-size: 1em;
          }
          .sticker-items-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.95em;
          
             margin-left:10px;
          }
          .sticker-items-table th, .sticker-items-table td {
            border: 1px solid #000;
            padding: 2px 4px;
            text-align: center;
            font-size: 1em;
          }
          .sticker-items-table th {
            background: #fff;
            font-weight: 600;
          }
          .sticker-items-table tfoot td {
            background: #fff;
            font-weight: 700;
            color: #388e3c;
          }
        </style>
      </head>
      <body onload="window.print();window.close();">
        ${printContent}
      </body>
    </html>
  `);
    printWindow.document.close();
}
async function markDesignCompleted() {
    try {
        loading.value = true;
        error.value = null;
        const { error: updateError } = await supabase
            .from('orders')
            .update({ status: 'ສັ່ງພີມ' })
            .eq('id', orderId);
        if (updateError) throw updateError;
        await fetchOrderDetails();
    } catch (err) {
        error.value = 'ບໍ່ສາມາດອັບເດດສະຖານະໄດ້: ' + err.message;
        console.error('Error updating status:', err);
    } finally {
        loading.value = false;
    }
}

async function markNotifyCustomer() {
    try {
        loading.value = true;
        error.value = null;
        const { error: updateError } = await supabase
            .from('orders')
            .update({ status: 'ແຈ້ງລູກຄ້າ' })
            .eq('id', orderId);
        if (updateError) throw updateError;
        await fetchOrderDetails();
    } catch (err) {
        error.value = 'ບໍ່ສາມາດອັບເດດສະຖານະໄດ້: ' + err.message;
        console.error('Error updating status:', err);
    } finally {
        loading.value = false;
    }
}

async function markDelivered() {
    try {
        loading.value = true;
        error.value = null;
        const { error: updateError } = await supabase
            .from('orders')
            .update({ status: 'ຈັດສົ່ງແລ້ວ' })
            .eq('id', orderId);
        if (updateError) throw updateError;
        await fetchOrderDetails();
    } catch (err) {
        error.value = 'ບໍ່ສາມາດອັບເດດສະຖານະໄດ້: ' + err.message;
        console.error('Error updating status:', err);
    } finally {
        loading.value = false;
    }
}

async function cancelOrder() {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
        loading.value = true;
        error.value = null;
        // ການຄືນສະຕ໋ອກຈະຖືກຈັດການໂດຍ Trigger ໃນ Database ເມື່ອຍົກເລີກອໍເດີ
        // ຕ້ອງສ້າງ trigger ສຳລັບ DELETE: tr_return_stock_on_delete
        // Update order status
        const { error: orderError } = await supabase
            .from('orders')
            .update({ status: 'ຍົກເລີກ' })
            .eq('id', orderId);
        if (orderError) throw orderError;
        await fetchOrderDetails();
    } catch (err) {
        error.value = 'ບໍ່ສາມາດຍົກເລີກອໍເດີໄດ້: ' + err.message;
        console.error('Error cancelling order:', err);
    } finally {
        loading.value = false;
    }
}

const route = useRoute()
const supabase = useSupabaseClient()
const orderId = route.params.id

const order = ref(null)
const items = ref([])
const loading = ref(true)
const error = ref(null)
const showModal = ref(false)
const currentImageIndex = ref(0)
const showAddForm = ref(false)
const addingProduct = ref(false)
const products = ref([])

// detail edit state
const isEditingDetail = ref(false)
const savingEdits = ref(false)
// per-URL deletion state map
const deletingImages = ref({})
const editForm = ref({
  customer_name: '',
  customer_clid: '',
//   frompage: '',
//   mobile_no: '',
  notes: '',
  image_urls: []
})
const detailFileInput = ref(null)

// adjacent navigation
const prevOrderId = ref(null)
const nextOrderId = ref(null)

const newItem = ref({
    variant_id: '',
    quantity: 1,
    unit_price: 0,
    size: ''
})

const totalQuantity = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0)
})

// ດຶງຂໍ້ມູນອໍເດີ
async function fetchOrderDetails() {
    try {
        loading.value = true
        error.value = null

        // ດຶງຂໍ້ມູນອໍເດີ
        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single()

        if (orderError) throw orderError

        // ດຶງຊື່ໝວດຈາກ tb_page
        let pageName = '-'
        if (orderData.page_id) {
            const { data: pageData } = await supabase
                .from('tb_page')
                .select('name')
                .eq('id', orderData.page_id)
                .single()
            if (pageData) pageName = pageData.name
        }

        // ຈັດຮູບແບບຂໍ້ມູນ
        order.value = {
            ...orderData,
            page_name: pageName,
            status: orderData.status,
            images: orderData.image_urls || []
        }

        // ດຶງລາຍການສິນຄ້າ
        const { data: itemsData, error: itemsError } = await supabase
            .from('order_items')
            .select(`
        id,
        quantity,
        unit_price,
        size,
        variant_id
      `)
            .eq('order_id', orderId)

        if (itemsError) throw itemsError

        // ດຶງຂໍ້ມູນສິນຄ້າແລະ variant ສຳລັບແຕ່ລະລາຍການ
        const itemsWithDetails = []
        for (const item of itemsData) {
            const { data: variantData } = await supabase
                .from('product_variants')
                .select(`
          id,
          color,
          product_id
        `)
                .eq('id', item.variant_id)
                .single()

            let productName = '-'
            if (variantData?.product_id) {
                const { data: productData } = await supabase
                    .from('products')
                    .select('name')
                    .eq('id', variantData.product_id)
                    .single()
                if (productData) productName = productData.name
            }

            itemsWithDetails.push({
                id: item.id,
                quantity: item.quantity,
                price: item.unit_price,
                size: item.size || '-',
                color: variantData?.color || '-',
                product_name: productName,
                variant_id: item.variant_id
            })
        }

        items.value = itemsWithDetails

        // compute adjacent orders after loading items and order
        computeAdjacentOrders().catch(err => console.error('Error computing adjacent orders:', err))

    } catch (err) {
        error.value = 'ບໍ່ສາມາດໂຫລດຂໍ້ມູນໄດ້: ' + err.message
        console.error('Error fetching order details:', err)
    } finally {
        loading.value = false
    }
}

// Image modal functions
function openImageModal(index) {
    currentImageIndex.value = index
    showModal.value = true
}

// Navigate between orders
async function computeAdjacentOrders() {
    try {
        // If a status query param exists and is not 'ທັງໝົດ', filter by status.
        const statusFilterQuery = route.query.status || ''

        // also initialize editForm from current order (keep in sync when fetching)
        editForm.value = {
            customer_name: order.value?.customer_name || '',
            customer_clid: order.value?.customer_clid || '',
            // frompage: order.value?.frompage || '',
            // mobile_no: order.value?.mobile_no || '',
            notes: order.value?.notes || '',
            image_urls: order.value?.images ? [...order.value.images] : []
        }

        let query = supabase
            .from('orders')
            .select('id, order_date')
            .order('order_date', { ascending: true })

        if (statusFilterQuery && statusFilterQuery !== 'ທັງໝົດ') {
            query = query.eq('status', statusFilterQuery)
        }

        const { data: idsData, error: idsError } = await query

        if (idsError) throw idsError

        const ids = (idsData || []).map(r => String(r.id))
        const currentIndex = ids.indexOf(String(orderId))

        prevOrderId.value = currentIndex > 0 ? ids[currentIndex - 1] : null
        nextOrderId.value = (currentIndex >= 0 && currentIndex < ids.length - 1) ? ids[currentIndex + 1] : null
    } catch (err) {
        console.error('computeAdjacentOrders error:', err)
        prevOrderId.value = null
        nextOrderId.value = null
    }
}

function goToPrevOrder() {
    if (!prevOrderId.value) return
    const status = route.query.status || ''
    const query = status ? `?status=${encodeURIComponent(status)}` : ''
    navigateTo(`/orders/${prevOrderId.value}${query}`)
}

function goToNextOrder() {
    if (!nextOrderId.value) return
    const status = route.query.status || ''
    const query = status ? `?status=${encodeURIComponent(status)}` : ''
    navigateTo(`/orders/${nextOrderId.value}${query}`)
}

function closeImageModal() {
    showModal.value = false
}

// Detail edit functions
function enterEditMode() {
    isEditingDetail.value = true
    // copy current values (already synced on fetch but ensure fresh)
    editForm.value = {
        customer_name: order.value?.customer_name || '',
        customer_clid: order.value?.customer_clid || '',
        // frompage: order.value?.frompage || '',
        // mobile_no: order.value?.mobile_no || '',
        notes: order.value?.notes || '',
        image_urls: order.value?.images ? [...order.value.images] : []
    }
}

function cancelDetailEdit() {
    isEditingDetail.value = false
    // discard changes
}

async function handleDetailFileUpload(event) {
    const files = event.target.files
    if (!files || files.length === 0) return
    try {
        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`
            const filePath = `${fileName}`
            const { data, error: uploadError } = await supabase.storage
                .from('order_image')
                .upload(filePath, file)
            if (uploadError) throw uploadError
            const { data: publicData } = supabase.storage
                .from('order_image')
                .getPublicUrl(filePath)
            editForm.value.image_urls.push(publicData.publicUrl)
        }
    } catch (err) {
        console.error('Error uploading detail images:', err)
        error.value = 'ບໍ່ສາມາດໂຫລດຮູບພາບໄດ້: ' + err.message
    } finally {
        // reset file input
        if (detailFileInput.value) detailFileInput.value.value = ''
    }
}

function removeImageFromEdit(url) {
    editForm.value.image_urls = editForm.value.image_urls.filter(u => u !== url)
}

// Delete an image from storage (if possible) and persist the change to the order record
async function deleteOrderImage(url) {
    if (!confirm('ທ່ານຕ້ອງການລົບຮູບນີ້ແທ້ຫຼື?')) return
    try {
        // mark this url as deleting
        deletingImages.value = { ...deletingImages.value, [url]: true }
        error.value = null

        // Try to derive storage path from public URL
        let filePath = null
        try {
            const u = new URL(url)
            // common Supabase public URL path contains '/storage/v1/object/public/<bucket>/<path>'
            const match = u.pathname.match(/\/storage\/v1\/object\/public\/(?:[^\/]+)\/(.*)$/)
            if (match && match[1]) {
                filePath = decodeURIComponent(match[1])
            } else {
                // fallback: look for '/order_image/' segment
                const idx = u.pathname.indexOf('/order_image/')
                if (idx !== -1) {
                    filePath = u.pathname.substring(idx + '/order_image/'.length)
                    if (filePath.startsWith('/')) filePath = filePath.substring(1)
                }
            }
        } catch (e) {
            console.warn('Failed to parse image URL for storage path:', e)
        }

        // If we have a storage path, attempt removal (best-effort)
        if (filePath) {
            // try a few candidate paths (decoded, basename) to increase chance of match
            const candidates = [filePath, decodeURIComponent(filePath), filePath.split('/').pop()].filter(Boolean)
            console.log('Attempting storage removal for candidates:', candidates)
            let removed = false
            for (const candidate of candidates) {
                try {
                    const res = await supabase.storage
                        .from('order_image')
                        .remove([candidate])
                    // Supabase Storage returns { data, error }
                    if (!res.error) {
                        console.log('Removed storage object:', candidate, res)
                        removed = true
                        break
                    } else {
                        console.warn('Storage removal attempt failed for', candidate, res.error)
                        // if 404, set a helpful message
                        if (res.error && res.error.status === 404) {
                            error.value = 'File not found in storage: ' + candidate
                        }
                    }
                } catch (remErr) {
                    console.error('Exception while removing from storage for', candidate, remErr)
                }
            }
            if (!removed) {
                console.warn('All storage removal attempts failed for', filePath)
            }
        }

        const isInOrder = (order.value.images || []).includes(url)

        if (isInOrder) {
            // Update DB: remove url from image_urls
            const newImages = (order.value.images || []).filter(u => u !== url)
            const { error: updateError } = await supabase
                .from('orders')
                .update({ image_urls: newImages })
                .eq('id', orderId)
            if (updateError) {
                const msg = updateError.message || updateError.details || JSON.stringify(updateError)
                throw new Error('DB update failed: ' + msg)
            }

            // Update local state
            order.value.images = newImages
            if (isEditingDetail.value) {
                editForm.value.image_urls = editForm.value.image_urls.filter(u => u !== url)
            }
            // refresh from server to ensure consistent state
            await fetchOrderDetails()
        } else {
            // Image only exists in editForm (unsaved) — remove from editForm and try storage removal above
            editForm.value.image_urls = editForm.value.image_urls.filter(u => u !== url)
        }
    } catch (err) {
        console.error('Error deleting image:', err)
        const msg = (err && err.message) ? err.message : JSON.stringify(err)
        error.value = 'ບໍ່ສາມາດລົບຮູບພາບໄດ້: ' + msg
    } finally {
        const m = { ...deletingImages.value }
        delete m[url]
        deletingImages.value = m
    }
}

async function saveDetailEdits() {
    try {
        savingEdits.value = true
        const payload = {
            customer_name: editForm.value.customer_name || null,
            customer_clid: editForm.value.customer_clid || null,
            // frompage: editForm.value.frompage || null,
            // mobile_no: editForm.value.mobile_no || null,
            notes: editForm.value.notes || null,
            image_urls: editForm.value.image_urls || []
        }
        const { error: updateError } = await supabase
            .from('orders')
            .update(payload)
            .eq('id', orderId)
        if (updateError) throw updateError
        // update local order
        order.value = {
            ...order.value,
            customer_name: payload.customer_name,
            customer_clid: payload.customer_clid,
            // frompage: payload.frompage,
            // mobile_no: payload.mobile_no,
            notes: payload.notes,
            images: payload.image_urls
        }
        isEditingDetail.value = false
    } catch (err) {
        console.error('Error saving detail edits:', err)
        error.value = 'ບໍ່ສາມາດບັນທຶກການແກ້ໄຂໄດ້: ' + err.message
    } finally {
        savingEdits.value = false
    }
}

function nextImage() {
    if (currentImageIndex.value < order.value.images.length - 1) {
        currentImageIndex.value++
    }
}

function prevImage() {
    if (currentImageIndex.value > 0) {
        currentImageIndex.value--
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

// Fetch products for adding new items
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
        console.error('Error fetching products:', err)
    }
}

function updateNewItemPrice() {
    if (!newItem.value.variant_id) return

    for (const product of products.value) {
        const variant = product.variants.find(v => v.id === newItem.value.variant_id)
        if (variant) {
            newItem.value.unit_price = product.base_price
            newItem.value.size = variant.size || ''
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

async function addProductToOrder() {
    try {
        addingProduct.value = true
        error.value = null

        if (!newItem.value.variant_id) {
            error.value = 'ກະລຸນາເລືອກສິນຄ້າ'
            return
        }

        const maxStock = getMaxStock(newItem.value.variant_id)
        if (newItem.value.quantity > maxStock) {
            error.value = `ສະຕ໋ອກບໍ່ພຽງພໍ (ເຫຼືອ ${maxStock} ອັນ)`
            return
        }

        // Insert new order item
        const { error: insertError } = await supabase
            .from('order_items')
            .insert([{
                order_id: orderId,
                variant_id: newItem.value.variant_id,
                quantity: newItem.value.quantity,
                unit_price: newItem.value.unit_price,
                size: newItem.value.size || null

            }])

        if (insertError) throw insertError

        // ບໍ່ຕ້ອງຫັກສະຕ໋ອກດ້ວຍມືແລ້ວ ເພາະມີ Trigger ໃນ Database ເຮັດໃຫ້ແລ້ວ
        // ໃນ supabase-schema.sql: tr_subtract_stock_on_sale

        // Update order total
        const newTotal = order.value.total_amount + (newItem.value.quantity * newItem.value.unit_price)
        const { error: updateError } = await supabase
            .from('orders')
            .update({ total_amount: newTotal })
            .eq('id', orderId)

        if (updateError) throw updateError

        // Refresh data
        await fetchOrderDetails()
        await fetchProducts()
        cancelAddProduct()

    } catch (err) {
        error.value = 'ບໍ່ສາມາດເພີ່ມສິນຄ້າໄດ້: ' + err.message
        console.error('Error adding product:', err)
    } finally {
        addingProduct.value = false
    }
}

function cancelAddProduct() {
    showAddForm.value = false
    newItem.value = {
        variant_id: '',
        quantity: 1,
        unit_price: 0,
        size: ''
    }
}

async function deleteOrderItem(item) {
    if (!confirm(`ທ່ານຕ້ອງການລົບ ${item.product_name} (${item.color}) ອອກຈາກອໍເດີນີ້ແມ່ນບໍ?`)) return

    try {
        loading.value = true
        error.value = null

        // Delete order item
        const { error: deleteError } = await supabase
            .from('order_items')
            .delete()
            .eq('id', item.id)

        if (deleteError) throw deleteError

        // ການຄືນສະຕ໋ອກຈະຖືກຈັດການໂດຍ Trigger ໃນ Database ເມື່ອລຶບ order_item
        // ຕ້ອງສ້າງ trigger ສຳລັບ DELETE: tr_return_stock_on_delete

        // Update order total
        const itemTotal = item.quantity * item.price
        const newTotal = order.value.total_amount - itemTotal

        const { error: updateError } = await supabase
            .from('orders')
            .update({ total_amount: newTotal })
            .eq('id', orderId)

        if (updateError) throw updateError

        // Refresh data
        await fetchOrderDetails()
        await fetchProducts()

    } catch (err) {
        error.value = 'ບໍ່ສາມາດລົບລາຍການໄດ້: ' + err.message
        console.error('Error deleting order item:', err)
    } finally {
        loading.value = false
    }
}

function printOrderDetail() {
    window.print();
}

onMounted(async () => {
    await fetchOrderDetails()
    await fetchProducts()
})

</script>


<style scoped>
/* Sticker Print Modal */
.sticker-print-modal {
min-width: 420px;
min-height: 650px;
display: flex;
flex-direction: column;
align-items: center;
justify-content: flex-start;
padding: 30px 20px 20px 20px;
}
.sticker-layout {
width: 10cm;
height: 15cm;
box-sizing: border-box;
border: 1px dashed #888;
padding: 1cm;
font-family: 'Phetsarath-OT', sans-serif;
display: flex;
flex-direction: column;
justify-content: flex-start;
align-items: flex-start;
gap: 0.7cm;
background: #fff;
margin-bottom: 20px;
}
.sticker-row {
font-size: 1.2em;
margin-bottom: 0.2cm;
}
.sticker-label {
font-weight: bold;
margin-right: 0.3cm;
}
.sticker-value {
font-weight: 500;
}
.sticker-image img {
max-width: 8cm;
max-height: 8cm;
margin-top: 0.5cm;
border-radius: 8px;
border: 1px solid #ccc;
}
.btn-print-sticker {
margin-left: 10px;
padding: 10px 24px;
background-color: #1976d2;
color: white;
border: none;
border-radius: 6px;
cursor: pointer;
font-size: 1rem;
font-weight: 600;
transition: background 0.3s;
}
.btn-print-sticker:hover {
background-color: #0d47a1;
}

/* navigation buttons */
.btn-nav {
padding: 8px 12px;
border-radius: 6px;
background: #f0f0f0;
border: 1px solid #ddd;
cursor: pointer;
font-size: 1rem;
margin-right: 6px;
}
.btn-nav:disabled {
opacity: 0.5;
cursor: not-allowed;
}
.btn-prev {
background: #fff;
}
.btn-next {
background: #fff;
}
/* Ensure Phetsarath-OT font is applied globally for this page */
html,
body,
tr,
* {
    font-family: 'Phetsarath-OT', sans-serif !important;
}

.btn-design-completed {
    margin-left: 10px;
    padding: 6px 16px;
    background-color: #ff9800;
    color: white;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    transition: background 0.3s;
}

.btn-design-completed:hover {
    background-color: #fb8c00;
}

.btn-update-status {
    margin-left: 10px;
    padding: 6px 16px;
    background-color: #388e3c;
    color: white;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    transition: background 0.3s;
}

.btn-update-status:hover {
    background-color: #256029;
}

.btn-cancel-order {
    margin-left: 100px;
    padding: 10px 24px;
    background-color: #e53935;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    transition: background 0.3s;
}

.btn-cancel-order:hover {
    background-color: #b71c1c;
}

.btn-print-order {
    margin-left: 10px;
    padding: 10px 24px;
    background-color: #388e3c;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    transition: background 0.3s;
}

.btn-print-order:hover {
    background-color: #256029;
}

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

.header-actions {
    margin-left: auto;
    display: flex;
    gap: 10px;
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

/* ຂໍ້ມູນອໍເດີ */
.order-info {
    background: linear-gradient(135deg, #5773f0 0%, #764ba2 100%);
    color: white;
    padding: 25px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.order-info-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
}

.order-info h2 {
    color: white;
    margin: 0;
    font-size: 1.3rem;
}

.order-status-actions {
    display: flex;
    gap: 12px;
    align-items: center;
}

.status-label { color: #fff; opacity: 0.95; font-weight: 600; }
.status-label .label { margin-right: 8px; font-weight: 600; opacity: 0.9; }

.status-buttons button { margin-left: 8px; }

@media (max-width: 768px) {
  .order-info-top { flex-direction: column; align-items: flex-start; gap: 8px; }
  .status-buttons { display: flex; gap: 8px; flex-wrap: wrap; }
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
}

.info-item {
    display: flex;
    flex-direction: row;
    gap: 5px;
}

.info-item.full-width {
    grid-column: 1 / -1;
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

.value.status {
    display: inline-block;
    background: #f0e087;
    padding: 5px 15px;
    border-radius: 20px;
    font-weight: 600;
    color: #141414;
}

.value.total {
    font-size: 1.4rem;
    font-weight: 700;
    color: #ffd700;
}

.input-inline {
    padding: 6px 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
}

.input-block {
    padding: 8px 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    min-height: 70px;
    resize: vertical;
}

/* ຮູບພາບ */
.images-section {
    background: white;
    padding: 25px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.images-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
}

.image-card {
    position: relative;
    padding-top: 100%;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s, box-shadow 0.3s;
}

.image-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.image-card img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.image-delete {
    position: absolute;
    left: 8px;
    bottom: 8px;
    background: rgba(255,255,255,0.95);
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 4px 8px;
    cursor: pointer;
    z-index: 10;
    font-weight: 700;
}

.image-delete[disabled] {
    opacity: 0.6;
    cursor: not-allowed;
}

/* ລາຍການສິນຄ້າ */
.items-section {
    background: white;
    padding: 25px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

.price {
    text-align: right;
    color: #666;
}

.total {
    text-align: right;
    font-weight: 700;
    color: #4CAF50;
}

.actions {
    text-align: center;
    width: 80px;
}

.btn-delete {
    padding: 6px 12px;
    background-color: #f44336;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.3s;
    min-width: 40px;
    min-height: 40px;
}

.btn-delete:hover {
    background-color: #d32f2f;
    transform: scale(1.05);
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

/* Add Product Section */
.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.section-header h2 {
    margin: 0;
}

.btn-add-product {
    padding: 10px 20px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    transition: all 0.3s;
    font-family: 'Phetsarath-OT', sans-serif;
}

.btn-add-product:hover {
    background-color: #45a049;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(76, 175, 80, 0.3);
}

.add-product-form {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    border: 2px solid #e0e0e0;
}

.add-product-form h3 {
    margin-top: 0;
    margin-bottom: 15px;
    color: #333;
    font-size: 1.1rem;
}

.form-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
    gap: 15px;
    margin-bottom: 15px;
}

.form-group {
    display: flex;
    flex-direction: column;
}

.form-group label {
    margin-bottom: 5px;
    font-weight: 600;
    color: #555;
    font-size: 0.9rem;
}

.form-group input,
.form-group select {
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    font-family: 'Phetsarath-OT', sans-serif;
}

.form-group input:focus,
.form-group select:focus {
    outline: none;
    border-color: #667eea;
}

.form-group input.readonly {
    background-color: #f5f5f5;
    cursor: not-allowed;
}

.form-actions {
    display: flex;
    gap: 10px;
}

.btn-save {
    padding: 10px 20px;
    background-color: #667eea;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    transition: all 0.3s;
    font-family: 'Phetsarath-OT', sans-serif;
}

.btn-save:hover:not(:disabled) {
    background-color: #5568d3;
}

.btn-save:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-cancel {
    padding: 10px 20px;
    background-color: #ec4848;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    transition: all 0.3s;
    font-family: 'Phetsarath-OT', sans-serif;
}

.btn-cancel:hover {
    background-color: #777;
}

/* Image Modal */
.modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    padding: 20px;
}

.modal-content {
    position: relative;
    max-width: 90vw;
    max-height: 90vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-close {
    position: absolute;
    top: -40px;
    right: 0;
    background: rgba(255, 255, 255, 0.9);
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 1.5rem;
    color: #333;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2001;
}

.modal-close:hover {
    background: white;
}

.modal-image {
    max-width: 100%;
    max-height: 85vh;
    border-radius: 8px;
    object-fit: contain;
}

.modal-nav button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(184, 243, 176, 0.9);
    border: none;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 2rem;
    color: #0e0d0d;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
}

.modal-nav button:hover {
    background: white;
    transform: translateY(-50%) scale(1.1);
}

.modal-nav .prev {
    left: -60px;
}

.modal-nav .next {
    right: -60px;
}

.modal-counter {
    position: absolute;
    bottom: -40px;
    left: 50%;
    transform: translateX(-50%);
    color: white;
    font-size: 1rem;
    font-weight: 600;
    background: rgba(0, 0, 0, 0.5);
    padding: 8px 16px;
    border-radius: 20px;
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

    .order-info,
    .images-section,
    .items-section {
        padding: 20px;
    }

    .images-grid {
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
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

    .order-info,
    .images-section,
    .items-section {
        padding: 15px;
    }

    .form-row {
        grid-template-columns: 1fr;
    }

    .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }

    .btn-add-product {
        width: 100%;
    }

    .info-grid {
        grid-template-columns: 1fr;
        gap: 15px;
    }

    .value.total {
        font-size: 1.2rem;
    }

    .images-grid {
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 10px;
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

    .modal-nav .prev {
        left: 10px;
    }

    .modal-nav .next {
        right: 10px;
    }

    .modal-nav button {
        width: 40px;
        height: 40px;
        font-size: 1.5rem;
    }
}

@media (max-width: 480px) {
    h1 {
        font-size: 1.1rem;
    }

    h2 {
        font-size: 1rem;
    }

    .order-info,
    .images-section,
    .items-section {
        padding: 12px;
    }

    .items-table {
        font-size: 0.75rem;
    }

    .summary-row td {
        font-size: 0.95rem;
    }

    .images-grid {
        grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    }

    .modal-close {
        top: 10px;
        right: 10px;
        width: 35px;
        height: 35px;
        font-size: 1.2rem;
    }

    .modal-nav button {
        width: 35px;
        height: 35px;
        font-size: 1.2rem;
    }
}

/* images header actions */
.images-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.images-actions {
    display: flex;
    gap: 8px;
}
</style>

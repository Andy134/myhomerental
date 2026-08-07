<template>
  <AppLayout pageTitle="Tổng quan" pageSubtitle="Chào mừng trở lại!">
<!-- Stats Cards -->
    <div class="row g-4 mb-4">
      <div class="col-md-3">
        <div class="card border-0 shadow-sm stat-card">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <p class="text-muted small mb-1">Tổng phòng</p>
                <h3 class="fw-bold mb-0">
                  <span v-if="loading" class="spinner-border spinner-border-sm text-primary" role="status" aria-hidden="true"></span>
                  <template v-else>{{ stats.totalRooms }}</template>
                </h3>
              </div>
              <div class="stat-icon bg-primary bg-opacity-10 text-primary rounded p-2">
                <i class="bi bi-door-open fs-4"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm stat-card">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <p class="text-muted small mb-1">Đang cho thuê</p>
                <h3 class="fw-bold mb-0">
                  <span v-if="loading" class="spinner-border spinner-border-sm text-success" role="status" aria-hidden="true"></span>
                  <template v-else>{{ stats.occupiedRooms }}</template>
                </h3>
              </div>
              <div class="stat-icon bg-success bg-opacity-10 text-success rounded p-2">
                <i class="bi bi-person-check fs-4"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm stat-card">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <p class="text-muted small mb-1">Phòng trống</p>
                <h3 class="fw-bold mb-0">
                  <span v-if="loading" class="spinner-border spinner-border-sm text-warning" role="status" aria-hidden="true"></span>
                  <template v-else>{{ stats.availableRooms }}</template>
                </h3>
              </div>
              <div class="stat-icon bg-warning bg-opacity-10 text-warning rounded p-2">
                <i class="bi bi-house-x fs-4"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm stat-card">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <p class="text-muted small mb-1">Doanh thu tháng</p>
                <h3 class="fw-bold mb-0">
                  <span v-if="loading" class="spinner-border spinner-border-sm text-info" role="status" aria-hidden="true"></span>
                  <template v-else>{{ formatCurrency(stats.monthlyRevenue) }}</template>
                </h3>
              </div>
              <div class="stat-icon bg-info bg-opacity-10 text-info rounded p-2">
                <i class="bi bi-cash-stack fs-4"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Revenue & Expense Chart -->
    <div class="row g-4">
      <div class="col-md-8">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white border-bottom-0 pt-3 pb-2 d-flex justify-content-between align-items-center">
            <h5 class="fw-bold mb-0">Doanh thu & Chi phí theo năm</h5>
            <span class="text-muted small">Năm {{ currentYear }}</span>
          </div>
          <div class="card-body">
            <div class="chart-container" v-if="chartData">
              <Bar :data="chartData" :options="chartOptions" />
            </div>
            <div v-else class="text-center py-5 text-muted">
              <i class="bi bi-bar-chart fs-1 d-block mb-2"></i>
              <p class="mb-0">Đang tải dữ liệu...</p>
            </div>
            <!-- Annual Summary Stats -->
            <div class="row g-3 mt-1">
              <div class="col-4">
                <div class="annual-stat-box bg-success bg-opacity-10 rounded-3 p-3 text-center">
                  <p class="text-muted small mb-1"><i class="bi bi-arrow-up-circle-fill text-success me-1"></i>Tổng doanh thu</p>
                  <p class="fw-bold text-success mb-0 fs-6">{{ formatCurrency(annualRevenue) }}</p>
                </div>
              </div>
              <div class="col-4">
                <div class="annual-stat-box bg-danger bg-opacity-10 rounded-3 p-3 text-center">
                  <p class="text-muted small mb-1"><i class="bi bi-arrow-down-circle-fill text-danger me-1"></i>Tổng chi phí</p>
                  <p class="fw-bold text-danger mb-0 fs-6">{{ formatCurrency(annualExpense) }}</p>
                </div>
              </div>
              <div class="col-4">
                <div class="annual-stat-box rounded-3 p-3 text-center"
                     :class="annualProfit >= 0 ? 'bg-primary bg-opacity-10' : 'bg-warning bg-opacity-10'">
                  <p class="text-muted small mb-1">
                    <i class="bi me-1"
                       :class="annualProfit >= 0 ? 'bi-graph-up-arrow text-primary' : 'bi-graph-down-arrow text-warning'"></i>Lợi nhuận ròng
                  </p>
                  <p class="fw-bold mb-0 fs-6"
                     :class="annualProfit >= 0 ? 'text-primary' : 'text-warning'">{{ formatCurrency(annualProfit) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white border-bottom-0 pt-3 pb-0">
            <h5 class="fw-bold mb-0">Hóa đơn đến hạn</h5>
          </div>
          <div class="card-body">
            <div v-if="dueBillings.length === 0" class="text-center py-5 text-muted">
              <i class="bi bi-clock-history fs-1 d-block mb-2"></i>
              <p class="mb-0">Chưa có hóa đơn đến hạn</p>
            </div>
            <div v-else>
              <div v-for="b in dueBillings" :key="b._id" class="d-flex justify-content-between align-items-center py-2 border-bottom">
                <div>
                  <strong>{{ b.room_no }}</strong>
                  <small class="d-block text-muted">{{ b.user_id?.name }}</small>
                </div>
                <span class="text-danger fw-bold">{{ formatCurrency(b.total_price) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import AppLayout from '../components/AppLayout.vue'
import api from '../services/api.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const stats = ref({
  totalRooms: 0,
  occupiedRooms: 0,
  availableRooms: 0,
  monthlyRevenue: 0
})
const dueBillings = ref([])
const chartData = ref(null)
const loading = ref(false)
const annualRevenue = ref(0)
const annualExpense = ref(0)
const annualProfit = ref(0)
const currentYear = ref(new Date().getFullYear())

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    tooltip: {
      callbacks: {
        label: (ctx) => {
          return ctx.dataset.label + ': ' + (ctx.raw || 0).toLocaleString('vi-VN') + ' đ'
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value) => (value || 0).toLocaleString('vi-VN') + ' đ'
      }
    }
  }
}

function formatCurrency(value) {
  return (value || 0).toLocaleString('vi-VN') + ' đ'
}

const monthLabels = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12']

function aggregateByMonth(items, monthField, valueField) {
  const map = {}
  for (const item of items) {
    const m = item[monthField]
    if (m && m.length >= 6) {
      const monthIndex = parseInt(m.substring(4, 6)) - 1 // 0-based
      if (monthIndex >= 0 && monthIndex < 12) {
        map[monthIndex] = (map[monthIndex] || 0) + (item[valueField] || 0)
      }
    }
  }
  return map
}

async function loadStats() {
  loading.value = true
  try {
    const [roomsRes, contractsRes, billingsRes, expensesRes] = await Promise.all([
      api.get('/rooms'),
      api.get('/contracts'),
      api.get('/monthly-billings'),
      api.get('/expenses')
    ])
    const rooms = roomsRes.data
    const contracts = contractsRes.data
    const billings = billingsRes.data
    const expenses = expensesRes.data

    stats.value.totalRooms = rooms.length
    stats.value.occupiedRooms = rooms.filter(r => r.status === 'occupied').length
    stats.value.availableRooms = rooms.filter(r => r.status === 'available').length

    // Monthly revenue from paid billings
    const currentMonth = new Date()
    const monthStr = String(currentMonth.getFullYear()) + String(currentMonth.getMonth() + 1).padStart(2, '0')
    const monthBillings = billings.filter(b => b.month === monthStr && b.status === 'paid')
    stats.value.monthlyRevenue = monthBillings.reduce((sum, b) => sum + (b.total_price || 0), 0)

    // Due billings (unpaid)
    dueBillings.value = billings.filter(b => b.status === 'unpaid')

    // Build chart: revenue (paid billings) vs expenses by month for current year
    const currentYear = String(currentMonth.getFullYear())
    const paidBillings = billings.filter(b => b.status === 'paid' && b.month && b.month.startsWith(currentYear))
    const revenueByMonth = aggregateByMonth(paidBillings, 'month', 'total_price')

    // Expenses: filter by current year (expense.date format: ddmmyyyy)
    const currentYearExpenses = expenses.filter(e => {
      return e.date && e.date.length === 8 && e.date.substring(4) === currentYear
    })
    const expenseByMonth = {}
    for (const e of currentYearExpenses) {
      const monthIndex = parseInt(e.date.substring(2, 4)) - 1 // ddmmyyyy
      if (monthIndex >= 0 && monthIndex < 12) {
        expenseByMonth[monthIndex] = (expenseByMonth[monthIndex] || 0) + (e.amount || 0)
      }
    }

    // Build chart datasets (12 months)
    const revenueData = []
    const expenseData = []
    for (let i = 0; i < 12; i++) {
      revenueData.push(revenueByMonth[i] || 0)
      expenseData.push(expenseByMonth[i] || 0)
    }

    // Annual totals
    annualRevenue.value = revenueData.reduce((s, v) => s + v, 0)
    annualExpense.value = expenseData.reduce((s, v) => s + v, 0)
    annualProfit.value = annualRevenue.value - annualExpense.value

    chartData.value = {
      labels: monthLabels,
      datasets: [
        {
          label: 'Doanh thu',
          backgroundColor: '#28a745',
          borderRadius: 4,
          data: revenueData
        },
        {
          label: 'Chi phí',
          backgroundColor: '#dc3545',
          borderRadius: 4,
          data: expenseData
        }
      ]
    }
} catch (err) {
    console.error('Failed to load stats:', err)
  } finally {
    loading.value = false
  }
}

onMounted(loadStats)
</script>

<style scoped>
.stat-card {
  border-radius: 12px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
}

.stat-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card {
  border-radius: 12px;
}

.card-header {
  padding-left: 1.25rem;
  padding-right: 1.25rem;
}

.chart-container {
  position: relative;
  height: 320px;
}

.annual-stat-box {
  transition: transform 0.15s;
}

.annual-stat-box:hover {
  transform: translateY(-2px);
}
</style>


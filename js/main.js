// Dữ liệu ban đầu
let transactions = [
    { id: 1, title: 'Siêu thị An Nhiên', date: '12/06/2025 - 18:32', category: 'Thực phẩm', amount: -486000, status: 'Đã phân loại', type: 'expense' },
    { id: 2, title: 'Lương tháng 06', date: '10/06/2025 - 09:00', category: 'Thu nhập', amount: 15000000, status: 'Đã xác nhận', type: 'income' },
    { id: 3, title: 'Xe công nghệ', date: '10/06/2025 - 08:15', category: 'Di chuyển', amount: -92000, status: 'Đã phân loại', type: 'expense' },
    { id: 4, title: 'Khoản chưa rõ', date: '09/06/2025 - Cần kiểm tra', category: 'AI: Mua sắm?', amount: -275000, status: 'Chờ duyệt', type: 'pending' }
];

let selectedTransaction = transactions[3];

// Elements DOM
const transactionListEl = document.getElementById('transaction-list');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const statusFilter = document.getElementById('status-filter');
const tabButtons = document.querySelectorAll('.tab-btn');
const statCountEl = document.getElementById('stat-count');
const pageInfoEl = document.getElementById('page-info');

// Elements Modal
const addModal = document.getElementById('add-modal');
const openModalBtn = document.getElementById('open-modal-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const cancelModalBtn = document.getElementById('cancel-modal-btn');
const addForm = document.getElementById('add-transaction-form');

// Elements Detail Panel
const detailTitle = document.getElementById('detail-title');
const detailAmount = document.getElementById('detail-amount');
const detailStatus = document.getElementById('detail-status');
const confirmBtn = document.getElementById('confirm-btn');

// Elements Mobile Sidebar
const sidebarEl = document.getElementById('sidebar');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const closeSidebarBtn = document.getElementById('close-sidebar-btn');
const sidebarOverlay = document.getElementById('sidebar-overlay');

let currentTab = 'all';

// Định dạng tiền tệ VND
function formatCurrency(amount) {
    const formatted = Math.abs(amount).toLocaleString('vi-VN');
    return amount < 0 ? `-${formatted} đ` : `+${formatted} đ`;
}

// Render danh sách giao dịch
function renderTransactions() {
    let filtered = transactions.filter(item => {
        if (currentTab === 'expense' && item.amount >= 0) return false;
        if (currentTab === 'income' && item.amount < 0) return false;
        if (currentTab === 'pending' && item.status !== 'Chờ duyệt') return false;

        const searchText = searchInput.value.toLowerCase();
        const matchSearch = item.title.toLowerCase().includes(searchText);

        const catVal = categoryFilter.value;
        const matchCat = (catVal === 'all') || item.category.includes(catVal);

        const statVal = statusFilter.value;
        const matchStatus = (statVal === 'all') || item.status === statVal;

        return matchSearch && matchCat && matchStatus;
    });

    transactionListEl.innerHTML = '';

    filtered.forEach(item => {
        const tr = document.createElement('tr');
        const badgeClass = item.status === 'Chờ duyệt' ? 'badge-warning' : 'badge-success';
        
        tr.innerHTML = `
            <td>
                <div class="tx-title">${item.title}</div>
                <div class="tx-sub">${item.date}</div>
            </td>
            <td>${item.category}</td>
            <td style="font-weight: 600; color: ${item.amount < 0 ? '#000' : '#10b981'}">
                ${formatCurrency(item.amount)}
            </td>
            <td><span class="badge ${badgeClass}">${item.status}</span></td>
        `;

        tr.addEventListener('click', () => {
            selectTransaction(item);
            // Cuộn mượt xuống panel chi tiết trên giao diện điện thoại
            if (window.innerWidth <= 1024) {
                document.getElementById('detail-panel').scrollIntoView({ behavior: 'smooth' });
            }
        });

        transactionListEl.appendChild(tr);
    });

    statCountEl.textContent = transactions.length;
    pageInfoEl.textContent = `Hiển thị ${filtered.length} / ${transactions.length} giao dịch`;
}

// Chọn giao dịch hiển thị chi tiết
function selectTransaction(item) {
    selectedTransaction = item;
    detailTitle.textContent = item.title;
    detailAmount.textContent = formatCurrency(item.amount);
    detailStatus.textContent = item.status;
    detailStatus.className = `badge ${item.status === 'Chờ duyệt' ? 'badge-warning' : 'badge-success'}`;
}

// Chuyển Tab
tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTab = btn.getAttribute('data-tab');
        renderTransactions();
    });
});

// Sự kiện Tìm kiếm & Lọc
searchInput.addEventListener('input', renderTransactions);
categoryFilter.addEventListener('change', renderTransactions);
statusFilter.addEventListener('change', renderTransactions);

// Nút xác nhận phân loại
confirmBtn.addEventListener('click', () => {
    if (selectedTransaction) {
        selectedTransaction.status = 'Đã xác nhận';
        if (selectedTransaction.category.startsWith('AI:')) {
            selectedTransaction.category = document.getElementById('detail-category').value;
        }
        renderTransactions();
        selectTransaction(selectedTransaction);
        alert('Đã xác nhận phân loại giao dịch!');
    }
});

// Modal Điều khiển
openModalBtn.addEventListener('click', () => addModal.classList.add('show'));
closeModalBtn.addEventListener('click', () => addModal.classList.remove('show'));
cancelModalBtn.addEventListener('click', () => addModal.classList.remove('show'));

// Form Validation & Thêm mới
addForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const title = document.getElementById('input-title').value.trim();
    const date = document.getElementById('input-date').value.trim();
    const category = document.getElementById('input-category').value;
    const amount = parseFloat(document.getElementById('input-amount').value);
    const status = document.getElementById('input-status').value;

    if (!title || !date || isNaN(amount)) {
        alert('Vui lòng nhập đầy đủ thông tin!');
        return;
    }

    const newTx = {
        id: Date.now(),
        title,
        date,
        category,
        amount,
        status,
        type: amount < 0 ? 'expense' : 'income'
    };

    transactions.unshift(newTx);
    renderTransactions();
    addModal.classList.remove('show');
    addForm.reset();
});

// Mobile Sidebar Navigation Logic
function openSidebar() {
    sidebarEl.classList.add('open');
    sidebarOverlay.classList.add('show');
}

function closeSidebar() {
    sidebarEl.classList.remove('open');
    sidebarOverlay.classList.remove('show');
}

if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openSidebar);
if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', closeSidebar);
if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

// Khởi chạy ban đầu
renderTransactions();
selectTransaction(transactions[3]);
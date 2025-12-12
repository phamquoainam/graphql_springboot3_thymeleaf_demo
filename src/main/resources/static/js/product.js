const API_URL = '/graphql';

// --- HÀM DÙNG CHUNG (HELPER) ---
async function graphqlRequest(query, variables = {}) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, variables })
        });
        const result = await response.json();
        if (result.errors) {
            console.error(result.errors);
            alert("Lỗi GraphQL (Xem console)");
            return null;
        }
        return result.data;
    } catch (err) {
        alert("Lỗi kết nối!");
        return null;
    }
}

// --- LOGIC PRODUCT ---

// 1. Load dữ liệu ban đầu
document.addEventListener("DOMContentLoaded", () => {
    loadCategories();
    loadProducts();
});

async function loadCategories() {
    const query = `query { getAllCategories { id, name } }`;
    const data = await graphqlRequest(query);
    if (data) {
        const select = document.getElementById('pCategory');
        const filter = document.getElementById('filterCategory');
        
        let html = '<option value="">-- Chọn danh mục --</option>';
        data.getAllCategories.forEach(c => html += `<option value="${c.id}">${c.name}</option>`);
        select.innerHTML = html;
        
        // Cập nhật cả dropdown lọc
        filter.innerHTML = '<option value="ALL">Tất cả sản phẩm</option>' + html;
    }
}

async function loadProducts() {
    const query = `query { getAllProductsSorted { id, title, price, quantity, category { id, name }, user { id } } }`;
    const data = await graphqlRequest(query);
    if (data) renderTable(data.getAllProductsSorted);
}

// 2. Render Bảng
function renderTable(products) {
    const tbody = document.querySelector('#productTable tbody');
    tbody.innerHTML = '';
    products.forEach(p => {
        const catName = p.category ? p.category.name : 'N/A';
        const row = `
            <tr>
                <td>${p.id}</td>
                <td>${p.title}</td>
                <td>${p.price.toLocaleString()}</td>
                <td>${p.quantity}</td>
                <td>${catName}</td>
                <td>
                    <button class="btn-info" onclick="editProduct('${p.id}')">Sửa</button>
                    <button class="btn-danger" onclick="deleteProduct('${p.id}')">Xóa</button>
                </td>
            </tr>`;
        tbody.innerHTML += row;
    });
}

// 3. Xử lý Lưu (Tự động hiểu là Thêm mới hay Update)
async function saveProduct() {
    const id = document.getElementById('pId').value; // Lấy ID ẩn
    const title = document.getElementById('pTitle').value;
    const price = parseFloat(document.getElementById('pPrice').value);
    const quantity = parseInt(document.getElementById('pQuantity').value);
    const categoryId = document.getElementById('pCategory').value;
    const userId = document.getElementById('pUserId').value;

    if (!title || !categoryId) { alert("Thiếu thông tin!"); return; }

    const input = { title, price, quantity, categoryId, userId };

    if (id) {
        // --- LOGIC UPDATE ---
        const query = `
            mutation($id: ID!, $input: ProductInput) {
                updateProduct(id: $id, input: $input) { id }
            }
        `;
        await graphqlRequest(query, { id, input });
        alert("Cập nhật thành công!");
    } else {
        // --- LOGIC CREATE ---
        const query = `
            mutation($input: ProductInput) {
                createProduct(input: $input) { id }
            }
        `;
        await graphqlRequest(query, { input });
        alert("Thêm mới thành công!");
    }

    clearForm();
    loadProducts();
}

// 4. Chuẩn bị form để sửa
async function editProduct(id) {
    // Gọi API lấy chi tiết sản phẩm để điền vào form (để chắc chắn dữ liệu mới nhất)
    const query = `query($id: ID!) { getProductById(id: $id) { title, price, quantity, category { id }, user { id } } }`;
    const data = await graphqlRequest(query, { id });
    
    if(data && data.getProductById) {
        const p = data.getProductById;
        document.getElementById('pId').value = id; // Gán ID vào ô ẩn
        document.getElementById('pTitle').value = p.title;
        document.getElementById('pPrice').value = p.price;
        document.getElementById('pQuantity').value = p.quantity;
        document.getElementById('pCategory').value = p.category ? p.category.id : "";
        document.getElementById('pUserId').value = p.user ? p.user.id : "1";
        
        document.getElementById('btnSave').innerText = "Cập nhật Sản Phẩm";
        document.getElementById('btnCancel').style.display = 'inline-block';
    }
}

// 5. Xóa
async function deleteProduct(id) {
    if (!confirm("Xóa sản phẩm này?")) return;
    const query = `mutation($id: ID!) { deleteProduct(id: $id) }`;
    await graphqlRequest(query, { id });
    loadProducts();
}

// 6. Reset Form
function clearForm() {
    document.getElementById('pId').value = "";
    document.getElementById('pTitle').value = "";
    document.getElementById('pPrice').value = "";
    document.getElementById('pQuantity').value = "1";
    document.getElementById('pCategory').value = "";
    
    document.getElementById('btnSave').innerText = "Lưu Sản Phẩm";
    document.getElementById('btnCancel').style.display = 'none';
}
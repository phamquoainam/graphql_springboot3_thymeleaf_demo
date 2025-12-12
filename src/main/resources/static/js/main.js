const API_URL = '/graphql';

// 1. Hàm dùng chung để gọi API
async function graphqlRequest(query, variables = {}) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, variables })
        });
        const result = await response.json();
        if (result.errors) {
            console.error("GraphQL Error:", result.errors);
            alert("Có lỗi xảy ra! Xem console.");
            return null;
        }
        return result.data;
    } catch (error) {
        console.error("Network Error:", error);
        alert("Lỗi kết nối server!");
        return null;
    }
}

// 2. Load danh sách Category
async function loadCategories() {
    const query = `query { getAllCategories { id, name } }`;
    const data = await graphqlRequest(query);
    
    if (data) {
        const categories = data.getAllCategories;
        const selectFilter = document.getElementById('filterCategory');
        const selectForm = document.getElementById('pCategory');
        
        selectFilter.innerHTML = '<option value="ALL">Tất cả sản phẩm</option>';
        selectForm.innerHTML = '<option value="">-- Chọn danh mục --</option>';

        categories.forEach(c => {
            const option = `<option value="${c.id}">${c.name}</option>`;
            selectFilter.innerHTML += option;
            selectForm.innerHTML += option;
        });
    }
}

// 3. Load danh sách Product
async function loadProducts() {
    const query = `
        query {
            getAllProductsSorted {
                id, title, price, quantity, category { name }
            }
        }
    `;
    const data = await graphqlRequest(query);
    if (data) renderTable(data.getAllProductsSorted);
}

// 4. Lọc sản phẩm
async function filterProducts() {
    const catId = document.getElementById('filterCategory').value;
    if (catId === 'ALL') {
        loadProducts();
        return;
    }
    const query = `
        query($id: ID!) {
            getProductsByCategory(categoryId: $id) {
                id, title, price, quantity, category { name }
            }
        }
    `;
    const data = await graphqlRequest(query, { id: catId });
    if (data) renderTable(data.getProductsByCategory);
}

// 5. Tạo sản phẩm mới
async function createProduct() {
    const title = document.getElementById('pTitle').value;
    const price = parseFloat(document.getElementById('pPrice').value);
    const quantity = parseInt(document.getElementById('pQuantity').value);
    const categoryId = document.getElementById('pCategory').value;
    const userId = document.getElementById('pUserId').value;

    if (!title || !categoryId) {
        alert("Vui lòng nhập tên và chọn danh mục!");
        return;
    }

    const query = `
        mutation($input: ProductInput) {
            createProduct(input: $input) { id, title }
        }
    `;
    
    const variables = {
        input: { title, price, quantity, categoryId, userId }
    };

    const data = await graphqlRequest(query, variables);
    if (data) {
        alert("Thêm thành công!");
        loadProducts();
        document.getElementById('pTitle').value = ""; // Reset tên
    }
}

// 6. Xóa sản phẩm
async function deleteProduct(id) {
    if (!confirm("Bạn có chắc chắn muốn xóa ID: " + id + "?")) return;

    const query = `mutation($id: ID!) { deleteProduct(id: $id) }`;
    const data = await graphqlRequest(query, { id: id });
    
    if (data && data.deleteProduct) {
        alert("Đã xóa thành công!");
        loadProducts();
    } else {
        alert("Xóa thất bại!");
    }
}

// 7. Render HTML
function renderTable(products) {
    const tbody = document.querySelector('#productTable tbody');
    tbody.innerHTML = '';

    if (!products || products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">Không có dữ liệu</td></tr>';
        return;
    }

    products.forEach(p => {
        const catName = p.category ? p.category.name : '<span style="color:red">Chưa phân loại</span>';
        const row = `
            <tr>
                <td>${p.id}</td>
                <td><strong>${p.title}</strong></td>
                <td>${p.price.toLocaleString()} VNĐ</td>
                <td>${p.quantity}</td>
                <td>${catName}</td>
                <td>
                    <button class="btn-danger" onclick="deleteProduct(${p.id})">Xóa</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// Khởi chạy
document.addEventListener("DOMContentLoaded", () => {
    loadCategories();
    loadProducts();
});
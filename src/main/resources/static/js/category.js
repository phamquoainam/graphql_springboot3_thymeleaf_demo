const API_URL = '/graphql';

async function graphqlRequest(query, variables = {}) {
    /* Copy hàm này y hệt bên product.js hoặc tạo file common.js */
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, variables })
        });
        return (await response.json()).data;
    } catch (e) { return null; }
}

document.addEventListener("DOMContentLoaded", loadCategories);

async function loadCategories() {
    const query = `query { getAllCategories { id, name, images } }`;
    const data = await graphqlRequest(query);
    const tbody = document.querySelector('#catTable tbody');
    tbody.innerHTML = '';
    
    if(data) {
        data.getAllCategories.forEach(c => {
            tbody.innerHTML += `
                <tr>
                    <td>${c.id}</td>
                    <td>${c.name}</td>
                    <td>${c.images || ''}</td>
                    <td>
                        <button class="btn-info" onclick="editCategory('${c.id}', '${c.name}', '${c.images}')">Sửa</button>
                        <button class="btn-danger" onclick="deleteCategory('${c.id}')">Xóa</button>
                    </td>
                </tr>`;
        });
    }
}

async function saveCategory() {
    const id = document.getElementById('cId').value;
    const name = document.getElementById('cName').value;
    const images = document.getElementById('cImage').value;

    const input = { name, images };

    if (id) {
        const query = `mutation($id: ID!, $input: CategoryInput) { updateCategory(id: $id, input: $input) { id } }`;
        await graphqlRequest(query, { id, input });
    } else {
        const query = `mutation($input: CategoryInput) { createCategory(input: $input) { id } }`;
        await graphqlRequest(query, { input });
    }
    clearForm();
    loadCategories();
}

function editCategory(id, name, image) {
    document.getElementById('cId').value = id;
    document.getElementById('cName').value = name;
    document.getElementById('cImage').value = image;
    document.getElementById('btnSave').innerText = "Cập nhật";
    document.getElementById('btnCancel').style.display = 'inline-block';
}

async function deleteCategory(id) {
    if(!confirm("Xóa danh mục này?")) return;
    const query = `mutation($id: ID!) { deleteCategory(id: $id) }`;
    await graphqlRequest(query, { id });
    loadCategories();
}

function clearForm() {
    document.getElementById('cId').value = "";
    document.getElementById('cName').value = "";
    document.getElementById('cImage').value = "";
    document.getElementById('btnSave').innerText = "Lưu Danh Mục";
    document.getElementById('btnCancel').style.display = 'none';
}
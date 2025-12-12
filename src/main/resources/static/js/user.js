const API_URL = '/graphql';
// (Copy hàm graphqlRequest ở đây)
async function graphqlRequest(query, variables = {}) { /* ...code cũ... */ 
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, variables })
        });
        return (await response.json()).data;
    } catch (e) { return null; }
}

document.addEventListener("DOMContentLoaded", () => {
    loadUsers();
    loadCategoriesForUser();
});

// Load category để chọn sở thích (Multiple Select)
async function loadCategoriesForUser() {
    const query = `query { getAllCategories { id, name } }`;
    const data = await graphqlRequest(query);
    if(data) {
        const select = document.getElementById('uCategories');
        data.getAllCategories.forEach(c => {
            select.innerHTML += `<option value="${c.id}">${c.name}</option>`;
        });
    }
}

async function loadUsers() {
    const query = `query { getAllUsers { id, fullname, email, phone, categories { name } } }`;
    const data = await graphqlRequest(query);
    const tbody = document.querySelector('#userTable tbody');
    tbody.innerHTML = '';
    
    if(data) {
        data.getAllUsers.forEach(u => {
            const catNames = u.categories ? u.categories.map(c => c.name).join(", ") : "";
            tbody.innerHTML += `
                <tr>
                    <td>${u.id}</td>
                    <td>${u.fullname}</td>
                    <td>${u.email}</td>
                    <td>${u.phone}</td>
                    <td>${catNames}</td>
                    <td>
                        <button class="btn-info" onclick="editUser('${u.id}')">Sửa</button>
                        <button class="btn-danger" onclick="deleteUser('${u.id}')">Xóa</button>
                    </td>
                </tr>`;
        });
    }
}

async function saveUser() {
    const id = document.getElementById('uId').value;
    const fullname = document.getElementById('uName').value;
    const email = document.getElementById('uEmail').value;
    const phone = document.getElementById('uPhone').value;
    const password = document.getElementById('uPass').value;
    
    // Lấy danh sách category đã chọn (Multiple)
    const selectedCats = Array.from(document.getElementById('uCategories').selectedOptions).map(opt => opt.value);

    const input = { fullname, email, phone, categoryIds: selectedCats };
    if(!id) input.password = password; // Chỉ gửi password khi tạo mới (đơn giản hóa)

    if (id) {
        const query = `mutation($id: ID!, $input: UserInput) { updateUser(id: $id, input: $input) { id } }`;
        await graphqlRequest(query, { id, input });
    } else {
        const query = `mutation($input: UserInput) { createUser(input: $input) { id } }`;
        await graphqlRequest(query, { input });
    }
    clearForm();
    loadUsers();
}

async function editUser(id) {
    const query = `query($id: ID!) { getUserById(id: $id) { fullname, email, phone, categories { id } } }`;
    const data = await graphqlRequest(query, { id });
    if(data) {
        const u = data.getUserById;
        document.getElementById('uId').value = id;
        document.getElementById('uName').value = u.fullname;
        document.getElementById('uEmail').value = u.email;
        document.getElementById('uPhone').value = u.phone;
        document.getElementById('uPass').placeholder = "(Không đổi pass)";
        
        // Reset select
        const select = document.getElementById('uCategories');
        Array.from(select.options).forEach(opt => opt.selected = false);
        
        // Chọn lại categories cũ
        if(u.categories) {
            u.categories.forEach(c => {
                const opt = select.querySelector(`option[value="${c.id}"]`);
                if(opt) opt.selected = true;
            });
        }

        document.getElementById('btnSave').innerText = "Cập nhật";
        document.getElementById('btnCancel').style.display = 'inline-block';
    }
}

async function deleteUser(id) {
    if(!confirm("Xóa user này?")) return;
    const query = `mutation($id: ID!) { deleteUser(id: $id) }`;
    await graphqlRequest(query, { id });
    loadUsers();
}

function clearForm() {
    document.getElementById('uId').value = "";
    document.getElementById('uName').value = "";
    document.getElementById('uEmail').value = "";
    document.getElementById('uPhone').value = "";
    document.getElementById('uPass').value = "";
    document.getElementById('uCategories').selectedIndex = -1;
    
    document.getElementById('btnSave').innerText = "Lưu User";
    document.getElementById('btnCancel').style.display = 'none';
}
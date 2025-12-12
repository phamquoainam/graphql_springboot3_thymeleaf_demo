package com.hoainam.controllers;

import com.hoainam.dto.CategoryInput;
import com.hoainam.dto.ProductInput;
import com.hoainam.dto.UserInput;
import com.hoainam.entity.Category;
import com.hoainam.entity.Product;
import com.hoainam.entity.User;
import com.hoainam.repository.CategoryRepository;
import com.hoainam.repository.ProductRepository;
import com.hoainam.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.stream.Collectors;

@Controller
public class AppController {

    @Autowired private ProductRepository productRepo;
    @Autowired private CategoryRepository categoryRepo;
    @Autowired private UserRepository userRepo;

    // =========================================================
    // PHẦN 1: QUERIES (XỬ LÝ ĐỌC DỮ LIỆU)
    // =========================================================

    // Yêu cầu 1: Hiển thị tất cả product có price từ thấp đến cao
    @QueryMapping
    public List<Product> getAllProductsSorted() {
        return productRepo.findAll(Sort.by(Sort.Direction.ASC, "price"));
    }

    // Yêu cầu 2: Lấy tất cả product của 01 category
    @QueryMapping
    public List<Product> getProductsByCategory(@Argument Long categoryId) {
        return productRepo.findByCategoryId(categoryId);
    }

    // --- Các Query phụ trợ khác ---
    @QueryMapping
    public List<Category> getAllCategories() { return categoryRepo.findAll(); }
    
    @QueryMapping
    public Category getCategoryById(@Argument Long id) {
        return categoryRepo.findById(id).orElse(null);
    }

    @QueryMapping
    public List<User> getAllUsers() { return userRepo.findAll(); }
    
    @QueryMapping
    public User getUserById(@Argument Long id) {
        return userRepo.findById(id).orElse(null);
    }

    @QueryMapping
    public List<Product> getAllProducts() { return productRepo.findAll(); }
    
    @QueryMapping
    public Product getProductById(@Argument Long id) {
        return productRepo.findById(id).orElse(null);
    }

    // =========================================================
    // PHẦN 2: MUTATIONS (CRUD - Thêm, Sửa, Xóa)
    // =========================================================

    // ----------------- CRUD PRODUCT -----------------
    @MutationMapping
    public Product createProduct(@Argument ProductInput input) {
        Product p = new Product();
        mapProductInputToEntity(input, p); // Gọi hàm phụ để map dữ liệu
        return productRepo.save(p);
    }

    @MutationMapping
    public Product updateProduct(@Argument Long id, @Argument ProductInput input) {
        Product p = productRepo.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
        mapProductInputToEntity(input, p);
        return productRepo.save(p);
    }

    @MutationMapping
    public Boolean deleteProduct(@Argument Long id) {
        if(productRepo.existsById(id)) {
            productRepo.deleteById(id);
            return true;
        }
        return false;
    }

    // ----------------- CRUD CATEGORY -----------------
    @MutationMapping
    public Category createCategory(@Argument CategoryInput input) {
        Category c = new Category();
        c.setName(input.name());
        c.setImages(input.images());
        return categoryRepo.save(c);
    }

    @MutationMapping
    public Category updateCategory(@Argument Long id, @Argument CategoryInput input) {
        Category c = categoryRepo.findById(id).orElseThrow(() -> new RuntimeException("Category not found"));
        if(input.name() != null) c.setName(input.name());
        if(input.images() != null) c.setImages(input.images());
        return categoryRepo.save(c);
    }

    @MutationMapping
    public Boolean deleteCategory(@Argument Long id) {
        // Lưu ý: Cần xử lý constraint khóa ngoại trước khi xóa thật (nếu có Product liên quan)
        // Ở mức độ bài tập đơn giản, ta xóa trực tiếp.
        if(categoryRepo.existsById(id)) {
            categoryRepo.deleteById(id);
            return true;
        }
        return false;
    }

    // ----------------- CRUD USER -----------------
    @MutationMapping
    public User createUser(@Argument UserInput input) {
        User u = new User();
        mapUserInputToEntity(input, u);
        return userRepo.save(u);
    }

    @MutationMapping
    public User updateUser(@Argument Long id, @Argument UserInput input) {
        User u = userRepo.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        mapUserInputToEntity(input, u);
        return userRepo.save(u);
    }

    @MutationMapping
    public Boolean deleteUser(@Argument Long id) {
        if(userRepo.existsById(id)) {
            userRepo.deleteById(id);
            return true;
        }
        return false;
    }
    
 // =========================================================
    // PHẦN 3: WEB CONTROLLER (MAPPING URL CHO THYMELEAF)
    // =========================================================

    // Trang chủ quản lý sản phẩm (index.html)
    @org.springframework.web.bind.annotation.GetMapping("/")
    public String pageIndex() {
        return "index"; 
    }

    // Trang quản lý danh mục (categories.html)
    @org.springframework.web.bind.annotation.GetMapping("/categories")
    public String pageCategories() {
        return "categories"; 
    }

    // Trang quản lý người dùng (users.html)
    @org.springframework.web.bind.annotation.GetMapping("/users")
    public String pageUsers() {
        return "users"; 
    }

    // =========================================================
    // CÁC HÀM PHỤ TRỢ (HELPER METHODS) ĐỂ MAP DỮ LIỆU
    // =========================================================

    private void mapProductInputToEntity(ProductInput input, Product p) {
        if(input.title() != null) p.setTitle(input.title());
        if(input.price() != null) p.setPrice(input.price());
        if(input.quantity() != null) p.setQuantity(input.quantity());
        if(input.description() != null) p.setdescription(input.description());

        if(input.userId() != null) {
            User u = userRepo.findById(Long.parseLong(input.userId())).orElse(null);
            p.setUser(u);
        }
        if(input.categoryId() != null) {
            Category c = categoryRepo.findById(Long.parseLong(input.categoryId())).orElse(null);
            p.setCategory(c);
        }
    }

    private void mapUserInputToEntity(UserInput input, User u) {
        if(input.fullname() != null) u.setFullname(input.fullname());
        if(input.email() != null) u.setEmail(input.email());
        if(input.password() != null) u.setPassword(input.password()); // Thực tế nên mã hóa
        if(input.phone() != null) u.setPhone(input.phone());

        // Xử lý quan hệ User - Category (N-N)
        if(input.categoryIds() != null && !input.categoryIds().isEmpty()) {
            List<Long> ids = input.categoryIds().stream()
                    .map(Long::parseLong)
                    .collect(Collectors.toList());
            List<Category> categories = categoryRepo.findAllById(ids);
            u.setCategories(categories);
        }
    }
}
package com.hoainam.dto;

public record ProductInput(
	    String title,
	    Double price,
	    Integer quantity,
	    String description,
	    String userId,     // ID của User đăng sản phẩm
	    String categoryId  // ID của Category
	) {}

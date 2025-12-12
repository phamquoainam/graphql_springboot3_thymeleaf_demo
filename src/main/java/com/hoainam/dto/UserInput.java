package com.hoainam.dto;

import java.util.List;

public record UserInput(
	    String fullname,
	    String email,
	    String password,
	    String phone,
	    List<String> categoryIds // Danh sách ID các category user quan tâm (N-N)
	) {}

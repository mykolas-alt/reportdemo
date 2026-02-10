package com.demo.demo.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.demo.demo.dto.User;

@Repository
public class UserRepository {

    private static final String CREATE_USER_STATEMENT = "INSERT INTO demouser (email, name) VALUES (?, ?)";
    private static final String FIND_USER_BY_EMAIL_QUERY = "SELECT email, name FROM demouser WHERE email = ?";
    private final JdbcTemplate jdbcTemplate;

    public UserRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void createUser(String email, String name) {
        jdbcTemplate.update(CREATE_USER_STATEMENT, email, name);
    }

    public User findUserByEmail(String email) {
        return jdbcTemplate.queryForObject(FIND_USER_BY_EMAIL_QUERY,
                (rs, rowNum) -> new User(rs.getString("email"), rs.getString("name")), email);
    }
}

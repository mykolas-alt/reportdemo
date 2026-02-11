package com.demo.demo.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.demo.demo.dto.User;

@Repository
public class UserRepository {

    private static final String CREATE_USER_STATEMENT = "INSERT INTO demouser (email, name, company_code) VALUES (?, ?, ?)";
    private static final String CREATE_COMPANY_STATEMENT = "INSERT INTO company (company_name, company_code) VALUES (?, ?)";
    private static final String FIND_COMPANY_STATEMENT = "SELECT company_code FROM company WHERE company_code = ?";

    private static final String FIND_USER_BY_EMAIL_QUERY = """
            SELECT
                du.email AS email,
                du.name AS name,
                c.company_name AS company_name,
                c.company_code AS company_code
            FROM
                demouser du
                JOIN company c ON du.company_code = c.company_code
            WHERE
                du.email = ?
            """;

    private final JdbcTemplate jdbcTemplate;

    public UserRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void createUser(String email, String name, String companyName, String companyCode) {
        jdbcTemplate.update(CREATE_COMPANY_STATEMENT, companyName, companyCode);
        var res = jdbcTemplate.queryForObject(FIND_COMPANY_STATEMENT, String.class, companyCode);
        jdbcTemplate.update(CREATE_USER_STATEMENT, email, name, res);
    }

    public User findUserByEmail(String email) {
        return jdbcTemplate.queryForObject(FIND_USER_BY_EMAIL_QUERY,
                (rs, rowNum) -> new User(rs.getString("email"), rs.getString("name"), rs.getString("company_name"),
                        rs.getString("company_code")),
                email);
    }
}

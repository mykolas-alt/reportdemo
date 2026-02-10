package com.demo.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.demo.demo.dto.User;
import com.demo.demo.repository.UserRepository;

import lombok.SneakyThrows;

@RestController
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @SneakyThrows
    @PostMapping("/register")
    public ResponseEntity<String> test(@RequestBody User user) {
        try {
            userRepository.createUser(user.email(), user.name());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Registration failed: " + e.getMessage());
        }
        return ResponseEntity.ok("User registered successfully");
    }

    @GetMapping("/user")
    public ResponseEntity<User> getUserByEmail(@RequestParam String email) {
        try {
            User user = userRepository.findUserByEmail(email);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}

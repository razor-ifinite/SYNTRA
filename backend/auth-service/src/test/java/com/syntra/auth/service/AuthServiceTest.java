package com.syntra.auth.service;

import com.syntra.auth.dto.AuthResponse;
import com.syntra.auth.dto.LoginRequest;
import com.syntra.auth.dto.RegisterRequest;
import com.syntra.auth.model.User;
import com.syntra.auth.repository.UserRepository;
import com.syntra.auth.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @InjectMocks
    private AuthService authService;

    private User testUser;
    private final UUID testUserId = UUID.randomUUID();
    private final String testEmail = "test@example.com";
    private final String testPassword = "password123";
    private final String testToken = "mock.jwt.token";

    @BeforeEach
    void setUp() {
        testUser = new User("Test User", testEmail, "hashedPassword");
        testUser.setId(testUserId);
    }

    @Test
    void register_Success() {
        RegisterRequest request = new RegisterRequest("Test User", testEmail, testPassword);

        when(userRepository.existsByEmail(testEmail)).thenReturn(false);
        when(passwordEncoder.encode(testPassword)).thenReturn("hashedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(tokenProvider.generateToken(testEmail, testUser.getName(), testUserId.toString())).thenReturn(testToken);

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals(testToken, response.token());
        assertEquals(testUserId, response.id());
        assertEquals(testEmail, response.email());

        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_EmailAlreadyExists_ThrowsException() {
        RegisterRequest request = new RegisterRequest("Test User", testEmail, testPassword);

        when(userRepository.existsByEmail(testEmail)).thenReturn(true);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            authService.register(request);
        });

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void login_Success() {
        LoginRequest request = new LoginRequest(testEmail, testPassword);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(testPassword, "hashedPassword")).thenReturn(true);
        when(tokenProvider.generateToken(testEmail, testUser.getName(), testUserId.toString())).thenReturn(testToken);

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals(testToken, response.token());
        assertEquals(testEmail, response.email());
    }

    @Test
    void login_InvalidPassword_ThrowsException() {
        LoginRequest request = new LoginRequest(testEmail, "wrongpassword");

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("wrongpassword", "hashedPassword")).thenReturn(false);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            authService.login(request);
        });

        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatusCode());
    }

    @Test
    void login_UserNotFound_ThrowsException() {
        LoginRequest request = new LoginRequest("unknown@example.com", testPassword);

        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            authService.login(request);
        });

        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatusCode());
    }
}

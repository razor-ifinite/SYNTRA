package com.syntra.auth.dto;

import java.util.UUID;

public record AuthResponse(
    String token,
    UUID id,
    String name,
    String email
) {}

package com.syntra.ai.controller;

import com.syntra.ai.dto.AiResponse;
import com.syntra.ai.dto.MotivateRequest;
import com.syntra.ai.dto.SuggestRequest;
import com.syntra.ai.service.AiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/suggest")
    public ResponseEntity<AiResponse> suggest(@RequestBody SuggestRequest request) {
        return ResponseEntity.ok(aiService.suggest(request));
    }

    @PostMapping("/motivate")
    public ResponseEntity<AiResponse> motivate(@RequestBody MotivateRequest request) {
        return ResponseEntity.ok(aiService.motivate(request));
    }
}

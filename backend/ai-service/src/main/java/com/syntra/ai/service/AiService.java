package com.syntra.ai.service;

import com.syntra.ai.dto.AiResponse;
import com.syntra.ai.dto.MotivateRequest;
import com.syntra.ai.dto.SuggestRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
public class AiService {

    private final WebClient webClient;

    @Value("${ai.gemini.api-key}")
    private String apiKey;

    @Value("${ai.gemini.api-url}")
    private String apiUrl;

    public AiService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public AiResponse suggest(SuggestRequest request) {
        String prompt = buildSuggestPrompt(request);
        return callGemini(prompt);
    }

    public AiResponse motivate(MotivateRequest request) {
        String prompt = buildMotivatePrompt(request);
        return callGemini(prompt);
    }

    private String buildSuggestPrompt(SuggestRequest request) {
        return String.format(
            "You are a productivity coach. Based on the following context, suggest 3 SMART goals.\n" +
            "User context: %s\n" +
            "Existing goals: %s\n" +
            "Preferred style: %s\n" +
            "Format each goal with: Title, Description, Suggested deadline (from today), and 3 milestones.",
            request.userContext(),
            String.join(", ", request.existingGoals() != null ? request.existingGoals() : List.of("none")),
            request.preferredStyle() != null ? request.preferredStyle() : "balanced"
        );
    }

    private String buildMotivatePrompt(MotivateRequest request) {
        return String.format(
            "You are an encouraging productivity coach. Write a short (2-3 sentence) motivational message for someone who:\n" +
            "- Is working on goal: '%s'\n" +
            "- Has completed %.0f%% of their milestones\n" +
            "- Has %d days remaining\n" +
            "Be warm, specific, and energizing.",
            request.goalTitle(), request.completionPercentage(), request.daysRemaining()
        );
    }

    private AiResponse callGemini(String prompt) {
        try {
            Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                    Map.of("parts", List.of(Map.of("text", prompt)))
                )
            );

            Map response = webClient.post()
                .uri(apiUrl + "?key=" + apiKey)
                .header("Content-Type", "application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

            // Parse Gemini response structure
            if (response != null && response.containsKey("candidates")) {
                List candidates = (List) response.get("candidates");
                if (!candidates.isEmpty()) {
                    Map candidate = (Map) candidates.get(0);
                    Map content = (Map) candidate.get("content");
                    List parts = (List) content.get("parts");
                    Map part = (Map) parts.get(0);
                    String text = (String) part.get("text");
                    return new AiResponse(text, "gemini-1.5-flash", true);
                }
            }
            return new AiResponse("Could not generate a response.", "gemini-1.5-flash", false);
        } catch (Exception e) {
            return new AiResponse("AI service temporarily unavailable: " + e.getMessage(), "gemini-1.5-flash", false);
        }
    }
}

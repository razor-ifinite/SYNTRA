package com.syntra.goal.controller;

import com.syntra.goal.dto.GoalProgressResponse;
import com.syntra.goal.dto.GoalRequest;
import com.syntra.goal.dto.GoalResponse;
import com.syntra.goal.service.GoalService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/goals")
public class GoalController {

    private final GoalService goalService;

    public GoalController(GoalService goalService) {
        this.goalService = goalService;
    }

    @PostMapping
    public ResponseEntity<GoalResponse> createGoal(@RequestBody GoalRequest request) {
        return new ResponseEntity<>(goalService.createGoal(request), HttpStatus.CREATED);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<GoalResponse>> getGoalsByUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(goalService.getGoalsByUser(userId));
    }

    @PatchMapping("/{goalId}/status")
    public ResponseEntity<GoalResponse> updateGoalStatus(@PathVariable UUID goalId, @RequestBody String status) {
        return ResponseEntity.ok(goalService.updateGoalStatus(goalId, status));
    }

    @DeleteMapping("/{goalId}")
    public ResponseEntity<Void> deleteGoal(@PathVariable UUID goalId) {
        goalService.deleteGoal(goalId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{goalId}/progress")
    public ResponseEntity<GoalProgressResponse> getGoalProgress(@PathVariable UUID goalId) {
        return ResponseEntity.ok(goalService.getGoalProgress(goalId));
    }
}

package com.syntra.goal.controller;

import com.syntra.goal.dto.MilestoneRequest;
import com.syntra.goal.dto.MilestoneResponse;
import com.syntra.goal.service.GoalService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/milestones")
public class MilestoneController {

    private final GoalService goalService;

    public MilestoneController(GoalService goalService) {
        this.goalService = goalService;
    }

    @PostMapping
    public ResponseEntity<MilestoneResponse> createMilestone(@RequestBody MilestoneRequest request) {
        return new ResponseEntity<>(goalService.createMilestone(request), HttpStatus.CREATED);
    }

    @GetMapping("/goal/{goalId}")
    public ResponseEntity<List<MilestoneResponse>> getMilestonesByGoal(@PathVariable UUID goalId) {
        return ResponseEntity.ok(goalService.getMilestonesByGoal(goalId));
    }

    @PatchMapping("/{milestoneId}/status")
    public ResponseEntity<MilestoneResponse> updateMilestoneStatus(@PathVariable UUID milestoneId, @RequestBody String status) {
        return ResponseEntity.ok(goalService.updateMilestoneStatus(milestoneId, status));
    }
}

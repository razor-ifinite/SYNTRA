package com.syntra.goal.service;

import com.syntra.goal.dto.GoalProgressResponse;
import com.syntra.goal.dto.GoalRequest;
import com.syntra.goal.dto.GoalResponse;
import com.syntra.goal.dto.MilestoneRequest;
import com.syntra.goal.dto.MilestoneResponse;
import com.syntra.goal.model.Goal;
import com.syntra.goal.model.Milestone;
import com.syntra.goal.repository.GoalRepository;
import com.syntra.goal.repository.MilestoneRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class GoalService {

    private final GoalRepository goalRepository;
    private final MilestoneRepository milestoneRepository;

    public GoalService(GoalRepository goalRepository, MilestoneRepository milestoneRepository) {
        this.goalRepository = goalRepository;
        this.milestoneRepository = milestoneRepository;
    }

    @Transactional
    public GoalResponse createGoal(GoalRequest request) {
        Goal goal = new Goal();
        goal.setUserId(request.userId());
        goal.setTitle(request.title());
        goal.setDescription(request.description());
        goal.setDeadline(OffsetDateTime.parse(request.deadline()));
        goal.setStatus(Goal.GoalStatus.ACTIVE);
        
        goal = goalRepository.save(goal);
        return mapToGoalResponse(goal);
    }

    @Transactional(readOnly = true)
    public List<GoalResponse> getGoalsByUser(UUID userId) {
        return goalRepository.findByUserId(userId).stream()
                .map(this::mapToGoalResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public GoalResponse updateGoalStatus(UUID goalId, String status) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found"));
        // Remove quotes from status if passed as raw string in JSON
        String cleanStatus = status.replaceAll("\"", "").toUpperCase();
        goal.setStatus(Goal.GoalStatus.valueOf(cleanStatus));
        goal = goalRepository.save(goal);
        return mapToGoalResponse(goal);
    }

    @Transactional
    public void deleteGoal(UUID goalId) {
        goalRepository.deleteById(goalId);
    }

    @Transactional
    public MilestoneResponse createMilestone(MilestoneRequest request) {
        Goal goal = goalRepository.findById(request.goalId())
                .orElseThrow(() -> new RuntimeException("Goal not found"));

        Milestone milestone = new Milestone();
        milestone.setGoalId(goal.getId());
        milestone.setTitle(request.title());
        milestone.setDueDate(OffsetDateTime.parse(request.dueDate()));
        milestone.setStatus(Milestone.MilestoneStatus.PENDING);

        milestone = milestoneRepository.save(milestone);
        return mapToMilestoneResponse(milestone);
    }

    @Transactional(readOnly = true)
    public List<MilestoneResponse> getMilestonesByGoal(UUID goalId) {
        return milestoneRepository.findByGoalId(goalId).stream()
                .map(this::mapToMilestoneResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public MilestoneResponse updateMilestoneStatus(UUID milestoneId, String status) {
        Milestone milestone = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new RuntimeException("Milestone not found"));
        String cleanStatus = status.replaceAll("\"", "").toUpperCase();
        milestone.setStatus(Milestone.MilestoneStatus.valueOf(cleanStatus));
        milestone = milestoneRepository.save(milestone);
        return mapToMilestoneResponse(milestone);
    }

    @Transactional(readOnly = true)
    public GoalProgressResponse getGoalProgress(UUID goalId) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found"));
        
        List<Milestone> milestones = milestoneRepository.findByGoalId(goalId);
        
        long completedCount = milestones.stream()
                .filter(m -> m.getStatus() == Milestone.MilestoneStatus.COMPLETED)
                .count();
                
        double percentage = milestones.isEmpty() ? 0.0 : ((double) completedCount / milestones.size()) * 100;
        
        return new GoalProgressResponse(
                mapToGoalResponse(goal),
                milestones.stream().map(this::mapToMilestoneResponse).collect(Collectors.toList()),
                percentage
        );
    }

    private GoalResponse mapToGoalResponse(Goal goal) {
        return new GoalResponse(
                goal.getId(),
                goal.getUserId(),
                goal.getTitle(),
                goal.getDescription(),
                goal.getDeadline(),
                goal.getStatus().name(),
                goal.getCreatedAt()
        );
    }

    private MilestoneResponse mapToMilestoneResponse(Milestone milestone) {
        return new MilestoneResponse(
                milestone.getId(),
                milestone.getGoalId(),
                milestone.getTitle(),
                milestone.getDueDate(),
                milestone.getStatus().name(),
                milestone.getCreatedAt()
        );
    }
}

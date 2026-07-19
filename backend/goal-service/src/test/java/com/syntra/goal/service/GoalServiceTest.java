package com.syntra.goal.service;

import com.syntra.goal.dto.GoalProgressResponse;
import com.syntra.goal.dto.GoalRequest;
import com.syntra.goal.dto.GoalResponse;
import com.syntra.goal.model.Goal;
import com.syntra.goal.model.Milestone;
import com.syntra.goal.repository.GoalRepository;
import com.syntra.goal.repository.MilestoneRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GoalServiceTest {

    @Mock
    private GoalRepository goalRepository;

    @Mock
    private MilestoneRepository milestoneRepository;

    @InjectMocks
    private GoalService goalService;

    private Goal testGoal;
    private final UUID testGoalId = UUID.randomUUID();
    private final UUID testUserId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        testGoal = new Goal();
        testGoal.setId(testGoalId);
        testGoal.setUserId(testUserId);
        testGoal.setTitle("Test Goal");
        testGoal.setDescription("Test Description");
        testGoal.setDeadline(OffsetDateTime.now().plusDays(30));
        testGoal.setStatus(Goal.GoalStatus.ACTIVE);
        testGoal.setCreatedAt(OffsetDateTime.now());
    }

    @Test
    void createGoal_Success() {
        GoalRequest request = new GoalRequest(
                "Test Goal",
                "Test Description",
                OffsetDateTime.now().plusDays(30).toString(),
                testUserId
        );

        when(goalRepository.save(any(Goal.class))).thenReturn(testGoal);

        GoalResponse response = goalService.createGoal(request);

        assertNotNull(response);
        assertEquals(testGoalId, response.id());
        assertEquals("Test Goal", response.title());
        assertEquals(testUserId, response.userId());
        assertEquals(Goal.GoalStatus.ACTIVE.name(), response.status());

        verify(goalRepository).save(any(Goal.class));
    }

    @Test
    void getGoalProgress_NoMilestones_ReturnsZeroPercent() {
        when(goalRepository.findById(testGoalId)).thenReturn(Optional.of(testGoal));
        when(milestoneRepository.findByGoalId(testGoalId)).thenReturn(List.of());

        GoalProgressResponse response = goalService.getGoalProgress(testGoalId);

        assertNotNull(response);
        assertEquals(0.0, response.completionPercentage());
        assertEquals(0, response.milestones().size());
    }

    @Test
    void getGoalProgress_WithMilestones_CalculatesCorrectPercentage() {
        Milestone m1 = new Milestone();
        m1.setId(UUID.randomUUID());
        m1.setGoalId(testGoalId);
        m1.setStatus(Milestone.MilestoneStatus.COMPLETED);

        Milestone m2 = new Milestone();
        m2.setId(UUID.randomUUID());
        m2.setGoalId(testGoalId);
        m2.setStatus(Milestone.MilestoneStatus.PENDING);

        when(goalRepository.findById(testGoalId)).thenReturn(Optional.of(testGoal));
        when(milestoneRepository.findByGoalId(testGoalId)).thenReturn(Arrays.asList(m1, m2));

        GoalProgressResponse response = goalService.getGoalProgress(testGoalId);

        assertNotNull(response);
        assertEquals(50.0, response.completionPercentage());
        assertEquals(2, response.milestones().size());
    }
}

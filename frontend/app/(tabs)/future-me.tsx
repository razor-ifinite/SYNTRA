import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Pressable, Dimensions } from 'react-native';
import { SYNTRA_THEME } from '../../constants/Theme';
import { useFutureMeAI } from '../../src/hooks/useAI';
import Svg, { Line, Circle, Path, Polyline } from 'react-native-svg';
import { SkeletonLoader } from '../../src/components/SkeletonLoader';

const screenWidth = Dimensions.get('window').width;

export default function FutureMeScreen() {
  const futureMeAI = useFutureMeAI();
  const [gpa, setGpa] = useState('3.5');
  const [studyHours, setStudyHours] = useState('4');
  const [attendance, setAttendance] = useState('90');
  const [savings, setSavings] = useState('1000');

  const handleGenerate = () => {
    futureMeAI.mutate({
      gpa: parseFloat(gpa),
      studyHoursPerDay: parseFloat(studyHours),
      attendancePercentage: parseFloat(attendance),
      savingsTarget: parseFloat(savings),
    });
  };

  const handleReset = () => {
    futureMeAI.reset();
  };

  const renderChart = () => {
    if (!futureMeAI.data) return null;
    const { projectedGrowth } = futureMeAI.data;
    const padding = 20;
    const chartWidth = screenWidth - 48 - 48; // padding of container + card padding
    const chartHeight = 150;
    
    const minScore = Math.min(...projectedGrowth.map(d => d.score)) - 10;
    const maxScore = Math.max(...projectedGrowth.map(d => d.score)) + 10;
    
    const points = projectedGrowth.map((d, index) => {
      const x = padding + (index * (chartWidth - padding * 2)) / (projectedGrowth.length - 1);
      const y = chartHeight - padding - ((d.score - minScore) / (maxScore - minScore)) * (chartHeight - padding * 2);
      return `${x},${y}`;
    }).join(' ');

    return (
      <View style={styles.chartContainer}>
        <Svg width={chartWidth} height={chartHeight}>
          {/* Grid lines */}
          <Line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke={SYNTRA_THEME.colors.border} strokeWidth="1" />
          <Line x1={padding} y1={chartHeight / 2} x2={chartWidth - padding} y2={chartHeight / 2} stroke={SYNTRA_THEME.colors.border} strokeWidth="1" />
          <Line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke={SYNTRA_THEME.colors.border} strokeWidth="1" />
          
          <Polyline
            points={points}
            fill="none"
            stroke={SYNTRA_THEME.colors.white}
            strokeWidth="3"
          />
          {projectedGrowth.map((d, index) => {
            const x = padding + (index * (chartWidth - padding * 2)) / (projectedGrowth.length - 1);
            const y = chartHeight - padding - ((d.score - minScore) / (maxScore - minScore)) * (chartHeight - padding * 2);
            return (
              <Circle key={index} cx={x} cy={y} r="5" fill={SYNTRA_THEME.colors.success} />
            );
          })}
        </Svg>
        <View style={styles.chartLabels}>
          {projectedGrowth.map((d, index) => (
            <Text key={index} style={styles.chartLabelText}>{d.semester}</Text>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>FutureMe.</Text>
        <Text style={styles.headerSubtitle}>Generative Roadmap</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {!futureMeAI.data && !futureMeAI.isPending && (
          <View style={styles.inputCard}>
            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Current GPA</Text>
                <TextInput style={styles.input} value={gpa} onChangeText={setGpa} keyboardType="numeric" />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Study Hours/Day</Text>
                <TextInput style={styles.input} value={studyHours} onChangeText={setStudyHours} keyboardType="numeric" />
              </View>
            </View>
            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Attendance %</Text>
                <TextInput style={styles.input} value={attendance} onChangeText={setAttendance} keyboardType="numeric" />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Savings Target</Text>
                <TextInput style={styles.input} value={savings} onChangeText={setSavings} keyboardType="numeric" />
              </View>
            </View>
            <Pressable style={styles.generateButton} onPress={handleGenerate}>
              <Text style={styles.generateButtonText}>PROJECT FUTURE</Text>
            </Pressable>
          </View>
        )}

        {futureMeAI.isPending && (
          <View>
            <SkeletonLoader style={{ height: 250, marginBottom: 16 }} />
            <SkeletonLoader style={{ height: 150 }} />
          </View>
        )}

        {futureMeAI.data && (
          <View>
            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>Projected Trajectory</Text>
              {renderChart()}
            </View>

            <View style={styles.roadmapCard}>
              <Text style={styles.resultTitle}>Actionable Roadmap</Text>
              <Text style={styles.roadmapText}>{futureMeAI.data.roadmap}</Text>
            </View>

            <Pressable style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>RESET PROJECTION</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    color: SYNTRA_THEME.colors.textPrimary,
  },
  headerSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: SYNTRA_THEME.colors.primary,
  },
  content: {
    padding: 24,
    paddingBottom: 100,
  },
  inputCard: {
    backgroundColor: SYNTRA_THEME.colors.surface,
    borderRadius: 20,
    padding: 24,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  inputGroup: {
    width: '48%',
  },
  label: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: SYNTRA_THEME.colors.white,
    marginBottom: 8,
  },
  input: {
    backgroundColor: SYNTRA_THEME.colors.black,
    borderRadius: 12,
    padding: 16,
    color: SYNTRA_THEME.colors.white,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
  },
  generateButton: {
    backgroundColor: SYNTRA_THEME.colors.primaryDark,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  generateButtonText: {
    fontFamily: 'Inter_700Bold',
    color: SYNTRA_THEME.colors.white,
    fontSize: 16,
  },
  resultCard: {
    backgroundColor: SYNTRA_THEME.colors.surface,
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
  },
  resultTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: SYNTRA_THEME.colors.white,
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  chartLabelText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: SYNTRA_THEME.colors.white,
    opacity: 0.8,
  },
  roadmapCard: {
    backgroundColor: SYNTRA_THEME.colors.surface,
    borderRadius: 20,
    padding: 24,
  },
  roadmapText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: SYNTRA_THEME.colors.white,
    lineHeight: 24,
  },
  resetButton: {
    backgroundColor: SYNTRA_THEME.colors.black,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  resetButtonText: {
    fontFamily: 'Inter_700Bold',
    color: SYNTRA_THEME.colors.white,
    fontSize: 16,
  },
});

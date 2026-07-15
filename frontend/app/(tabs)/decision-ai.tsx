import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SYNTRA_THEME } from '../../constants/Theme';
import { useDecisionAI } from '../../src/hooks/useAI';
import { SkeletonLoader } from '../../src/components/SkeletonLoader';

export default function DecisionAIScreen() {
  const [scenario, setScenario] = useState('');
  const decisionAI = useDecisionAI();

  const handleGenerate = () => {
    if (!scenario) return;
    decisionAI.mutate(scenario);
  };

  const handleReset = () => {
    setScenario('');
    decisionAI.reset();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Decision AI</Text>
        <Text style={styles.headerSubtitle}>Stateless Analysis</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {!decisionAI.data && !decisionAI.isPending && (
          <View style={styles.inputCard}>
            <Text style={styles.label}>Describe your scenario</Text>
            <TextInput
              style={styles.textArea}
              value={scenario}
              onChangeText={setScenario}
              multiline
              numberOfLines={5}
              placeholder="E.g. Should I accept the job offer in New York or stay in my current role?"
              placeholderTextColor={SYNTRA_THEME.colors.textMuted}
            />
            <Pressable 
              style={styles.generateButton} 
              onPress={handleGenerate}
              disabled={!scenario}
            >
              <Text style={styles.generateButtonText}>GENERATE MATRIX</Text>
            </Pressable>
          </View>
        )}

        {decisionAI.isPending && (
          <View>
            <SkeletonLoader style={{ height: 150, marginBottom: 16 }} />
            <SkeletonLoader style={{ height: 200, marginBottom: 16 }} />
            <SkeletonLoader style={{ height: 200 }} />
          </View>
        )}

        {decisionAI.data && (
          <View>
            {decisionAI.data.options.map((option, idx) => (
              <View key={idx} style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <Text style={styles.optionTitle}>{option.optionTitle}</Text>
                  <Text style={styles.scoreText}>{option.opportunityScore}</Text>
                </View>
                
                <View style={styles.listSection}>
                  {option.pros.map((pro, i) => (
                    <Text key={`pro-${i}`} style={styles.proItem}>✓ {pro}</Text>
                  ))}
                  {option.cons.map((con, i) => (
                    <Text key={`con-${i}`} style={styles.conItem}>✗ {con}</Text>
                  ))}
                </View>
                
                <View style={styles.risksSection}>
                  <Text style={styles.risksLabel}>Risks</Text>
                  {option.risks.map((risk, i) => (
                    <Text key={`risk-${i}`} style={styles.riskItem}>{risk}</Text>
                  ))}
                </View>
              </View>
            ))}

            <Pressable style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>RESET MATRIX</Text>
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
    backgroundColor: SYNTRA_THEME.colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    color: SYNTRA_THEME.colors.white,
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
  label: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: SYNTRA_THEME.colors.white,
    marginBottom: 16,
  },
  textArea: {
    backgroundColor: SYNTRA_THEME.colors.black,
    borderRadius: 12,
    padding: 16,
    color: SYNTRA_THEME.colors.white,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  generateButton: {
    backgroundColor: SYNTRA_THEME.colors.primaryDark,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
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
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: SYNTRA_THEME.colors.borderPurple,
    paddingBottom: 16,
  },
  optionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: SYNTRA_THEME.colors.white,
    flex: 1,
  },
  scoreText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 32,
    color: SYNTRA_THEME.colors.success,
  },
  listSection: {
    marginBottom: 16,
  },
  proItem: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: SYNTRA_THEME.colors.success,
    marginBottom: 8,
  },
  conItem: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: SYNTRA_THEME.colors.danger,
    marginBottom: 8,
  },
  risksSection: {
    backgroundColor: SYNTRA_THEME.colors.black,
    padding: 16,
    borderRadius: 12,
  },
  risksLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: SYNTRA_THEME.colors.white,
    marginBottom: 8,
  },
  riskItem: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: SYNTRA_THEME.colors.textMuted,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  resetButton: {
    backgroundColor: SYNTRA_THEME.colors.black,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  resetButtonText: {
    fontFamily: 'Inter_700Bold',
    color: SYNTRA_THEME.colors.white,
    fontSize: 16,
  },
});

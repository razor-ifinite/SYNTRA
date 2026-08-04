import React, { useRef } from 'react';
import { Animated, PanResponder, StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import * as Haptics from '../utils/haptics';

interface SwipeableRowProps {
  children: React.ReactNode;
  onDelete: () => void;
  onRead?: () => void;
  isRead?: boolean;
}

export function SwipeableRow({ children, onDelete, onRead, isRead }: SwipeableRowProps) {
  const pan = useRef(new Animated.ValueXY()).current;
  const threshold = -80; // Distance to trigger action

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        // Only capture horizontal swipes
        return Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x }], { useNativeDriver: false }),
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < threshold) {
          // Swiped far enough to the left (Delete)
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          Animated.timing(pan, {
            toValue: { x: -500, y: 0 }, // animate off screen
            duration: 200,
            useNativeDriver: false,
          }).start(() => onDelete());
        } else if (gestureState.dx > -threshold && onRead && !isRead) {
          // Swiped far enough to the right (Mark as Read)
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
          onRead();
        } else {
          // Spring back to center
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      {/* Background Actions */}
      <View style={styles.background}>
        {onRead && !isRead && (
          <View style={[styles.actionBtn, styles.leftAction]}>
            <Text style={styles.actionText}>Read</Text>
          </View>
        )}
        <View style={[styles.actionBtn, styles.rightAction]}>
          <Text style={styles.actionText}>Delete</Text>
        </View>
      </View>
      
      {/* Foreground Content */}
      <Animated.View
        style={[styles.foreground, { transform: [{ translateX: pan.x }] }]}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: 12,
  },
  background: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#EF4444',
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  actionBtn: {
    width: 100,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  leftAction: {
    backgroundColor: '#10B981', // Green for read
    alignItems: 'flex-start',
  },
  rightAction: {
    backgroundColor: '#EF4444', // Red for delete
    alignItems: 'flex-end',
    marginLeft: 'auto',
  },
  actionText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  foreground: {
    backgroundColor: 'transparent',
  },
});

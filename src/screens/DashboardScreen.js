import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { BarChart3, TrendingUp, AlertTriangle, Clock, Package, Plus } from 'lucide-react-native';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import StatusIcon from '../components/common/StatusIcon';
import ApiService from '../services/api';
import { Colors } from '../constants/colors';
import { Spacing, Typography, BorderRadius, Layout } from '../constants/designSystem';

const DashboardScreen = ({ navigation }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const data = await ApiService.getDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your inventory...</Text>
        </View>
      </View>
    );
  }

  if (!dashboardData) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load dashboard data</Text>
          <Button 
            title="Retry" 
            onPress={fetchDashboardData}
            style={styles.retryButton}
          />
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header Section */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello there!</Text>
          <Text style={styles.subtitle}>Here's your inventory overview</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('Inventory')}
        >
          <Plus size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Key Metrics Card */}
      <Card style={styles.metricsCard} variant="elevated">
        <View style={styles.cardHeader}>
          <View style={styles.titleRow}>
            <View style={styles.iconContainer}>
              <BarChart3 size={24} color={Colors.primary} />
            </View>
            <Text style={styles.cardTitle}>Key Metrics</Text>
          </View>
        </View>
        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{dashboardData.keyMetrics?.totalItems || 0}</Text>
            <Text style={styles.metricLabel}>Total Items</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{dashboardData.keyMetrics?.expiringSoon || 0}</Text>
            <Text style={styles.metricLabel}>Expiring Soon</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{dashboardData.keyMetrics?.expiredItems || 0}</Text>
            <Text style={styles.metricLabel}>Expired Items</Text>
          </View>
        </View>
      </Card>

      {/* Expiring Soon Card */}
      <Card style={styles.listCard} variant="elevated">
        <View style={styles.cardHeader}>
          <View style={styles.titleRow}>
            <View style={[styles.iconContainer, { backgroundColor: Colors.warning[50] }]}>
              <Clock size={20} color={Colors.warning} />
            </View>
            <Text style={styles.cardTitle}>Expiring Soon</Text>
          </View>
        </View>
        {dashboardData.expiringSoon?.length > 0 ? (
          <>
            {dashboardData.expiringSoon.slice(0, 3).map((item, index) => (
              <View key={index} style={styles.listItem}>
                <StatusIcon daysUntilExpiry={item.daysLeft} size="sm" variant="badge" />
                <Text style={styles.listText}>
                  {item.name || 'Unknown Item'} 
                  <Text style={styles.daysText}> • {item.daysLeft || 0} days left</Text>
                </Text>
              </View>
            ))}
            {dashboardData.expiringSoon.length > 3 && (
              <Text style={styles.moreItemsText}>
                +{dashboardData.expiringSoon.length - 3} more items
              </Text>
            )}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No items expiring soon</Text>
          </View>
        )}
        <Button 
          title="View All Expiring" 
          variant="outline" 
          size="small" 
          style={styles.actionButton}
          onPress={() => {
            navigation.navigate('ExpiringItems');
          }}
        />
      </Card>

      {/* Recently Expired Card */}
      <Card style={styles.listCard} variant="elevated">
        <View style={styles.cardHeader}>
          <View style={styles.titleRow}>
            <View style={[styles.iconContainer, { backgroundColor: Colors.danger[50] }]}>
              <AlertTriangle size={20} color={Colors.danger} />
            </View>
            <Text style={styles.cardTitle}>Recently Expired</Text>
          </View>
        </View>
        {dashboardData.recentlyExpired?.length > 0 ? (
          <>
            {dashboardData.recentlyExpired.slice(0, 3).map((item, index) => (
              <View key={index} style={styles.listItem}>
                <StatusIcon daysUntilExpiry={-item.daysAgo} size="sm" variant="badge" />
                <Text style={styles.listText}>
                  {item.name || 'Unknown Item'} 
                  <Text style={styles.daysText}> • {item.daysAgo || 0} days ago</Text>
                </Text>
              </View>
            ))}
            {dashboardData.recentlyExpired.length > 3 && (
              <Text style={styles.moreItemsText}>
                +{dashboardData.recentlyExpired.length - 3} more items
              </Text>
            )}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No recently expired items</Text>
          </View>
        )}
        <Button 
          title="View All Expired" 
          variant="outline" 
          size="small" 
          style={styles.actionButton}
          onPress={() => {
            navigation.navigate('ExpiredItems');
          }}
        />
      </Card>

      {/* Waste Trend Card */}
      <Card style={styles.trendCard} variant="elevated">
        <View style={styles.cardHeader}>
          <View style={styles.titleRow}>
            <View style={[styles.iconContainer, { backgroundColor: Colors.info[50] }]}>
              <TrendingUp size={20} color={Colors.info} />
            </View>
            <Text style={styles.cardTitle}>Waste Trend</Text>
          </View>
        </View>
        <View style={styles.placeholder}>
          <View style={styles.placeholderIcon}>
            <BarChart3 size={48} color={Colors.gray[300]} />
          </View>
          <Text style={styles.placeholderText}>Analytics coming soon</Text>
          <Text style={styles.placeholderSubtext}>Track your waste patterns and optimize usage</Text>
        </View>
      </Card>

      {/* AI Suggestions Card */}
      <Card style={styles.suggestionCard} variant="elevated">
        <View style={styles.cardHeader}>
          <View style={styles.titleRow}>
            <View style={[styles.iconContainer, { backgroundColor: Colors.secondary[50] }]}>
              <Package size={20} color={Colors.secondary} />
            </View>
            <Text style={styles.cardTitle}>AI Suggestions</Text>
          </View>
        </View>
        {dashboardData.aiSuggestions?.length > 0 ? (
          <>
            {dashboardData.aiSuggestions.slice(0, 2).map((suggestion, index) => (
              <View key={index} style={styles.suggestionItem}>
                <Text style={styles.suggestionText}>{suggestion.message || 'No suggestions available'}</Text>
              </View>
            ))}
            {dashboardData.aiSuggestions.length > 2 && (
              <Text style={styles.moreItemsText}>
                +{dashboardData.aiSuggestions.length - 2} more suggestions
              </Text>
            )}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No AI suggestions available</Text>
          </View>
        )}
        <Button 
          title="View All Suggestions" 
          variant="outline" 
          size="small" 
          style={styles.actionButton}
          onPress={() => {
            navigation.navigate('Suggestions');
          }}
        />
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 120,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  greeting: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSize.lg,
    color: Colors.text.secondary,
    fontWeight: Typography.fontWeight.medium,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  loadingText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.text.secondary,
    fontWeight: Typography.fontWeight.medium,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  errorText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.danger,
    fontWeight: Typography.fontWeight.medium,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  retryButton: {
    marginTop: Spacing.md,
  },

  metricsCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  listCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  trendCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  suggestionCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing['4xl'],
  },
  
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: Spacing.md,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: Typography.fontSize['4xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  metricLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    fontWeight: Typography.fontWeight.medium,
    textAlign: 'center',
  },
  
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  listText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
    flex: 1,
    marginLeft: Spacing.md,
    fontWeight: Typography.fontWeight.medium,
  },
  daysText: {
    color: Colors.text.tertiary,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.normal,
  },
  moreItemsText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  
  emptyState: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.tertiary,
    fontStyle: 'italic',
  },
  
  actionButton: {
    marginTop: Spacing.md,
  },
  
  placeholder: {
    height: 140,
    backgroundColor: Colors.gray[50],
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    borderStyle: 'dashed',
  },
  placeholderIcon: {
    opacity: 0.5,
  },
  placeholderText: {
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  placeholderSubtext: {
    color: Colors.text.tertiary,
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    maxWidth: 200,
  },
  
  suggestionItem: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.gray[50],
    borderRadius: BorderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.secondary,
  },
  suggestionText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
});

export default DashboardScreen;

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../components/common/Card';
import StatusIcon from '../components/common/StatusIcon';
import ApiService from '../services/api';
import { Colors } from '../constants/colors';
import { getCategoryIcon, getCategoryColor } from '../utils/categoryIcons';

const ExpiredItemsScreen = ({ navigation }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchExpiredItems();
  }, []);

  const fetchExpiredItems = async () => {
    try {
      const allItems = await ApiService.getItems();
      const expiredItems = allItems.filter(item => item.daysUntilExpiry < 0);
      setItems(expiredItems);
    } catch (error) {
      console.error('Error fetching expired items:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchExpiredItems();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  const getDaysAgo = (daysUntilExpiry) => {
    return Math.abs(daysUntilExpiry);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Recently Expired</Text>
        <View style={{ width: 24 }} />
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="checkmark-circle" size={64} color={Colors.success} />
          <Text style={styles.emptyTitle}>Nothing Yet!</Text>
          <Text style={styles.emptySubtitle}>No items have expired recently</Text>
        </View>
      ) : (
        <View style={styles.itemsList}>
          {items.map((item) => {
            const CategoryIcon = getCategoryIcon(item.category.name);
            const categoryColor = getCategoryColor(item.category.name);
            const daysAgo = getDaysAgo(item.daysUntilExpiry);
            
            return (
              <Card key={item.id} style={styles.itemCard}>
                <View style={styles.itemContent}>
                  <View style={[styles.categoryIcon, { backgroundColor: categoryColor }]}>
                    <CategoryIcon size={24} color={Colors.primary} />
                  </View>
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.categoryName}>{item.category.name}</Text>
                    <Text style={styles.quantityText}>
                      {item.volume ? `${Math.round(item.volume)} g` : ''}
                    </Text>
                    <Text style={styles.expiryText}>
                      Expired: {formatDate(item.expiryDate)}
                    </Text>
                  </View>
                  <View style={styles.statusContainer}>
                    <StatusIcon daysUntilExpiry={item.daysUntilExpiry} size={20} />
                    <Text style={styles.daysText}>
                      {daysAgo} days ago
                    </Text>
                  </View>
                </View>
              </Card>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: Colors.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginTop: 8,
  },
  itemsList: {
    padding: 16,
  },
  itemCard: {
    marginBottom: 12,
    padding: 16,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  quantityText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  expiryText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  statusContainer: {
    alignItems: 'center',
  },
  daysText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    color: Colors.danger,
  },
});

export default ExpiredItemsScreen;

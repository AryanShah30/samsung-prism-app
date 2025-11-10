/**
 * ExpiringItemsScreen – list of items approaching expiry (API-provided filtered set).
 *
 * Responsibilities:
 *  - Fetch expiring items via ApiService.getExpiringItems.
 *  - Provide pull-to-refresh and clear empty state messaging.
 *  - Visual urgency coloring (<=3 days uses danger shade; otherwise warning).
 *
 * Data assumptions:
 *  - Each item contains `daysUntilExpiry` already computed server-side for consistency.
 */
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

const ExpiringItemsScreen = ({ navigation }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchExpiringItems();
  }, []);

  const fetchExpiringItems = async () => {
    try {
      const data = await ApiService.getExpiringItems();
      setItems(data.items || []);
    } catch (error) {
      console.error('Error fetching expiring items:', error);
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchExpiringItems();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
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
        <Text style={styles.title}>Expiring Soon</Text>
        <View style={{ width: 24 }} />
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="checkmark-circle" size={64} color={Colors.success[500]} />
          <Text style={styles.emptyTitle}>All Good!</Text>
          <Text style={styles.emptySubtitle}>No items are expiring soon</Text>
        </View>
      ) : (
        <View style={styles.itemsList}>
          {items.map((item) => {
            const CategoryIcon = getCategoryIcon(item.category.name);
            const categoryColor = getCategoryColor(item.category.name);
            
            return (
              <Card key={item.id} style={styles.itemCard}>
                <View style={styles.itemContent}>
                  <View style={[styles.categoryIcon, { backgroundColor: categoryColor }]}>
                    <CategoryIcon size={24} color={Colors.primary[500]} />
                  </View>
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.categoryName}>{item.category.name}</Text>
                    <Text style={styles.quantityText}>
                      {item.volume ? `${Math.round(item.volume)} g` : ''}
                    </Text>
                    <Text style={styles.expiryText}>
                      Expires: {formatDate(item.expiryDate)}
                    </Text>
                  </View>
                  <View style={styles.statusContainer}>
                    <StatusIcon daysUntilExpiry={item.daysUntilExpiry} size={20} />
                    <Text style={[
                      styles.daysText,
                      { color: item.daysUntilExpiry <= 3 ? Colors.danger[500] : Colors.warning[500] }
                    ]}>
                      {item.daysUntilExpiry} days left
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
  },
});

export default ExpiringItemsScreen;

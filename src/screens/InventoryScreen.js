import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import { Search, Filter, Plus, ArrowLeft, Settings, Grid3X3, List, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { createStackNavigator } from '@react-navigation/stack';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import StatusIcon from '../components/common/StatusIcon';
import ApiService from '../services/api';
import ItemDetailsScreen from './ItemDetailsScreen';
import CategoryManagementScreen from './CategoryManagementScreen';
import { getCategoryIcon, getCategoryColor } from '../utils/categoryIcons';
import { Colors } from '../constants/colors';
import { Spacing, Typography, BorderRadius, Layout } from '../constants/designSystem';

const Stack = createStackNavigator();

const CategoryListScreen = ({ navigation }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); 
  const [detecting, setDetecting] = useState(false);
  const [detected, setDetected] = useState(null); // {label, confidence}

  const pickImageFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'We need access to your photo library to pick images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      await runDetection(result.assets[0].uri);
    }
  };

  const takePhotoWithCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'We need camera access to take photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      await runDetection(result.assets[0].uri);
    }
  };

  const runDetection = async (uri) => {
    try {
      setDetecting(true);
      setDetected(null);
      const res = await ApiService.detectFood(uri);
      setDetected(res);

      // If we got a reasonable detection, offer to open Add Item with pre-filled fields
      try {
        const confidence = typeof res.confidence === 'number' ? res.confidence : null;
        const label = res.label || '';
        const estimatedDays = Number(res.estimated_expiry_days) || null;
        const estimatedVolume = Number(res.estimated_volume_ml) || null;
        const detectedCategoryName = res.category || null;

        const shouldPrompt = !!label || !!estimatedVolume || !!estimatedDays;

        if (shouldPrompt) {
          const percent = confidence ? Math.round(confidence * 100) : null;
          const messageParts = [];
          if (label) messageParts.push(`Name: ${label}`);
          if (percent !== null) messageParts.push(`Confidence: ${percent}%`);
          if (estimatedVolume) messageParts.push(`Quantity: ${Math.round(estimatedVolume)} g`);
          if (estimatedDays) messageParts.push(`Expires in ~${estimatedDays} day${estimatedDays > 1 ? 's' : ''}`);

          Alert.alert(
            'Add detected item?',
            messageParts.join('\n'),
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Add', onPress: () => {
                // find matching category (case-insensitive)
                let matchedCategory = null;
                if (detectedCategoryName && Array.isArray(categories)) {
                  matchedCategory = categories.find(c => c.name.toLowerCase() === detectedCategoryName.toLowerCase());
                }

                const now = Date.now();
                const expiryDate = estimatedDays ? new Date(now + estimatedDays * 24 * 60 * 60 * 1000).toISOString() : new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString();
                const prefill = {
                  id: 0,
                  name: label || '',
                  volume: estimatedVolume || 250,
                  dateAdded: new Date().toISOString(),
                  expiryDate,
                  notes: '',
                  category: matchedCategory ? { id: matchedCategory.id, name: matchedCategory.name } : undefined,
                  daysUntilExpiry: estimatedDays || 7,
                };

                navigation.navigate('ItemDetails', { item: prefill });
              } }
            ],
            { cancelable: true }
          );
        }
      } catch (e) {
        console.warn('Prefill/navigation error', e);
      }
    } catch (e) {
      console.error('Detection error', e);
      Alert.alert('Detection failed', e.message || 'Unable to detect item');
    } finally {
      setDetecting(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await ApiService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCategories();
  };

  const [showOnlyExpiring, setShowOnlyExpiring] = useState(false);

  const [allItems, setAllItems] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const items = await ApiService.getItems();
        setAllItems(items);
      } catch (e) {
        console.error('Error fetching items for counts:', e);
      }
    })();
  }, []);

  const getExpiringCountForCategory = (categoryId) => {
    return allItems.filter(i => i.categoryId === categoryId && i.daysUntilExpiry >= 0 && i.daysUntilExpiry <= 7).length;
  };

  const filteredCategories = categories
    .map(cat => ({ ...cat, expiringCount: getExpiringCountForCategory(cat.id) }))
    .filter(category => category.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(category => (showOnlyExpiring ? category.expiringCount > 0 : true));

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
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Inventory</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={[styles.viewModeButton, viewMode === 'grid' && styles.viewModeButtonActive]}
              onPress={() => setViewMode('grid')}
            >
              <Grid3X3 size={20} color={viewMode === 'grid' ? Colors.primary : Colors.gray[500]} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.viewModeButton, viewMode === 'list' && styles.viewModeButtonActive]}
              onPress={() => setViewMode('list')}
            >
              <List size={20} color={viewMode === 'list' ? Colors.primary : Colors.gray[500]} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.cameraButton}
              onPress={() => {
                Alert.alert('Add Image', 'Choose source', [
                  { text: 'Camera', onPress: takePhotoWithCamera },
                  { text: 'Gallery', onPress: pickImageFromLibrary },
                  { text: 'Cancel', style: 'cancel' },
                ]);
              }}
            >
              <Camera size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color={Colors.gray[500]} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search categories..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={Colors.gray[400]}
            />
          </View>
          <TouchableOpacity 
            style={[styles.filterButton, showOnlyExpiring && styles.filterButtonActive]} 
            onPress={() => setShowOnlyExpiring(v => !v)}
          >
            <Filter size={20} color={showOnlyExpiring ? Colors.warning : Colors.gray[500]} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('CategoryManagement')}
          >
            <Settings size={20} color={Colors.gray[600]} />
            <Text style={styles.actionButtonText}>Manage</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.addButton]}
            onPress={() => {
              if (typeof Alert.prompt === 'function') {
                Alert.prompt(
                  'New Category',
                  'Enter category name',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Create',
                      onPress: async (name) => {
                        if (!name) return;
                        try {
                          await ApiService.createCategory({ name });
                          fetchCategories();
                        } catch (e) {
                          console.error('Failed to create category', e);
                        }
                      }
                    }
                  ],
                  'plain-text'
                );
              } else {
                Alert.alert('Add Category', 'Adding categories is supported on iOS now. Android support coming soon.');
              }
            }}
          >
            <Plus size={20} color={Colors.primary} />
            <Text style={[styles.actionButtonText, styles.addButtonText]}>Add Category</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Detection Result */}
      {detected && (
        <View style={styles.detectContainerWrapper}>
          <Card style={styles.detectCard}>
            <Text style={styles.detectTitle}>Detected item</Text>
            <View style={styles.detectRow}>
              <Text style={styles.detectLabel}>{detected.label || 'No item'}</Text>
              {typeof detected.confidence === 'number' && (
                <Text style={styles.detectConfidence}>{Math.round(detected.confidence * 100)}%</Text>
              )}
            </View>
          </Card>
        </View>
      )}

      {/* Categories */}
      <View style={viewMode === 'grid' ? styles.categoriesGrid : styles.categoriesList}>
        {filteredCategories.slice(0, showAllCategories ? filteredCategories.length : 6).map((category) => {
          const CategoryIcon = getCategoryIcon(category.name);
          const categoryColor = getCategoryColor(category.name);
          return (
            <TouchableOpacity
              key={category.id}
              style={[
                viewMode === 'grid' ? styles.categoryCard : styles.categoryListItem,
                { backgroundColor: categoryColor }
              ]}
              onPress={() => navigation.navigate('ItemList', { category })}
            >
              <View style={styles.categoryIconContainer}>
                <CategoryIcon size={viewMode === 'grid' ? 32 : 24} color={Colors.primary} />
              </View>
              <View style={styles.categoryContent}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <View style={styles.expiryInfo}>
                  <StatusIcon 
                    daysUntilExpiry={category.expiringCount > 0 ? 2 : 10} 
                    size="sm" 
                    variant="badge"
                  />
                  <Text style={styles.expiryText}>
                    {category.expiringCount} expiring soon
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {filteredCategories.length > 6 && (
        <Button 
          title={showAllCategories ? "Show Less" : "View All Categories"} 
          variant="outline" 
          style={styles.viewAllButton} 
          onPress={() => setShowAllCategories(v => !v)} 
        />
      )}
    </ScrollView>
  );
};

const ItemListScreen = ({ route, navigation }) => {
  const { category } = route.params;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAllItems, setShowAllItems] = useState(false);

  const fetchItems = async () => {
    try {
      const data = await ApiService.getItems();
      const categoryItems = data.filter(item => item.categoryId === category.id);
      setItems(categoryItems);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchItems();
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
      <View style={styles.itemHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.categoryTitle}>{category.name}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('ItemDetails', { 
          item: { 
            id: 0, 
            name: '', 
            volume: 250, 
            dateAdded: new Date().toISOString(), 
            expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), 
            notes: '', 
            category: { id: category.id, name: category.name }, 
            daysUntilExpiry: 7 
          } 
        })}>
          <Plus size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.itemsGrid}>
        {items.slice(0, showAllItems ? items.length : 6).map((item) => {
          const CategoryIcon = getCategoryIcon(item.category.name);
          return (
            <TouchableOpacity
              key={item.id}
              style={styles.itemCard}
              onPress={() => navigation.navigate('ItemDetails', { item })}
            >
              <View style={styles.itemIconContainer}>
                <CategoryIcon size={28} color={Colors.primary} />
              </View>
              <View style={styles.itemNameContainer}>
                <Text style={styles.itemName}>{item.name}</Text>
                <StatusIcon daysUntilExpiry={item.daysUntilExpiry} size={12} />
              </View>
              <View style={styles.quantityContainer}>
                <Text style={styles.quantityText}>
                  {item.volume ? `${Math.round(item.volume)} g` : ''}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {items.length > 6 && (
        <Button title={showAllItems ? "Show Less" : "View All Items"} variant="outline" style={styles.viewAllButton} onPress={() => setShowAllItems(v => !v)} />
      )}
    </ScrollView>
  );
};

const InventoryScreen = ({ navigation }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CategoryList" component={CategoryListScreen} />
      <Stack.Screen name="ItemList" component={ItemListScreen} />
      <Stack.Screen name="ItemDetails" component={ItemDetailsScreen} />
      <Stack.Screen name="CategoryManagement" component={CategoryManagementScreen} />
    </Stack.Navigator>
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
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  headerTitle: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  viewModeButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray[100],
  },
  viewModeButtonActive: {
    backgroundColor: Colors.primary[50],
  },
  cameraButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary[50],
  },
  
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
  },
  filterButton: {
    padding: Spacing.md,
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.lg,
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterButtonActive: {
    backgroundColor: Colors.warning[50],
  },

  detectContainerWrapper: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  detectCard: {
    backgroundColor: Colors.gray[50],
  },
  detectTitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
    fontWeight: Typography.fontWeight.medium,
  },
  detectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detectLabel: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  detectConfidence: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
  },
  addButton: {
    backgroundColor: Colors.primary[50],
  },
  actionButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.gray[600],
  },
  addButtonText: {
    color: Colors.primary,
  },
  
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  categoriesList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  categoryCard: {
    width: '48%',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryIconContainer: {
    marginBottom: Spacing.md,
  },
  categoryContent: {
    flex: 1,
    alignItems: 'center',
  },
  categoryName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  expiryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  expiryText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    fontWeight: Typography.fontWeight.medium,
  },
  
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: 60, 
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  categoryTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  itemCard: {
    width: '48%',
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemIconContainer: {
    marginBottom: Spacing.md,
  },
  itemNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    width: '100%',
  },
  itemName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    textAlign: 'center',
    marginRight: Spacing.sm,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xs,
  },
  quantityText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    fontWeight: Typography.fontWeight.medium,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  viewAllButton: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: Spacing['5xl'],
    fontSize: Typography.fontSize.lg,
    color: Colors.text.secondary,
    fontWeight: Typography.fontWeight.medium,
  },
});

export default InventoryScreen;

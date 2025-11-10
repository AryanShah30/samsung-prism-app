/**
 * ItemDetailsScreen – create/edit form for a single inventory item.
 *
 * Behavior:
 *  - Distinguishes new vs existing item via `id === 0` sentinel.
 *  - Validates required fields locally before submission.
 *  - Uses grams as canonical volume unit (quantity) – server defaults to 'g'.
 *  - Lazy loads categories for selection modal.
 *
 * Post-save:
 *  - On create: transitions into edit state with returned item.
 *  - On delete: navigates back to parent list.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import ApiService from '../services/api';
import { Colors } from '../constants/colors';
import { getCategoryIcon, getCategoryColor } from '../utils/categoryIcons';

const ItemDetailsScreen = ({ route, navigation }) => {
  const { item: initialItem } = route.params;
  const [item, setItem] = useState(initialItem);
  const [isEditing, setIsEditing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isNewItem, setIsNewItem] = useState(initialItem.id === 0);
  const [categories, setCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [formData, setFormData] = useState({
    name: item.name || '',
    quantity: item.volume ? item.volume.toString() : '250',
    expiryDate: item.expiryDate ? item.expiryDate.split('T')[0] : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: item.notes || '',
    categoryId: item.category?.id || null,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await ApiService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Please enter an item name');
      return;
    }
    if (!formData.categoryId) {
      Alert.alert('Validation Error', 'Please select a category');
      return;
    }
    if (!formData.quantity || isNaN(parseFloat(formData.quantity)) || parseFloat(formData.quantity) <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid quantity in grams');
      return;
    }
    if (!formData.expiryDate) {
      Alert.alert('Validation Error', 'Please enter an expiry date');
      return;
    }

    setLoading(true);
    try {
      // send quantity (grams) to the server; server defaults unit to 'g' if omitted
      const itemData = {
        name: formData.name,
        quantity: parseFloat(formData.quantity),
        unit: 'g',
        expiryDate: new Date(formData.expiryDate).toISOString(),
        notes: formData.notes,
        categoryId: formData.categoryId,
      };

      let savedItem;
      if (isNewItem) {
        savedItem = await ApiService.createItem(itemData);
        setIsNewItem(false);
        Alert.alert('Success', 'Item created successfully!');
      } else {
        savedItem = await ApiService.updateItem(item.id, itemData);
        Alert.alert('Success', 'Item updated successfully!');
      }
      
      setItem(savedItem);
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Error', `Failed to ${isNewItem ? 'create' : 'update'} item. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (isNewItem) {
      navigation.goBack();
      return;
    }
    setFormData({
      name: item.name,
      quantity: item.volume ? item.volume.toString() : '250',
      expiryDate: item.expiryDate.split('T')[0],
      notes: item.notes || '',
      categoryId: item.category?.id || null,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await ApiService.deleteItem(item.id);
              Alert.alert('Success', 'Item deleted successfully!');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete item. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  const getStatusColor = (daysUntilExpiry) => {
  if (daysUntilExpiry < 0) return Colors.danger[500];
  if (daysUntilExpiry <= 3) return Colors.warning[500];
  return Colors.success[500];
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isNewItem ? 'Add New Item' : 'Edit Item'}
        </Text>
        <View style={styles.headerActions}>
          {!isNewItem && (
            <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
              <Ionicons name="trash-outline" size={24} color={Colors.danger[500]} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.itemHeader}>
          <View style={styles.itemNameContainer}>
            <Input
              label="Item Name"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Enter item name"
              style={styles.nameInput}
            />
          </View>
        </View>

      <Card style={styles.detailsCard}>
        <View style={styles.itemIcon}>
          {formData.categoryId ? (() => {
            const CategoryIcon = getCategoryIcon(categories.find(cat => cat.id === formData.categoryId)?.name || '');
            const categoryColor = getCategoryColor(categories.find(cat => cat.id === formData.categoryId)?.name || '');
            return <CategoryIcon size={60} color={categoryColor} />;
          })() : (
            <Ionicons name="cube-outline" size={60} color={Colors.gray[500]} />
          )}
        </View>

        <View style={styles.editForm}>
          <TouchableOpacity 
            style={styles.categorySelector}
            onPress={() => setShowCategoryModal(true)}
          >
            <Text style={styles.categoryLabel}>Category *</Text>
            <View style={styles.categoryValue}>
              <Text style={[
                styles.categoryText,
                !formData.categoryId && styles.placeholderText
              ]}>
                {formData.categoryId ? 
                  categories.find(cat => cat.id === formData.categoryId)?.name || 'Select Category' :
                  'Select Category'
                }
              </Text>
              <Ionicons name="chevron-down" size={20} color={Colors.gray[500]} />
            </View>
          </TouchableOpacity>
          
          <View style={styles.quantityRow}>
            <View style={styles.quantityContainer}>
              <Input
                label="Quantity (g) *"
                value={formData.quantity}
                onChangeText={(text) => setFormData({ ...formData, quantity: text })}
                keyboardType="numeric"
                placeholder="250"
                style={styles.quantityInput}
              />
            </View>
            {/* Unit selection removed - quantity is in grams by default */}
          </View>
          
          <Input
            label="Date Added"
            value={formatDate(item.dateAdded)}
            editable={false}
            style={styles.input}
          />
          
          <Input
            label="Expiry Date *"
            value={formData.expiryDate}
            onChangeText={(text) => setFormData({ ...formData, expiryDate: text })}
            placeholder="YYYY-MM-DD"
            style={styles.input}
          />
          
          <Input
            label="Notes (optional)"
            value={formData.notes}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
            multiline
            numberOfLines={3}
            placeholder="Add any additional notes..."
            style={styles.input}
          />
        </View>
      </Card>

        <View style={styles.actionButtons}>
          <Button
            title="Cancel"
            variant="outline"
            onPress={handleCancel}
            style={styles.actionButton}
          />
          <Button
            title={loading ? "Saving..." : isNewItem ? "Create" : "Save"}
            onPress={handleSave}
            disabled={loading}
            style={styles.actionButton}
          />
        </View>
      </ScrollView>

      <Modal
        visible={showCategoryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Ionicons name="close" size={24} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item: category }) => (
                <TouchableOpacity
                  style={[
                    styles.categoryItem,
                    formData.categoryId === category.id && styles.selectedCategoryItem
                  ]}
                  onPress={() => {
                    setFormData({ ...formData, categoryId: category.id });
                    setShowCategoryModal(false);
                  }}
                >
                  <Text style={[
                    styles.categoryItemText,
                    formData.categoryId === category.id && styles.selectedCategoryItemText
                  ]}>
                    {category.name}
                  </Text>
                  {formData.categoryId === category.id && (
                    <Ionicons name="checkmark" size={20} color={Colors.primary[500]} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    backgroundColor: Colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollContainer: {
    flex: 1,
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  itemHeader: {
    padding: 20,
    paddingTop: 10,
  },
  itemNameContainer: {
    width: '100%',
  },
  itemNameLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  itemName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    textAlign: 'center',
  },
  nameInput: {
    fontSize: 18,
    fontWeight: '600',
  },
  detailsCard: {
    margin: 16,
    alignItems: 'center',
  },
  itemIcon: {
    marginBottom: 20,
  },
  detailsList: {
    width: '100%',
  },
  detailItem: {
    backgroundColor: Colors.gray[200],
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  editForm: {
    width: '100%',
  },
  input: {
    marginBottom: 12,
  },
  quantityRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quantityContainer: {
    flex: 1,
  },
  unitContainer: {
    flex: 1,
  },
  unitOptionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  unitOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.background.accent,
    borderWidth: 1,
    borderColor: Colors.gray[300],
  },
  unitOptionSelected: {
    backgroundColor: Colors.primary[50],
  borderColor: Colors.primary[500],
  },
  unitOptionText: {
    color: Colors.text.primary,
  },
  unitOptionTextSelected: {
  color: Colors.primary[500],
    fontWeight: '600',
  },
  quantityInput: {
    marginBottom: 0,
  },
  unitInput: {
    marginBottom: 0,
  },
  placeholderText: {
    color: Colors.gray[400],
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 40,
    justifyContent: 'space-around',
    backgroundColor: Colors.background.secondary,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  deleteButton: {
    marginRight: 12,
  },
  editButton: {
    marginLeft: 8,
  },
  categorySelector: {
    marginBottom: 12,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  categoryValue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background.accent,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.gray[300],
  },
  categoryText: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    width: '90%',
    maxHeight: '70%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedCategoryItem: {
  backgroundColor: Colors.primary[50],
  },
  categoryItemText: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  selectedCategoryItemText: {
  color: Colors.primary[500],
    fontWeight: '600',
  },
});

export default ItemDetailsScreen;

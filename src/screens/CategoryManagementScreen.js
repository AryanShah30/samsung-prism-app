import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import ApiService from '../services/api';
import { Colors } from '../constants/colors';
import { getCategoryIcon, getCategoryColor } from '../utils/categoryIcons';

const CategoryManagementScreen = ({ navigation }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editCategoryName, setEditCategoryName] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await ApiService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      Alert.alert('Error', 'Failed to fetch categories');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCategories();
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    try {
      await ApiService.createCategory({ name: newCategoryName.trim() });
      setNewCategoryName('');
      setShowAddModal(false);
      fetchCategories();
      Alert.alert('Success', 'Category created successfully!');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to create category');
    }
  };

  const handleEditCategory = async () => {
    if (!editCategoryName.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    try {
      await ApiService.updateCategory(editingCategory.id, { name: editCategoryName.trim() });
      setEditingCategory(null);
      setEditCategoryName('');
      fetchCategories();
      Alert.alert('Success', 'Category updated successfully!');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update category');
    }
  };

  const handleDeleteCategory = (category) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await ApiService.deleteCategory(category.id);
              fetchCategories();
              Alert.alert('Success', 'Category deleted successfully!');
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to delete category');
            }
          }
        }
      ]
    );
  };

  const startEdit = (category) => {
    setEditingCategory(category);
    setEditCategoryName(category.name);
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setEditCategoryName('');
  };

  const toggleSelection = (categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedCategories([]);
  };

  const selectAll = () => {
    setSelectedCategories(categories.map(cat => cat.id));
  };

  const deselectAll = () => {
    setSelectedCategories([]);
  };

  const handleBulkDelete = () => {
    if (selectedCategories.length === 0) {
      Alert.alert('No Selection', 'Please select categories to delete');
      return;
    }

    Alert.alert(
      'Bulk Delete',
      `Are you sure you want to delete ${selectedCategories.length} category(ies)? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await ApiService.bulkDeleteCategories(selectedCategories);
              setSelectedCategories([]);
              setIsSelectionMode(false);
              fetchCategories();
              Alert.alert('Success', 'Categories deleted successfully!');
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to delete categories');
            }
          }
        }
      ]
    );
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
        <Text style={styles.title}>Manage Categories</Text>
        <View style={styles.headerActions}>
          {isSelectionMode && (
            <>
              <TouchableOpacity onPress={selectAll} style={styles.headerButton}>
                <Ionicons name="checkmark-done" size={20} color={Colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={deselectAll} style={styles.headerButton}>
                <Ionicons name="close" size={20} color={Colors.danger} />
              </TouchableOpacity>
              {selectedCategories.length > 0 && (
                <TouchableOpacity onPress={handleBulkDelete} style={styles.headerButton}>
                  <Ionicons name="trash" size={20} color={Colors.danger} />
                </TouchableOpacity>
              )}
            </>
          )}
          <TouchableOpacity onPress={toggleSelectionMode} style={styles.headerButton}>
            <Ionicons name={isSelectionMode ? "close" : "checkbox"} size={20} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowAddModal(true)}>
            <Ionicons name="add" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.categoriesList}>
        {categories.map((category) => {
          const CategoryIcon = getCategoryIcon(category.name);
          const categoryColor = getCategoryColor(category.name);
          const isSelected = selectedCategories.includes(category.id);
          
          return (
            <Card key={category.id} style={[
              styles.categoryCard,
              isSelected && styles.selectedCategoryCard
            ]}>
              {isSelectionMode ? (
                <TouchableOpacity 
                  style={styles.selectionCard}
                  onPress={() => toggleSelection(category.id)}
                >
                  <View style={styles.selectionContent}>
                    <View style={[styles.checkbox, isSelected && styles.checkedBox]}>
                      {isSelected && <Ionicons name="checkmark" size={16} color="white" />}
                    </View>
                    <View style={[styles.categoryIconContainer, { backgroundColor: categoryColor }]}>
                      <CategoryIcon size={24} color={Colors.primary} />
                    </View>
                    <Text style={styles.categoryName}>{category.name}</Text>
                  </View>
                </TouchableOpacity>
              ) : editingCategory?.id === category.id ? (
                <View style={styles.editForm}>
                  <Input
                    value={editCategoryName}
                    onChangeText={setEditCategoryName}
                    placeholder="Category name"
                    style={styles.editInput}
                    autoFocus
                  />
                  <View style={styles.editActions}>
                    <TouchableOpacity onPress={cancelEdit} style={styles.cancelButton}>
                      <Ionicons name="close" size={20} color={Colors.danger} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleEditCategory} style={styles.saveButton}>
                      <Ionicons name="checkmark" size={20} color={Colors.success} />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.categoryContent}>
                  <View style={[styles.categoryIconContainer, { backgroundColor: categoryColor }]}>
                    <CategoryIcon size={24} color={Colors.primary} />
                  </View>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <View style={styles.categoryActions}>
                    <TouchableOpacity 
                      onPress={() => startEdit(category)}
                      style={styles.actionButton}
                    >
                      <Ionicons name="create-outline" size={20} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => handleDeleteCategory(category)}
                      style={styles.actionButton}
                    >
                      <Ionicons name="trash-outline" size={20} color={Colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </Card>
          );
        })}
      </View>

      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Category</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>
            <Input
              label="Category Name"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              placeholder="Enter category name"
              style={styles.modalInput}
              autoFocus
            />
            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setShowAddModal(false)}
                style={styles.modalButton}
              />
              <Button
                title="Create"
                onPress={handleAddCategory}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  categoriesList: {
    padding: 16,
  },
  categoryCard: {
    marginBottom: 12,
    padding: 16,
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  categoryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.background.accent,
  },
  editForm: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editInput: {
    flex: 1,
    marginRight: 12,
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.danger + '20',
  },
  saveButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.success + '20',
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
  modalInput: {
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.background.accent,
  },
  selectedCategoryCard: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  selectionCard: {
    width: '100%',
  },
  selectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.gray[400],
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
});

export default CategoryManagementScreen;

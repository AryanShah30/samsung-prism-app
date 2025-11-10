/**
 * SuggestionsScreen – AI + heuristic suggestions surfaced outside chat context.
 *
 * Features:
 *  - Fetch aggregated suggestions list.
 *  - Categorizes suggestion types for icon/color semantics.
 *  - Supports pull-to-refresh.
 *
 * Future:
 *  - Deep link into specific recipes or multi-item optimization workflows.
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
import ApiService from '../services/api';
import { Colors } from '../constants/colors';

const SuggestionsScreen = ({ navigation }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const data = await ApiService.getSuggestions();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSuggestions();
  };

  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'recipe':
        return 'restaurant';
      case 'expiring':
        return 'time';
      case 'waste':
        return 'trash';
      case 'purchase':
        return 'cart';
      default:
        return 'bulb';
    }
  };

  const getSuggestionColor = (type) => {
    switch (type) {
      case 'recipe':
        return Colors.success[500];
      case 'expiring':
        return Colors.warning[500];
      case 'waste':
        return Colors.danger[500];
      case 'purchase':
        return Colors.info[500];
      default:
        return Colors.primary[500];
    }
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
        <Text style={styles.title}>AI Suggestions</Text>
        <View style={{ width: 24 }} />
      </View>

      {suggestions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="bulb" size={64} color={Colors.gray[400]} />
          <Text style={styles.emptyTitle}>No Suggestions Yet</Text>
          <Text style={styles.emptySubtitle}>Add some items to get personalized suggestions</Text>
        </View>
      ) : (
        <View style={styles.suggestionsList}>
          {suggestions.map((suggestion, index) => (
            <Card key={index} style={styles.suggestionCard}>
              <View style={styles.suggestionContent}>
                <View style={[
                  styles.suggestionIcon,
                  { backgroundColor: getSuggestionColor(suggestion.type) + '20' }
                ]}>
                  <Ionicons 
                    name={getSuggestionIcon(suggestion.type)} 
                    size={24} 
                    color={getSuggestionColor(suggestion.type)} 
                  />
                </View>
                <View style={styles.suggestionText}>
                  <Text style={styles.suggestionTitle}>
                    {suggestion.title || suggestion.message}
                  </Text>
                  <Text style={styles.suggestionMessage}>
                    {suggestion.title ? suggestion.message : 'Tap to learn more'}
                  </Text>
                  {suggestion.items && suggestion.items.length > 0 && (
                    <View style={styles.itemsList}>
                      <Text style={styles.itemsLabel}>Details:</Text>
                      {suggestion.items.map((item, itemIndex) => (
                        <Text key={itemIndex} style={styles.itemText}>
                          • {item}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            </Card>
          ))}
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
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  suggestionsList: {
    padding: 16,
  },
  suggestionCard: {
    marginBottom: 16,
    padding: 16,
  },
  suggestionContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  suggestionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  suggestionText: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  suggestionMessage: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  itemsList: {
    marginTop: 8,
  },
  itemsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  itemText: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
});

export default SuggestionsScreen;

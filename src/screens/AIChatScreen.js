import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ArrowLeft, Plus, User, MessageCircle, Send, Bot } from 'lucide-react-native';
import { createStackNavigator } from '@react-navigation/stack';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import ApiService from '../services/api';
import { Colors } from '../constants/colors';
import { Spacing, Typography, BorderRadius, Layout } from '../constants/designSystem';

const Stack = createStackNavigator();

const ChatScreen = ({ navigation, route }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'user',
      text: 'Hello! Can you help me with cooking tips?',
      timestamp: '11:52:55 PM',
    },
    {
      id: 2,
      type: 'ai',
      text: 'Hello! I\'d be happy to help you with cooking tips and recipe suggestions. What would you like to know about?',
      timestamp: '11:52:58 PM',
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const formatAIResponse = (replyPayload) => {
    if (!replyPayload) return 'Hey there! I\'m Chef AI, your friendly kitchen assistant. What would you like to chat about today?';
    
    return replyPayload.reply || 'Hey there! I\'m Chef AI, your friendly kitchen assistant. What would you like to chat about today?';
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const response = await ApiService.sendChatMessage(inputText.trim());
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        text: formatAIResponse(response),
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        text: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initial = route?.params?.initialMessage;
    if (initial && messages.length === 0) {
      setInputText(initial);
      setTimeout(() => {
        sendMessage();
      }, 0);
    }
  }, [route?.params?.initialMessage]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const startNewChat = () => {
    setMessages([
      {
        id: 1,
        type: 'user',
        text: 'Hello! Can you help me with cooking tips?',
        timestamp: '11:52:55 PM',
      },
      {
        id: 2,
        type: 'ai',
        text: 'Hello! I\'d be happy to help you with cooking tips and recipe suggestions. What would you like to know about?',
        timestamp: '11:52:58 PM',
      }
    ]);
    setInputText('');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.aiIconContainer}>
            <Bot size={20} color={Colors.primary} />
          </View>
          <Text style={styles.headerTitle}>Chef AI</Text>
        </View>
        <TouchableOpacity onPress={startNewChat} style={styles.newChatButton}>
          <Plus size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView 
        style={styles.messagesContainer} 
        keyboardShouldPersistTaps="handled" 
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 && (
          <View style={styles.welcomeContainer}>
            <View style={styles.welcomeIcon}>
              <Bot size={48} color={Colors.primary} />
            </View>
            <Text style={styles.welcomeTitle}>Welcome to Chef AI!</Text>
            <Text style={styles.welcomeSubtitle}>
              I'm here to help you with cooking tips, recipe suggestions, and inventory management.
            </Text>
          </View>
        )}
        
        {messages.map((message) => (
            <View key={message.id} style={[styles.messageWrapper, message.type === 'user' ? styles.userMessageWrapper : styles.aiMessageWrapper]}>
              <View
                style={[
                  styles.messageBubble,
                  message.type === 'user' ? styles.userMessage : styles.aiMessage,
                ]}
              >
                <Text style={[styles.messageText, message.type === 'user' ? styles.userMessageText : styles.aiMessageText]}>
                  {message.text || 'No message text'}
                </Text>
              </View>
              <Text style={[styles.messageTime, message.type === 'user' ? styles.userMessageTime : styles.aiMessageTime]}>
                {message.timestamp}
              </Text>
            </View>
        ))}
        
        {loading && (
          <View style={styles.messageWrapper}>
            <View style={[styles.messageBubble, styles.aiMessage]}>
              <View style={styles.messageContent}>
                <View style={styles.messageIcon}>
                  <Bot size={16} color={Colors.primary} />
                </View>
                <View style={styles.typingIndicator}>
                  <Text style={[styles.messageText, styles.aiMessageText]}>Thinking</Text>
                  <View style={styles.typingDots}>
                    <View style={[styles.typingDot, styles.typingDot1]} />
                    <View style={[styles.typingDot, styles.typingDot2]} />
                    <View style={[styles.typingDot, styles.typingDot3]} />
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder="Ask me about cooking, recipes, or your inventory..."
            placeholderTextColor={Colors.text.muted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <View style={styles.inputActions}>
            {isKeyboardVisible && (
              <TouchableOpacity onPress={dismissKeyboard} style={styles.keyboardButton}>
                <Text style={styles.keyboardButtonText}>Done</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]} 
              onPress={sendMessage}
              disabled={!inputText.trim()}
            >
              <Send size={20} color={inputText.trim() ? Colors.primary : Colors.gray[400]} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const SuggestionsScreen = ({ navigation }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSuggestions = async () => {
    try {
      const data = await ApiService.getSuggestions();
      const list = Array.isArray(data) ? data : (data?.suggestions || []);
      setSuggestions(list);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([
        { id: 1, text: 'Suggestion 1' },
        { id: 2, text: 'Suggestion 2' },
        { id: 3, text: 'Suggestion 3' },
        { id: 4, text: 'Suggestion 4' },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSuggestions();
  };

  const handleSuggestionPress = (suggestion) => {
    navigation.navigate('Chat', { initialMessage: suggestion.text });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading suggestions...</Text>
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
          <ArrowLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.spacer} />
        <TouchableOpacity>
          <Plus size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.suggestionsContainer}>
        <Text style={styles.suggestionsTitle}>Suggestions</Text>
        {Array.isArray(suggestions) && suggestions.map((suggestion, index) => (
          <TouchableOpacity
            key={suggestion.id ?? `${suggestion.type || 'suggestion'}-${suggestion.message || suggestion.text || ''}-${index}`}
            style={styles.suggestionCard}
            onPress={() => handleSuggestionPress(suggestion)}
          >
            <Text style={styles.suggestionText}>{suggestion.text || suggestion.message}</Text>
          </TouchableOpacity>
        ))}
        <Button
          title="See All Suggestions"
          variant="outline"
          style={styles.seeAllButton}
        />
      </View>
    </ScrollView>
  );
};

const AIChatScreen = ({ navigation }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="Suggestions" component={SuggestionsScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    paddingTop: 60,
    backgroundColor: Colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
  },
  backButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  aiIconContainer: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  newChatButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary[50],
  },
  
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.lg, 
  },
  messageWrapper: {
    marginBottom: Spacing.md,
  },
  userMessageWrapper: {
    alignItems: 'flex-end',
  },
  aiMessageWrapper: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '85%',
    minHeight: 40,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
  },
  userMessage: {
    backgroundColor: '#6366F1',
    borderBottomRightRadius: BorderRadius.sm,
  },
  aiMessage: {
    backgroundColor: '#FFFFFF', 
    borderBottomLeftRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  messageContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  messageIcon: {
    marginTop: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
    color: '#111827',
    padding: 8, 
  },
  userMessageText: {
    color: '#FFFFFF', 
  },
  aiMessageText: {
    color: '#111827', 
  },
  messageTime: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
    marginTop: Spacing.xs,
  },
  userMessageTime: {
    textAlign: 'right',
  },
  aiMessageTime: {
    textAlign: 'left',
  },
  
  welcomeContainer: {
    alignItems: 'center',
    paddingVertical: Spacing['6xl'],
    paddingHorizontal: Spacing.xl,
  },
  welcomeIcon: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  welcomeTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.base,
    maxWidth: 280,
  },
  
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  typingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  typingDot1: {
    opacity: 0.4,
  },
  typingDot2: {
    opacity: 0.7,
  },
  typingDot3: {
    opacity: 1,
  },
  
  inputContainer: {
    backgroundColor: Colors.background.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    paddingBottom: 20,
    marginBottom: 120, 
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border.medium,
    borderRadius: BorderRadius['2xl'],
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    maxHeight: 100,
    fontSize: Typography.fontSize.base,
    backgroundColor: Colors.background.secondary,
    color: Colors.text.primary,
  },
  inputActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  keyboardButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.gray[100],
    borderRadius: BorderRadius.lg,
  },
  keyboardButtonText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.primary,
    fontWeight: Typography.fontWeight.medium,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.gray[100],
  },
  
  suggestionsContainer: {
    padding: Spacing.lg,
  },
  suggestionsTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  suggestionCard: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
  },
  suggestionText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
    textAlign: 'center',
    fontWeight: Typography.fontWeight.medium,
  },
  seeAllButton: {
    marginTop: Spacing.lg,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: Spacing['5xl'],
    fontSize: Typography.fontSize.lg,
    color: Colors.text.secondary,
    fontWeight: Typography.fontWeight.medium,
  },
});

export default AIChatScreen;

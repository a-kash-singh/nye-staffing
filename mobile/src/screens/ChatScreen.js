import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import io from 'socket.io-client';

const API_URL = 'http://localhost:3000/api';

export default function ChatScreen() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    fetchRooms();
    const initSocket = async () => {
      const token = await AsyncStorage.getItem('token');
      const newSocket = io('http://localhost:3000', {
        auth: { token },
      });

      newSocket.on('new_message', (message) => {
        setMessages((prev) => [...prev, message]);
      });

      setSocket(newSocket);
    };

    initSocket();

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);

  useEffect(() => {
    if (selectedRoom && socket) {
      socket.emit('join_room', selectedRoom.id);
      fetchMessages(selectedRoom.id);
    }
  }, [selectedRoom, socket]);

  const fetchRooms = async () => {
    try {
      const response = await axios.get(`${API_URL}/chat/my-rooms`);
      setRooms(response.data.rooms || []);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    }
  };

  const fetchMessages = async (roomId) => {
    try {
      const response = await axios.get(`${API_URL}/chat/rooms/${roomId}/messages`);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedRoom || !socket) return;

    socket.emit('send_message', {
      roomId: selectedRoom.id,
      message: newMessage,
    });

    setNewMessage('');
  };

  return (
    <View style={styles.container}>
      {!selectedRoom ? (
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.roomItem}
              onPress={() => setSelectedRoom(item)}
            >
              <Text style={styles.roomName}>
                {item.name || item.event_title}
              </Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={styles.chatContainer}>
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.messageContainer}>
                <Text style={styles.messageUser}>{item.user_name}</Text>
                <Text style={styles.messageText}>{item.message}</Text>
              </View>
            )}
          />
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type a message..."
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendMessage}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  roomItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  roomName: {
    fontSize: 16,
    fontWeight: '500',
  },
  chatContainer: {
    flex: 1,
  },
  messageContainer: {
    padding: 10,
    marginBottom: 10,
  },
  messageUser: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

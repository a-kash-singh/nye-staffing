import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export default function EventsScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API_URL}/shifts/available`);
      setEvents(response.data.shifts || []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const handleSignUp = async (eventId) => {
    try {
      await axios.post(`${API_URL}/shifts/${eventId}/signup`);
      fetchEvents();
      alert('Successfully signed up for shift!');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to sign up');
    }
  };

  const renderEvent = ({ item }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
    >
      <Text style={styles.eventTitle}>{item.title}</Text>
      <Text style={styles.eventDate}>
        {new Date(item.date).toLocaleDateString()} - {item.start_time} to{' '}
        {item.end_time}
      </Text>
      <Text style={styles.eventLocation}>{item.location}</Text>
      {item.my_signup_status ? (
        <Text style={styles.statusText}>
          Status: {item.my_signup_status}
        </Text>
      ) : (
        <TouchableOpacity
          style={styles.signupButton}
          onPress={() => handleSignUp(item.id)}
        >
          <Text style={styles.signupButtonText}>Sign Up</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No available events</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  eventCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  eventDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  eventLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  signupButton: {
    backgroundColor: '#1976d2',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  signupButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  statusText: {
    color: '#666',
    fontStyle: 'italic',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 50,
  },
});

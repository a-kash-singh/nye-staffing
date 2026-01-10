import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import axios from 'axios';
import * as Location from 'expo-location';

const API_URL = 'http://localhost:3000/api';

export default function EventDetailScreen({ route, navigation }) {
  const { eventId } = route.params;
  const [event, setEvent] = useState(null);
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvent();
    fetchAttendanceStatus();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const response = await axios.get(`${API_URL}/events/${eventId}`);
      setEvent(response.data.event);
    } catch (error) {
      console.error('Failed to fetch event:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/attendance/status/${eventId}`);
      setAttendanceStatus(response.data.status);
    } catch (error) {
      console.error('Failed to fetch attendance status:', error);
    }
  };

  const handleClockIn = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Location permission is required for clock in');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const locationData = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      };

      await axios.post(`${API_URL}/attendance/clock-in`, {
        event_id: eventId,
        location: locationData,
      });

      Alert.alert('Success', 'Clocked in successfully');
      fetchAttendanceStatus();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to clock in');
    }
  };

  const handleClockOut = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Location permission is required for clock out');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const locationData = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      };

      await axios.post(`${API_URL}/attendance/clock-out`, {
        event_id: eventId,
        location: locationData,
      });

      Alert.alert('Success', 'Clocked out successfully');
      fetchAttendanceStatus();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to clock out');
    }
  };

  if (loading || !event) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.description}>{event.description}</Text>

      <View style={styles.infoSection}>
        <Text style={styles.infoLabel}>Date:</Text>
        <Text style={styles.infoValue}>
          {new Date(event.date).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoLabel}>Time:</Text>
        <Text style={styles.infoValue}>
          {event.start_time} - {event.end_time}
        </Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoLabel}>Location:</Text>
        <Text style={styles.infoValue}>{event.location}</Text>
      </View>

      {attendanceStatus === 'not_clocked_in' && (
        <TouchableOpacity style={styles.clockInButton} onPress={handleClockIn}>
          <Text style={styles.buttonText}>Clock In</Text>
        </TouchableOpacity>
      )}

      {attendanceStatus === 'on_duty' && (
        <TouchableOpacity style={styles.clockOutButton} onPress={handleClockOut}>
          <Text style={styles.buttonText}>Clock Out</Text>
        </TouchableOpacity>
      )}

      {attendanceStatus === 'off_duty' && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>Already clocked out</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  infoSection: {
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  clockInButton: {
    backgroundColor: '#2e7d32',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  clockOutButton: {
    backgroundColor: '#d32f2f',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusContainer: {
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  statusText: {
    color: '#666',
    fontSize: 16,
  },
});

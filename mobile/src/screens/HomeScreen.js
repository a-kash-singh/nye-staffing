import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api'; // Update with your backend URL

export default function HomeScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [upcomingShifts, setUpcomingShifts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, shiftsRes] = await Promise.all([
        axios.get(`${API_URL}/dashboard/staff`),
        axios.get(`${API_URL}/shifts/my-shifts?status=approved`),
      ]);
      setStats(statsRes.data.stats);
      setUpcomingShifts(shiftsRes.data.shifts?.slice(0, 5) || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.title}>Dashboard</Text>

      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.approved_shifts || 0}</Text>
            <Text style={styles.statLabel}>Approved Shifts</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.pending_shifts || 0}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>
      )}

      <Text style={styles.sectionTitle}>Upcoming Shifts</Text>
      {upcomingShifts.length === 0 ? (
        <Text style={styles.emptyText}>No upcoming shifts</Text>
      ) : (
        upcomingShifts.map((shift) => (
          <TouchableOpacity
            key={shift.id}
            style={styles.shiftCard}
            onPress={() => navigation.navigate('EventDetail', { eventId: shift.id })}
          >
            <Text style={styles.shiftTitle}>{shift.title}</Text>
            <Text style={styles.shiftDate}>
              {new Date(shift.date).toLocaleDateString()} - {shift.start_time} to{' '}
              {shift.end_time}
            </Text>
            <Text style={styles.shiftLocation}>{shift.location}</Text>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  shiftCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  shiftTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  shiftDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  shiftLocation: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
});

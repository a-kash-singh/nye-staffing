import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export default function AttendanceScreen() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await axios.get(`${API_URL}/attendance/my-logs`);
      setLogs(response.data.logs || []);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchLogs();
  };

  const renderLog = ({ item }) => (
    <View style={styles.logCard}>
      <Text style={styles.eventTitle}>{item.event_title}</Text>
      <Text style={styles.date}>
        {new Date(item.event_date).toLocaleDateString()}
      </Text>
      <View style={styles.timeRow}>
        <Text style={styles.timeLabel}>Clock In:</Text>
        <Text style={styles.timeValue}>
          {item.clock_in
            ? new Date(item.clock_in).toLocaleTimeString()
            : 'N/A'}
        </Text>
      </View>
      <View style={styles.timeRow}>
        <Text style={styles.timeLabel}>Clock Out:</Text>
        <Text style={styles.timeValue}>
          {item.clock_out
            ? new Date(item.clock_out).toLocaleTimeString()
            : 'N/A'}
        </Text>
      </View>
      <Text style={styles.status}>Status: {item.status}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={logs}
        renderItem={renderLog}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No attendance records</Text>
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
  logCard: {
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
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  timeLabel: {
    fontSize: 14,
    color: '#666',
  },
  timeValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  status: {
    fontSize: 14,
    color: '#1976d2',
    marginTop: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 50,
  },
});

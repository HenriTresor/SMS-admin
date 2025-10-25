import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from './Card';
import Table from './Table';
import Button from './Button';
import api from '../utils/api';
import { API_ENDPOINTS } from '../constants';

const Dashboard: React.FC = () => {
  const [users, setUsers] = useState([]);
  const [devices, setDevices] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, devicesRes, transactionsRes] = await Promise.all([
        api.get(API_ENDPOINTS.USERS),
        api.get(API_ENDPOINTS.DEVICES),
        api.get(API_ENDPOINTS.TRANSACTIONS),
      ]);
      setUsers(usersRes.data.users);
      setDevices(devicesRes.data.devices);
      setTransactions(transactionsRes.data.transactions);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const verifyDevice = async (deviceId: string) => {
    try {
      await api.put(`${API_ENDPOINTS.DEVICES}/${deviceId}/verify`);
      fetchData();
    } catch (error) {
      alert('Failed to verify device');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/');
  };

  const userColumns = [
    { key: 'email', header: 'Email' },
    { key: 'balance', header: 'Balance' },
    { key: 'devices', header: 'Devices', render: (value: any[]) => value.length },
  ];

  const deviceColumns = [
    { key: 'deviceId', header: 'Device ID' },
    { key: 'user', header: 'User Email', render: (value: any) => value.email },
    {
      key: 'isVerified',
      header: 'Verified',
      render: (value: boolean) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Verified' : 'Unverified'}
        </span>
      ),
    },
    {
      key: 'id',
      header: 'Action',
      render: (value: string, row: any) => (
        !row.isVerified && (
          <Button
            size="sm"
            onClick={() => verifyDevice(value)}
          >
            Verify
          </Button>
        )
      ),
    },
  ];

  const transactionColumns = [
    { key: 'type', header: 'Type', render: (value: string) => value.charAt(0).toUpperCase() + value.slice(1) },
    { key: 'amount', header: 'Amount' },
    { key: 'user', header: 'User Email', render: (value: any) => value.email },
    { key: 'createdAt', header: 'Date', render: (value: string) => new Date(value).toLocaleString() },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <Button variant="secondary" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0 space-y-6">
          <Card title="Users">
            <Table columns={userColumns} data={users} />
          </Card>

          <Card title="Devices">
            <Table columns={deviceColumns} data={devices} />
          </Card>

          <Card title="Transactions">
            <Table columns={transactionColumns} data={transactions} />
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

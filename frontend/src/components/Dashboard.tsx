import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from './Card';
import Button from './Button';
import Input from './Input';
import api from '../utils/api';
import { API_ENDPOINTS } from '../constants';

interface User {
  id: string;
  email: string;
  balance: number;
  createdAt: string;
  devices: Device[];
}

interface Device {
  id: string;
  deviceId: string;
  isVerified: boolean;
  createdAt: string;
  user: User;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  createdAt: string;
  user: User;
}

interface Stats {
  totalUsers: number;
  totalDevices: number;
  verifiedDevices: number;
  totalTransactions: number;
  totalBalance: number;
  recentTransactions: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalDevices: 0,
    verifiedDevices: 0,
    totalTransactions: 0,
    totalBalance: 0,
    recentTransactions: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<Device[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'devices' | 'transactions'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [deviceFilter, setDeviceFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterData();
  }, [users, devices, transactions, searchTerm, deviceFilter]);

  const fetchData = async () => {
    try {
      const [usersRes, devicesRes, transactionsRes] = await Promise.all([
        api.get(API_ENDPOINTS.USERS),
        api.get(API_ENDPOINTS.DEVICES),
        api.get(API_ENDPOINTS.TRANSACTIONS),
      ]);

      const usersData = usersRes.data.users || [];
      const devicesData = devicesRes.data.devices || [];
      const transactionsData = transactionsRes.data.transactions || [];

      setUsers(usersData);
      setDevices(devicesData);
      setTransactions(transactionsData);

      // Calculate statistics
      const stats: Stats = {
        totalUsers: usersData.length,
        totalDevices: devicesData.length,
        verifiedDevices: devicesData.filter((d: Device) => d.isVerified).length,
        totalTransactions: transactionsData.length,
        totalBalance: usersData.reduce((sum: number, user: User) => sum + user.balance, 0),
        recentTransactions: transactionsData.filter((t: Transaction) =>
          new Date(t.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        ).length,
      };
      setStats(stats);

    } catch (error) {
      console.error('Failed to fetch data:', error);
      alert('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    // Filter users
    const filteredUsers = users.filter(user =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filteredUsers);

    // Filter devices
    let filteredDevices = devices.filter(device =>
      device.deviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (deviceFilter !== 'all') {
      filteredDevices = filteredDevices.filter(device =>
        deviceFilter === 'verified' ? device.isVerified : !device.isVerified
      );
    }
    setFilteredDevices(filteredDevices);

    // Filter transactions
    const filteredTransactions = transactions.filter(transaction =>
      transaction.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTransactions(filteredTransactions);
  };

  const verifyDevice = async (deviceId: string) => {
    try {
      await api.put(`${API_ENDPOINTS.DEVICES}/${deviceId}/verify`);
      await fetchData(); // Refresh all data
    } catch (error) {
      console.error('Failed to verify device:', error);
      alert('Failed to verify device');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/');
  };

  const StatCard: React.FC<{ title: string; value: string | number; icon: string; color: string }> = ({ title, value, icon, color }) => (
    <Card className="p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color}`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-xl text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Credit Jambo Admin</h1>
              <p className="text-gray-600">Savings Management Dashboard</p>
            </div>
            <Button variant="secondary" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Navigation Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'users', label: 'Users', icon: '👥' },
              { id: 'devices', label: 'Devices', icon: '📱' },
              { id: 'transactions', label: 'Transactions', icon: '💰' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-1 py-2 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Search and Filters */}
        {(activeTab !== 'overview') && (
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={setSearchTerm}
                className="w-full"
              />
            </div>
            {activeTab === 'devices' && (
              <select
                value={deviceFilter}
                onChange={(e) => setDeviceFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Devices</option>
                <option value="verified">Verified Only</option>
                <option value="unverified">Unverified Only</option>
              </select>
            )}
          </div>
        )}

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Users"
                value={stats.totalUsers}
                icon="👥"
                color="bg-blue-100 text-blue-600"
              />
              <StatCard
                title="Total Balance"
                value={`$${stats.totalBalance.toLocaleString()}`}
                icon="💰"
                color="bg-green-100 text-green-600"
              />
              <StatCard
                title="Verified Devices"
                value={`${stats.verifiedDevices}/${stats.totalDevices}`}
                icon="📱"
                color="bg-purple-100 text-purple-600"
              />
              <StatCard
                title="Recent Transactions"
                value={stats.recentTransactions}
                icon="⚡"
                color="bg-orange-100 text-orange-600"
              />
            </div>

            {/* Recent Activity */}
            <Card title="Recent Transactions" className="p-6">
              <div className="space-y-4">
                {filteredTransactions.slice(0, 10).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        transaction.type === 'deposit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {transaction.type === 'deposit' ? '↑' : '↓'}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{transaction.user.email}</p>
                        <p className="text-xs text-gray-500">{new Date(transaction.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className={`text-sm font-semibold ${
                      transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'deposit' ? '+' : '-'}${transaction.amount}
                    </div>
                  </div>
                ))}
                {filteredTransactions.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No transactions found</p>
                )}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'users' && (
          <Card title={`Users (${filteredUsers.length})`} className="p-6">
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{user.email}</p>
                    <p className="text-sm text-gray-500">
                      {user.devices.length} device{user.devices.length !== 1 ? 's' : ''} •
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-green-600">${user.balance.toFixed(2)}</p>
                  </div>
                </div>
              ))}
              {filteredUsers.length === 0 && (
                <p className="text-center text-gray-500 py-8">No users found</p>
              )}
            </div>
          </Card>
        )}

        {activeTab === 'devices' && (
          <Card title={`Devices (${filteredDevices.length})`} className="p-6">
            <div className="space-y-4">
              {filteredDevices.map((device) => (
                <div key={device.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 font-mono text-sm">{device.deviceId}</p>
                    <p className="text-sm text-gray-600">{device.user.email}</p>
                    <p className="text-xs text-gray-500">
                      Added {new Date(device.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      device.isVerified
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {device.isVerified ? 'Verified' : 'Unverified'}
                    </span>
                    {!device.isVerified && (
                      <Button
                        size="sm"
                        onClick={() => verifyDevice(device.id)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Verify
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {filteredDevices.length === 0 && (
                <p className="text-center text-gray-500 py-8">No devices found</p>
              )}
            </div>
          </Card>
        )}

        {activeTab === 'transactions' && (
          <Card title={`Transactions (${filteredTransactions.length})`} className="p-6">
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'deposit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {transaction.type === 'deposit' ? '↑' : '↓'}
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">{transaction.user.email}</p>
                      <p className="text-sm text-gray-500">
                        {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)} •
                        {new Date(transaction.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className={`text-lg font-semibold ${
                    transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'deposit' ? '+' : '-'}${transaction.amount}
                  </div>
                </div>
              ))}
              {filteredTransactions.length === 0 && (
                <p className="text-center text-gray-500 py-8">No transactions found</p>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

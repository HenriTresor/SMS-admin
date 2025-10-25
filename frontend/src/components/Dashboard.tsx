import { useState, useEffect } from 'react';
import axios from 'axios';

interface DashboardProps {
  token: string;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ token, onLogout }) => {
  const [users, setUsers] = useState([]);
  const [devices, setDevices] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const [usersRes, devicesRes, transactionsRes] = await Promise.all([
        axios.get('http://localhost:3001/admin/users'),
        axios.get('http://localhost:3001/admin/devices'),
        axios.get('http://localhost:3001/admin/transactions'),
      ]);
      setUsers(usersRes.data.users);
      setDevices(devicesRes.data.devices);
      setTransactions(transactionsRes.data.transactions);
    } catch (error) {
      console.error(error);
    }
  };

  const verifyDevice = async (deviceId: string) => {
    try {
      await axios.put(`http://localhost:3001/admin/devices/${deviceId}/verify`);
      fetchData();
    } catch (error) {
      alert('Failed to verify device');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button onClick={onLogout} className="bg-red-500 text-white px-4 py-2 rounded">
          Logout
        </button>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Users</h2>
        <table className="w-full bg-white rounded shadow">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2">Email</th>
              <th className="p-2">Balance</th>
              <th className="p-2">Devices</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: any) => (
              <tr key={user.id} className="border-t">
                <td className="p-2">{user.email}</td>
                <td className="p-2">${user.balance}</td>
                <td className="p-2">{user.devices.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Devices</h2>
        <table className="w-full bg-white rounded shadow">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2">Device ID</th>
              <th className="p-2">User Email</th>
              <th className="p-2">Verified</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((device: any) => (
              <tr key={device.id} className="border-t">
                <td className="p-2">{device.deviceId}</td>
                <td className="p-2">{device.user.email}</td>
                <td className="p-2">{device.isVerified ? 'Yes' : 'No'}</td>
                <td className="p-2">
                  {!device.isVerified && (
                    <button
                      onClick={() => verifyDevice(device.id)}
                      className="bg-green-500 text-white px-2 py-1 rounded"
                    >
                      Verify
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">Transactions</h2>
        <table className="w-full bg-white rounded shadow">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2">Type</th>
              <th className="p-2">Amount</th>
              <th className="p-2">User Email</th>
              <th className="p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn: any) => (
              <tr key={txn.id} className="border-t">
                <td className="p-2">{txn.type}</td>
                <td className="p-2">${txn.amount}</td>
                <td className="p-2">{txn.user.email}</td>
                <td className="p-2">{new Date(txn.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;

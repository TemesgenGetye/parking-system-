'use client';

import { useState, useEffect } from 'react';
import StatusBar from '@/components/ui/StatusBar';
import Card from '@/components/ui/Card';
import { ParkingZone } from '@/types/parking';

export default function ZonesPage() {
  const [zones, setZones] = useState<ParkingZone[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingZone, setEditingZone] = useState<ParkingZone | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    hourlyRate: 15,
    available: true,
  });

  useEffect(() => {
    loadZones();
  }, []);

  const loadZones = () => {
    const storedZones = localStorage.getItem('parkingZones');
    if (storedZones) {
      setZones(JSON.parse(storedZones));
    } else {
      // Initialize with default zones
      const defaultZones: ParkingZone[] = [
        { id: '1', name: 'Downtown', code: 'LK0804', hourlyRate: 15, available: true },
        { id: '2', name: 'City Center', code: 'LK0805', hourlyRate: 20, available: true },
        { id: '3', name: 'Airport', code: 'LK0806', hourlyRate: 25, available: true },
        { id: '4', name: 'Mall', code: 'LK0807', hourlyRate: 18, available: false },
        { id: '5', name: 'Residential', code: 'LK0808', hourlyRate: 12, available: true },
      ];
      setZones(defaultZones);
      localStorage.setItem('parkingZones', JSON.stringify(defaultZones));
    }
  };

  const saveZones = (updatedZones: ParkingZone[]) => {
    localStorage.setItem('parkingZones', JSON.stringify(updatedZones));
    setZones(updatedZones);
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingZone(null);
    setFormData({
      name: '',
      code: '',
      hourlyRate: 15,
      available: true,
    });
  };

  const handleEdit = (zone: ParkingZone) => {
    setEditingZone(zone);
    setIsAdding(false);
    setFormData({
      name: zone.name,
      code: zone.code,
      hourlyRate: zone.hourlyRate,
      available: zone.available,
    });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingZone(null);
    setFormData({
      name: '',
      code: '',
      hourlyRate: 15,
      available: true,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingZone) {
      // Update existing zone
      const updatedZones = zones.map(z =>
        z.id === editingZone.id
          ? { ...z, ...formData }
          : z
      );
      saveZones(updatedZones);
    } else {
      // Add new zone
      const newZone: ParkingZone = {
        id: Date.now().toString(),
        ...formData,
      };
      saveZones([...zones, newZone]);
    }

    handleCancel();
  };

  const handleDelete = (zoneId: string) => {
    if (confirm('Are you sure you want to delete this parking zone?')) {
      const updatedZones = zones.filter(z => z.id !== zoneId);
      saveZones(updatedZones);
    }
  };

  const handleToggleAvailability = (zoneId: string) => {
    const updatedZones = zones.map(z =>
      z.id === zoneId ? { ...z, available: !z.available } : z
    );
    saveZones(updatedZones);
  };

  const getAvailableCount = () => {
    return zones.filter(z => z.available).length;
  };

  const getTotalCount = () => zones.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <StatusBar />
      <main className="ml-64 px-6 py-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black">Parking Zones Management</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage your parking zones and availability
              </p>
            </div>
            <button
              onClick={handleAdd}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              + Add Zone
            </button>
          </div>

          {/* Statistics */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Zones</p>
                  <p className="mt-1 text-2xl font-bold text-black">{getTotalCount()}</p>
                </div>
                <div className="rounded-full bg-blue-100 p-3">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Available Zones</p>
                  <p className="mt-1 text-2xl font-bold text-green-600">{getAvailableCount()}</p>
                </div>
                <div className="rounded-full bg-green-100 p-3">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Unavailable Zones</p>
                  <p className="mt-1 text-2xl font-bold text-red-600">
                    {getTotalCount() - getAvailableCount()}
                  </p>
                </div>
                <div className="rounded-full bg-red-100 p-3">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </Card>
          </div>

          {/* Add/Edit Form */}
          {(isAdding || editingZone) && (
            <Card className="mb-6">
              <h2 className="mb-4 text-lg font-semibold text-black">
                {editingZone ? 'Edit Zone' : 'Add New Zone'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Zone Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Downtown"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Zone Code
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="e.g., LK0804"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hourly Rate (ETB)
                    </label>
                    <input
                      type="number"
                      value={formData.hourlyRate}
                      onChange={(e) => setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) || 0 })}
                      min="0"
                      step="0.01"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Availability
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.available}
                        onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                      />
                      <span className="text-sm text-gray-700">
                        {formData.available ? 'Available' : 'Unavailable'}
                      </span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 transition-colors"
                  >
                    {editingZone ? 'Update Zone' : 'Add Zone'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </Card>
          )}

          {/* Zones List */}
          <Card>
            <h2 className="mb-4 text-lg font-semibold text-black">All Parking Zones</h2>
            {zones.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <p>No parking zones yet. Add your first zone to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                        Zone Code
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                        Hourly Rate
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {zones.map((zone) => (
                      <tr key={zone.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-4 py-3">
                          <p className="font-semibold text-black">{zone.code}</p>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <p className="text-gray-700">{zone.name}</p>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <p className="text-gray-700">{zone.hourlyRate.toFixed(2)} ETB/hr</p>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <button
                            onClick={() => handleToggleAvailability(zone.id)}
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                              zone.available
                                ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
                                : 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200'
                            }`}
                          >
                            {zone.available ? 'Available' : 'Unavailable'}
                          </button>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(zone)}
                              className="rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(zone.id)}
                              className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}

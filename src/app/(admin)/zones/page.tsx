'use client';

import { useState, Fragment } from 'react';
import StatusBar from '@/components/ui/StatusBar';
import Card from '@/components/ui/Card';
import { ParkingZone } from '@/types/parking';
import { ZONE_COLORS } from '@/utils/zoneColors';
// @ts-ignore: optional dev dependency for QR rendering
import QRCode from 'react-qr-code';
import { useZones, useCreateZone, useUpdateZone, useDeleteZone } from '@/hooks';

export default function ZonesPage() {
  const { data: zones = [], isLoading, error } = useZones();
  const createZone = useCreateZone();
  const updateZone = useUpdateZone();
  const deleteZone = useDeleteZone();

  const [isAdding, setIsAdding] = useState(false);
  const [editingZone, setEditingZone] = useState<ParkingZone | null>(null);
  const [showQRCodeFor, setShowQRCodeFor] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    hourlyRate: 15,
    available: true,
  });

  const handleAdd = () => {
    setIsAdding(true);
    setEditingZone(null);
    setFormData({ name: '', code: '', hourlyRate: 15, available: true });
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
    setFormData({ name: '', code: '', hourlyRate: 15, available: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingZone) {
        await updateZone.mutateAsync({ id: editingZone.id, zone: formData });
      } else {
        await createZone.mutateAsync(formData);
      }
      handleCancel();
    } catch (err) {
      console.log("error", err);
      alert(err instanceof Error ? err.message : 'Failed to save zone');
    }
  };

  const handleDelete = async (zoneId: string) => {
    if (!confirm('Are you sure you want to delete this parking zone? Any sessions in this zone will also be removed.')) return;
    try {
      await deleteZone.mutateAsync(zoneId);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete zone');
      console.log("error", err);
    }
  };

  const handleToggleAvailability = async (zone: ParkingZone) => {
    try {
      await updateZone.mutateAsync({
        id: zone.id,
        zone: { available: !zone.available },
      });
    } catch (err) {
      console.log("error", err);
      alert(err instanceof Error ? err.message : 'Failed to update zone');
    }
  };

  const getAvailableCount = () => zones.filter((z) => z.available).length;
  const getTotalCount = () => zones.length;

  const getUserUrlForZone = (zone: ParkingZone) => {
    if (typeof window === 'undefined') return `/user?zone=${zone.id}`;
    return `${window.location.origin}/user?zone=${zone.id}`;
  };

  const handleCopyLink = async (zone: ParkingZone) => {
    try {
      await navigator.clipboard.writeText(getUserUrlForZone(zone));
      alert('Link copied to clipboard');
    } catch(err) {
      console.log("error", err);
      alert('Unable to copy link');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading zones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-600">Failed to load zones. Check your Supabase connection.</p>
      </div>
    );
  }

  return (
    <div>
      <StatusBar />
      <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex justify-end">
            <button
              onClick={handleAdd}
              className="rounded-2xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-600/20 hover:bg-red-700 transition-colors"
            >
              + Add Zone
            </button>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Zones</p>
                  <p className="mt-1 text-2xl font-bold text-black">{getTotalCount()}</p>
                </div>
                <div className="rounded-full bg-gray-100 p-3">
                  <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <div className={`rounded-full p-3 ${ZONE_COLORS.available.icon}`}>
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
                  <p className="mt-1 text-2xl font-bold text-gray-600">{getTotalCount() - getAvailableCount()}</p>
                </div>
                <div className={`rounded-full p-3 ${ZONE_COLORS.unavailable.icon}`}>
                  <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </Card>
          </div>

          {(isAdding || editingZone) && (
            <Card className="mb-6">
              <h2 className="mb-4 text-lg font-semibold text-black">
                {editingZone ? 'Edit Zone' : 'Add New Zone'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Zone Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Downtown"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Zone Code</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="e.g., LK0804"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate (ETB)</label>
                    <input
                      type="number"
                      value={formData.hourlyRate}
                      onChange={(e) => setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) || 0 })}
                      min="0"
                      step="0.01"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.available}
                        onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-600"
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
                    disabled={createZone.isPending || updateZone.isPending}
                    className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50"
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
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Zone Code</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Hourly Rate</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {zones.map((zone) => (
                      <Fragment key={zone.id}>
                        <tr className="hover:bg-gray-50">
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
                              onClick={() => handleToggleAvailability(zone)}
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold transition-colors hover:opacity-90 ${
                                zone.available
                                  ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
                                  : 'bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300'
                              }`}
                            >
                              {zone.available ? 'Available' : 'Unavailable'}
                            </button>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(zone)}
                                className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700 transition-colors"
                              >
                                Edit
                              </button>
                              {zone.available && (
                                <button
                                  onClick={() => setShowQRCodeFor(showQRCodeFor === zone.id ? null : zone.id)}
                                  className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700 transition-colors"
                                >
                                  QR
                                </button>
                              )}
                             
                            </div>
                          </td>
                        </tr>
                        {showQRCodeFor === zone.id && (
                          <tr className="bg-white">
                            <td colSpan={5} className="px-4 py-4">
                              <div className="flex items-center gap-6">
                                <div className="bg-white p-4 rounded border">
                                  <QRCode value={getUserUrlForZone(zone)} size={128} />
                                </div>
                                <div>
                                  <p className="text-sm text-gray-700 mb-2">
                                    Users can scan this QR to open the user portal preselected to zone{' '}
                                    <span className="font-semibold">{zone.code}</span>.
                                  </p>
                                  <div className="flex gap-2">
                                    <button onClick={() => handleCopyLink(zone)} className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-black">
                                      Copy link
                                    </button>
                                    <a href={getUserUrlForZone(zone)} target="_blank" rel="noreferrer" className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white">
                                      Open link
                                    </a>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
      </div>
    </div>
  );
}

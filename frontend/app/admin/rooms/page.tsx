'use client';

import { useState, useEffect } from 'react';
import { DoorOpen, Search, Trash2, X, Building2 } from 'lucide-react';
import { roomsApi, Room, CreateRoomData } from '@/lib/api/rooms';
import toast from 'react-hot-toast';

export default function RoomsManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<CreateRoomData>({
    name: '',
    building: '',
    floor: 1,
    capacity: 40,
    type: 'lecture',
    hasProjector: false,
    hasComputers: false,
    computerCount: 0,
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      const data = await roomsApi.getAll();
      setRooms(data);
    } catch (error) {
      toast.error('Failed to load rooms');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.building) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      await roomsApi.create(formData);
      toast.success('Room created successfully');
      setShowAddModal(false);
      setFormData({
        name: '',
        building: '',
        floor: 1,
        capacity: 40,
        type: 'lecture',
        hasProjector: false,
        hasComputers: false,
        computerCount: 0,
      });
      fetchRooms();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create room');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      await roomsApi.delete(id);
      toast.success('Room deleted successfully');
      fetchRooms();
    } catch (error: any) {
      const status = error.response?.status;
      if (status === 404) {
        toast.error('Room no longer exists. Refreshing list...');
        fetchRooms();
      } else {
        toast.error(error.response?.data?.message || 'Failed to delete room');
      }
    }
  };

  const buildings = Array.from(new Set(rooms.map((room) => room.building))).sort();
  const roomTypes = ['lecture', 'lab', 'seminar', 'auditorium'];

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.building.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBuilding = selectedBuilding === 'all' || room.building === selectedBuilding;
    const matchesType = selectedType === 'all' || room.type === selectedType;
    return matchesSearch && matchesBuilding && matchesType;
  });

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="border-b border-gray-200 pb-8">
        <div className="text-xs font-medium tracking-wide uppercase text-gray-400 mb-4">
          Room Management
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-black mb-2">Rooms</h1>
            <p className="text-gray-600">Manage classrooms and facilities</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors"
          >
            <DoorOpen className="h-5 w-5" />
            Add Room
          </button>
        </div>
      </div>

      {/* Filters */}
      <div>
        <div className="text-sm font-medium text-black uppercase tracking-wide mb-6">
          01. Filters
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by room name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors"
            />
          </div>

          {/* Building Filter */}
          <select
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
          >
            <option value="all">All Buildings</option>
            {buildings.map((building) => (
              <option key={building} value={building}>
                {building}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
          >
            <option value="all">All Types</option>
            {roomTypes.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Rooms Grid */}
      <div>
        <div className="text-sm font-medium text-black uppercase tracking-wide mb-6">
          02. Rooms ({isLoading ? '...' : filteredRooms.length})
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-1 bg-gray-200 p-1">
          {isLoading ? (
            // Loading skeleton
            <>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white p-8 animate-pulse">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="h-8 w-16 bg-gray-200 rounded mb-1"></div>
                      <div className="h-4 w-32 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between"><div className="h-4 w-20 bg-gray-200 rounded"></div><div className="h-4 w-12 bg-gray-200 rounded"></div></div>
                    <div className="flex justify-between"><div className="h-4 w-20 bg-gray-200 rounded"></div><div className="h-4 w-16 bg-gray-200 rounded"></div></div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="h-3 w-20 bg-gray-200 rounded mb-2"></div>
                    <div className="flex gap-2">
                      <div className="h-6 w-16 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : filteredRooms.length === 0 ? (
            <div className="col-span-3 bg-white p-12 text-center text-gray-400">
              No rooms found matching your criteria
            </div>
          ) : (
            filteredRooms.map((room) => (
              <div key={room.id} className="bg-white p-8 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-2xl font-bold text-black mb-1">{room.name}</div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building2 className="h-4 w-4" />
                      {room.building}, Floor {room.floor}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDelete(room.id, room.name)}
                      className="p-2 text-black hover:bg-gray-100 transition-colors"
                      title="Delete room"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Capacity</span>
                    <span className="text-black font-medium">{room.capacity} seats</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Type</span>
                    <span className="px-3 py-1 text-xs font-medium border border-gray-300 text-black uppercase">
                      {room.type}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                    Equipment
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {room.hasProjector && (
                      <span className="px-2 py-1 text-xs border border-gray-300 text-gray-600">
                        Projector
                      </span>
                    )}
                    {room.hasComputers && (
                      <span className="px-2 py-1 text-xs border border-gray-300 text-gray-600">
                        {room.computerCount} Computers
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Room Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-sm z-50 flex items-center justify-center p-8">
          <div className="bg-white max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200">
              <div>
                <div className="text-xs font-medium tracking-wide uppercase text-gray-400 mb-2">
                  Room Management
                </div>
                <h2 className="text-2xl font-bold text-black">Add New Room</h2>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-black hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              <div className="space-y-6">
                <div className="text-sm font-medium text-black uppercase tracking-wide">
                  01. Basic Information
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Room Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
                      placeholder="A101"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Building *
                    </label>
                    <input
                      type="text"
                      value={formData.building}
                      onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
                      placeholder="Main Building"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Floor *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.floor}
                      onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
                      placeholder="1"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Capacity *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
                      placeholder="40"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Room Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
                      required
                      disabled={isSubmitting}
                    >
                      {roomTypes.map((type) => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="text-sm font-medium text-black uppercase tracking-wide">
                  02. Equipment
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="hasProjector"
                      checked={formData.hasProjector}
                      onChange={(e) => setFormData({ ...formData, hasProjector: e.target.checked })}
                      className="h-5 w-5 border-gray-300 text-black focus:ring-black"
                      disabled={isSubmitting}
                    />
                    <label htmlFor="hasProjector" className="text-sm font-medium text-black">
                      Projector
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="hasComputers"
                      checked={formData.hasComputers}
                      onChange={(e) => setFormData({ ...formData, hasComputers: e.target.checked })}
                      className="h-5 w-5 border-gray-300 text-black focus:ring-black"
                      disabled={isSubmitting}
                    />
                    <label htmlFor="hasComputers" className="text-sm font-medium text-black">
                      Computers
                    </label>
                  </div>

                  <div className="ml-8">
                    <label className="block text-sm font-medium text-black mb-2">
                      Number of Computers
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.computerCount}
                      onChange={(e) => setFormData({ ...formData, computerCount: parseInt(e.target.value) })}
                      className="w-full md:w-48 px-4 py-3 border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
                      placeholder="0"
                      disabled={isSubmitting || !formData.hasComputers}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-6">
                <button
                  type="submit"
                  className="px-8 py-3 bg-black text-white hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Room'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-8 py-3 border border-gray-300 text-black hover:bg-gray-50 transition-colors font-medium"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

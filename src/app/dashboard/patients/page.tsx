'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  Calendar,
  FileText,
  MoreVertical,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

/**
 * Patients Page - Patient management and records
 */
export default function PatientsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Sample patients data
  const patients = [
    { id: 1, name: 'Rahul Sharma', phone: '+91 98765 43210', email: 'rahul@email.com', lastVisit: '2026-01-05', totalVisits: 8, age: 35 },
    { id: 2, name: 'Priya Patel', phone: '+91 87654 32109', email: 'priya@email.com', lastVisit: '2026-01-08', totalVisits: 3, age: 28 },
    { id: 3, name: 'Amit Kumar', phone: '+91 76543 21098', email: 'amit@email.com', lastVisit: '2026-01-02', totalVisits: 12, age: 42 },
    { id: 4, name: 'Sunita Devi', phone: '+91 65432 10987', email: 'sunita@email.com', lastVisit: '2025-12-28', totalVisits: 5, age: 55 },
    { id: 5, name: 'Vikram Singh', phone: '+91 54321 09876', email: 'vikram@email.com', lastVisit: '2026-01-07', totalVisits: 2, age: 31 },
    { id: 6, name: 'Neha Reddy', phone: '+91 43210 98765', email: 'neha@email.com', lastVisit: '2026-01-09', totalVisits: 7, age: 26 },
  ];

  const filteredPatients = patients.filter(
    (p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           p.phone.includes(searchQuery) ||
           p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-healthcare-text">Patients</h1>
          <p className="text-healthcare-muted">Manage patient records and history</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} iconPosition="left">
          Add Patient
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Patients', value: '1,234', icon: Users, color: 'primary' },
          { label: 'New This Month', value: '45', icon: Users, color: 'green' },
          { label: 'Active Patients', value: '890', icon: Users, color: 'accent' },
          { label: 'Avg. Visits', value: '4.5', icon: Calendar, color: 'secondary' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-healthcare-border p-4"
          >
            <div className={`w-10 h-10 rounded-lg mb-3 flex items-center justify-center ${
              stat.color === 'primary' ? 'bg-primary-100 text-primary-600' :
              stat.color === 'green' ? 'bg-green-100 text-green-600' :
              stat.color === 'accent' ? 'bg-accent-100 text-accent-600' :
              'bg-secondary-100 text-secondary-600'
            }`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-healthcare-text">{stat.value}</p>
            <p className="text-sm text-healthcare-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl border border-healthcare-border p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-healthcare-muted" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone, or email..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-healthcare-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-healthcare-border rounded-lg text-sm text-healthcare-muted hover:bg-slate-100">
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Patients List */}
      <div className="bg-white rounded-xl border border-healthcare-border overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50 border-b border-healthcare-border text-sm font-medium text-healthcare-muted">
          <div className="col-span-3">Patient</div>
          <div className="col-span-2">Contact</div>
          <div className="col-span-2">Last Visit</div>
          <div className="col-span-2">Total Visits</div>
          <div className="col-span-2">Age</div>
          <div className="col-span-1">Actions</div>
        </div>

        <div className="divide-y divide-healthcare-border">
          {filteredPatients.map((patient, index) => (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 hover:bg-slate-50 transition-colors items-center"
            >
              {/* Patient */}
              <div className="col-span-3 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {patient.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-healthcare-text">{patient.name}</p>
                  <p className="text-xs text-healthcare-muted">ID: P{patient.id.toString().padStart(4, '0')}</p>
                </div>
              </div>

              {/* Contact */}
              <div className="col-span-2 space-y-1">
                <p className="text-sm text-healthcare-text flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {patient.phone}
                </p>
                <p className="text-xs text-healthcare-muted flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {patient.email}
                </p>
              </div>

              {/* Last Visit */}
              <div className="col-span-2 flex items-center gap-2 text-sm text-healthcare-text">
                <Calendar className="w-4 h-4 text-healthcare-muted" />
                {new Date(patient.lastVisit).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>

              {/* Total Visits */}
              <div className="col-span-2 text-sm">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">
                  {patient.totalVisits} visits
                </span>
              </div>

              {/* Age */}
              <div className="col-span-2 text-sm text-healthcare-text">
                {patient.age} years
              </div>

              {/* Actions */}
              <div className="col-span-1 flex items-center gap-2">
                <button className="p-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors">
                  <FileText className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <MoreVertical className="w-4 h-4 text-healthcare-muted" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

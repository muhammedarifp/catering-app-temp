'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import {
  UserCog,
  Save,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Star,
  Briefcase,
  CreditCard,
  AlertCircle,
  Plus,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { loadStaff, addStaff, updateStaff, getRoleLabel } from '@/lib/staffStorage';
import { StaffRole, EmploymentType, StaffStatus } from '@/lib/types';

export default function StaffFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditing = !!editId;

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsappNumber: '',
    email: '',
    address: '',
    role: 'helper' as StaffRole,
    employmentType: 'freelance' as EmploymentType,
    status: 'active' as StaffStatus,
    skills: [] as string[],
    experienceYears: 0,
    hourlyRate: 0,
    dailyRate: 0,
    rating: 4,
    idProofType: '',
    idProofNumber: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    bankAccountName: '',
    bankAccountNumber: '',
    bankName: '',
    bankIfsc: '',
    upiId: '',
    notes: '',
    availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
  });

  const [newSkill, setNewSkill] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editId) {
      const staffList = loadStaff();
      const staff = staffList.find((s) => s.id === editId);
      if (staff) {
        setFormData({
          name: staff.name,
          phone: staff.phone,
          whatsappNumber: staff.whatsappNumber || '',
          email: staff.email || '',
          address: staff.address || '',
          role: staff.role,
          employmentType: staff.employmentType,
          status: staff.status,
          skills: staff.skills,
          experienceYears: staff.experienceYears,
          hourlyRate: staff.hourlyRate,
          dailyRate: staff.dailyRate || 0,
          rating: staff.rating,
          idProofType: staff.idProof || '',
          idProofNumber: staff.idProofNumber || '',
          emergencyContactName: staff.emergencyContact?.name || '',
          emergencyContactPhone: staff.emergencyContact?.phone || '',
          emergencyContactRelation: staff.emergencyContact?.relation || '',
          bankAccountName: staff.bankDetails?.accountName || '',
          bankAccountNumber: staff.bankDetails?.accountNumber || '',
          bankName: staff.bankDetails?.bankName || '',
          bankIfsc: staff.bankDetails?.ifscCode || '',
          upiId: staff.bankDetails?.upiId || '',
          notes: staff.notes || '',
          availableDays: staff.availableDays || [],
        });
      }
    }
  }, [editId]);

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({ ...formData, skills: formData.skills.filter((s) => s !== skill) });
  };

  const toggleDay = (day: string) => {
    if (formData.availableDays.includes(day)) {
      setFormData({ ...formData, availableDays: formData.availableDays.filter((d) => d !== day) });
    } else {
      setFormData({ ...formData, availableDays: [...formData.availableDays, day] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const staffData = {
        name: formData.name,
        phone: formData.phone,
        whatsappNumber: formData.whatsappNumber || formData.phone,
        email: formData.email || undefined,
        address: formData.address || undefined,
        role: formData.role,
        employmentType: formData.employmentType,
        status: formData.status,
        skills: formData.skills,
        experienceYears: formData.experienceYears,
        hourlyRate: formData.hourlyRate,
        dailyRate: formData.dailyRate || undefined,
        rating: formData.rating,
        idProof: formData.idProofType || undefined,
        idProofNumber: formData.idProofNumber || undefined,
        emergencyContact: formData.emergencyContactName ? {
          name: formData.emergencyContactName,
          phone: formData.emergencyContactPhone,
          relation: formData.emergencyContactRelation,
        } : undefined,
        bankDetails: formData.bankAccountNumber ? {
          accountName: formData.bankAccountName,
          accountNumber: formData.bankAccountNumber,
          bankName: formData.bankName,
          ifscCode: formData.bankIfsc,
          upiId: formData.upiId || undefined,
        } : undefined,
        notes: formData.notes || undefined,
        availableDays: formData.availableDays,
      };

      if (isEditing && editId) {
        updateStaff(editId, staffData);
      } else {
        addStaff(staffData);
      }

      router.push('/staff');
    } catch (error) {
      console.error('Error saving staff:', error);
      alert('Failed to save staff');
    } finally {
      setIsSaving(false);
    }
  };

  const days = [
    { value: 'monday', label: 'Mon' },
    { value: 'tuesday', label: 'Tue' },
    { value: 'wednesday', label: 'Wed' },
    { value: 'thursday', label: 'Thu' },
    { value: 'friday', label: 'Fri' },
    { value: 'saturday', label: 'Sat' },
    { value: 'sunday', label: 'Sun' },
  ];

  return (
    <PageLayout currentPath="/staff">
      <div className="mx-auto max-w-3xl px-4 py-6 lg:px-8 lg:py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/staff"
            className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Staff
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center bg-indigo-100 rounded-lg">
              <UserCog className="h-5 w-5 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-900">
              {isEditing ? 'Edit Staff' : 'Add Staff Member'}
            </h1>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl border border-zinc-200 p-6">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">Basic Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Staff member's full name"
                  className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-4 w-4" />
                    Phone <span className="text-red-500">*</span>
                  </span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  placeholder="Same as phone if empty"
                  className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-4 w-4" />
                    Email
                  </span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                  className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    Address
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Full address"
                  className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                />
              </div>
            </div>
          </div>

          {/* Role & Employment */}
          <div className="bg-white rounded-xl border border-zinc-200 p-6">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Role & Employment
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as StaffRole })}
                  className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                  required
                >
                  <option value="head_chef">Head Chef</option>
                  <option value="chef">Chef</option>
                  <option value="helper">Kitchen Helper</option>
                  <option value="waiter">Waiter/Server</option>
                  <option value="bartender">Bartender</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="driver">Driver</option>
                  <option value="cleaner">Cleaner</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  Employment Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.employmentType}
                  onChange={(e) => setFormData({ ...formData, employmentType: e.target.value as EmploymentType })}
                  className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                  required
                >
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                  <option value="freelance">Freelance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as StaffStatus })}
                  className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on_leave">On Leave</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  Experience (Years)
                </label>
                <input
                  type="number"
                  value={formData.experienceYears}
                  onChange={(e) => setFormData({ ...formData, experienceYears: parseInt(e.target.value) || 0 })}
                  min="0"
                  className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Star className="h-4 w-4" />
                    Initial Rating (1-5)
                  </span>
                </label>
                <input
                  type="number"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 4 })}
                  min="1"
                  max="5"
                  step="0.1"
                  className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                />
              </div>
            </div>

            {/* Skills */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">Skills</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  placeholder="Add a skill..."
                  className="flex-1 px-4 py-2 bg-zinc-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-zinc-900"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm"
                  >
                    {skill}
                    <button type="button" onClick={() => removeSkill(skill)} className="hover:text-indigo-900">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Available Days */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-zinc-700 mb-2">Available Days</label>
              <div className="flex flex-wrap gap-2">
                {days.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDay(day.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      formData.availableDays.includes(day.value)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pay Rates */}
          <div className="bg-white rounded-xl border border-zinc-200 p-6">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Pay Rates
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  Hourly Rate (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) || 0 })}
                  min="0"
                  className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  Daily Rate (₹)
                </label>
                <input
                  type="number"
                  value={formData.dailyRate}
                  onChange={(e) => setFormData({ ...formData, dailyRate: parseFloat(e.target.value) || 0 })}
                  min="0"
                  className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                />
              </div>
            </div>

            {/* Bank Details */}
            <div className="mt-4 pt-4 border-t border-zinc-100">
              <h3 className="text-sm font-semibold text-zinc-700 mb-3">Bank Details (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">Account Name</label>
                  <input
                    type="text"
                    value={formData.bankAccountName}
                    onChange={(e) => setFormData({ ...formData, bankAccountName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">Account Number</label>
                  <input
                    type="text"
                    value={formData.bankAccountNumber}
                    onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                    className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">Bank Name</label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">IFSC Code</label>
                  <input
                    type="text"
                    value={formData.bankIfsc}
                    onChange={(e) => setFormData({ ...formData, bankIfsc: e.target.value })}
                    className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">UPI ID</label>
                  <input
                    type="text"
                    value={formData.upiId}
                    onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                    placeholder="name@upi"
                    className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white rounded-xl border border-zinc-200 p-6">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Emergency Contact
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Name</label>
                <input
                  type="text"
                  value={formData.emergencyContactName}
                  onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Relation</label>
                <input
                  type="text"
                  value={formData.emergencyContactRelation}
                  onChange={(e) => setFormData({ ...formData, emergencyContactRelation: e.target.value })}
                  placeholder="Father, Mother, Spouse..."
                  className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl border border-zinc-200 p-6">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">Additional Notes</h2>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes about this staff member..."
              rows={3}
              className="w-full px-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <Link
              href="/staff"
              className="px-6 py-2.5 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 bg-zinc-900 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-zinc-800 disabled:opacity-50"
            >
              <Save className="h-5 w-5" />
              {isSaving ? 'Saving...' : isEditing ? 'Update Staff' : 'Add Staff'}
            </button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
}

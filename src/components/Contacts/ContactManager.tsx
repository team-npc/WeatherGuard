'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  Shield, 
  MapPin,
  Heart,
  UserCheck,
  AlertTriangle
} from 'lucide-react';
import { Contact, ContactForm } from '@/types';

interface ContactManagerProps {
  userId: number;
  className?: string;
}

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contact: ContactForm) => void;
  editingContact?: Contact | null;
}

function ContactFormModal({ isOpen, onClose, onSave, editingContact }: ContactFormModalProps) {
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    phone: '',
    relationship: '',
    is_emergency_contact: false,
    can_see_location: false
  });

  useEffect(() => {
    if (editingContact) {
      setFormData({
        name: editingContact.name,
        email: editingContact.email || '',
        phone: editingContact.phone || '',
        relationship: editingContact.relationship,
        is_emergency_contact: editingContact.is_emergency_contact,
        can_see_location: editingContact.can_see_location
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        relationship: '',
        is_emergency_contact: false,
        can_see_location: false
      });
    }
  }, [editingContact, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingContact ? 'Edit Contact' : 'Add New Contact'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Relationship *
              </label>
              <input
                type="text"
                value={formData.relationship}
                onChange={(e) => setFormData(prev => ({ ...prev, relationship: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Spouse, Parent, Friend, Colleague"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_emergency_contact"
                  checked={formData.is_emergency_contact}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_emergency_contact: e.target.checked }))}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label htmlFor="is_emergency_contact" className="ml-2 block text-sm text-gray-700">
                  Emergency contact - notify during emergencies
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="can_see_location"
                  checked={formData.can_see_location}
                  onChange={(e) => setFormData(prev => ({ ...prev, can_see_location: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="can_see_location" className="ml-2 block text-sm text-gray-700">
                  Can see my location when shared
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingContact ? 'Update' : 'Add'} Contact
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ContactManager({ userId, className = '' }: ContactManagerProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [filter, setFilter] = useState<'all' | 'emergency' | 'location'>('all');

  useEffect(() => {
    loadContacts();
  }, [userId]);

  const loadContacts = async () => {
    setIsLoading(true);
    try {
      // Mock contacts for demo
      const mockContacts: Contact[] = [
        {
          id: 1,
          user_id: userId,
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          phone: '+1-555-0125',
          relationship: 'Spouse',
          is_emergency_contact: true,
          can_see_location: true,
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          user_id: userId,
          name: 'Mike Johnson',
          email: 'mike.johnson@example.com',
          phone: '+1-555-0127',
          relationship: 'Friend',
          is_emergency_contact: false,
          can_see_location: true,
          created_at: new Date().toISOString()
        },
        {
          id: 3,
          user_id: userId,
          name: 'Sarah Doe',
          email: 'sarah.doe@example.com',
          phone: '+1-555-0129',
          relationship: 'Sister',
          is_emergency_contact: true,
          can_see_location: false,
          created_at: new Date().toISOString()
        }
      ];
      setContacts(mockContacts);
    } catch (error) {
      console.error('Failed to load contacts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveContact = async (contactData: ContactForm) => {
    try {
      const newContact: Contact = {
        id: Date.now(), // Mock ID
        user_id: userId,
        ...contactData,
        created_at: new Date().toISOString()
      };

      if (editingContact) {
        setContacts(prev => prev.map(contact => 
          contact.id === editingContact.id ? { ...newContact, id: editingContact.id } : contact
        ));
      } else {
        setContacts(prev => [...prev, newContact]);
      }
      
      setEditingContact(null);
    } catch (error) {
      console.error('Failed to save contact:', error);
    }
  };

  const handleDeleteContact = async (contactId: number) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      setContacts(prev => prev.filter(contact => contact.id !== contactId));
    }
  };

  const getRelationshipIcon = (relationship: string) => {
    const rel = relationship.toLowerCase();
    if (rel.includes('spouse') || rel.includes('partner')) return <Heart className="h-4 w-4" />;
    if (rel.includes('parent') || rel.includes('mother') || rel.includes('father')) return <Users className="h-4 w-4" />;
    if (rel.includes('child') || rel.includes('son') || rel.includes('daughter')) return <Users className="h-4 w-4" />;
    if (rel.includes('friend')) return <UserCheck className="h-4 w-4" />;
    return <Users className="h-4 w-4" />;
  };

  const filteredContacts = contacts.filter(contact => {
    switch (filter) {
      case 'emergency': return contact.is_emergency_contact;
      case 'location': return contact.can_see_location;
      default: return true;
    }
  });

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Emergency Contacts</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Contact
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'all', label: 'All Contacts', count: contacts.length },
            { id: 'emergency', label: 'Emergency', count: contacts.filter(c => c.is_emergency_contact).length },
            { id: 'location', label: 'Location Sharing', count: contacts.filter(c => c.can_see_location).length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                filter === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {filteredContacts.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? 'No contacts added' : `No ${filter} contacts`}
            </h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all' 
                ? 'Add your emergency contacts and family members to stay connected during emergencies.'
                : `No contacts configured for ${filter} notifications.`
              }
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Your First Contact
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  {getRelationshipIcon(contact.relationship)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900 truncate">{contact.name}</h3>
                    <div className="flex gap-1">
                      {contact.is_emergency_contact && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                          <AlertTriangle className="h-3 w-3" />
                          Emergency
                        </span>
                      )}
                      {contact.can_see_location && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          <MapPin className="h-3 w-3" />
                          Location
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 capitalize mb-1">{contact.relationship}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {contact.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {contact.email}
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {contact.phone}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingContact(contact);
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteContact(contact.id)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ContactFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingContact(null);
        }}
        onSave={handleSaveContact}
        editingContact={editingContact}
      />
    </div>
  );
}

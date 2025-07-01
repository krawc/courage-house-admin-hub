
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ProfilesTab } from '@/components/admin/ProfilesTab';
import { EventsTab } from '@/components/admin/EventsTab';
import { ReportsTab } from '@/components/admin/ReportsTab';

const Admin = () => {
  const { user, loading, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('profiles');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <LoginForm />;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profiles':
        return <ProfilesTab />;
      case 'events':
        return <EventsTab />;
      case 'reports':
        return <ReportsTab />;
      default:
        return <ProfilesTab />;
    }
  };

  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderTabContent()}
    </AdminLayout>
  );
};

export default Admin;

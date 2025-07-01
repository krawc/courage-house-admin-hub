
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Eye, Trash2, Edit, Save, X } from 'lucide-react';

export const ProfilesTab = () => {
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [editingProfile, setEditingProfile] = useState<any>(null);
  const [profileImages, setProfileImages] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const { data: profiles, isLoading } = useQuery({
    queryKey: ['admin-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const deleteProfileMutation = useMutation({
    mutationFn: async (profileId: string) => {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profileId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
      toast({ title: 'Profile deleted successfully' });
      setSelectedProfile(null);
    },
    onError: (error) => {
      toast({
        title: 'Error deleting profile',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (profile: any) => {
      const { error } = await supabase
        .from('profiles')
        .update(profile)
        .eq('id', profile.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
      toast({ title: 'Profile updated successfully' });
      setEditingProfile(null);
    },
    onError: (error) => {
      toast({
        title: 'Error updating profile',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleViewProfile = async (profile: any) => {
    setSelectedProfile(profile);
    
    if (profile.profile_picture_urls && profile.profile_picture_urls.length > 0) {
      const signedUrls = await Promise.all(
        profile.profile_picture_urls.map(async (url: string) => {
          const urlParts = url.split('/');
          const fileName = urlParts[urlParts.length - 1];
          const bucketPath = `profile-pictures/${fileName}`;
          
          const { data } = await supabase.storage
            .from('profile-pictures')
            .createSignedUrl(bucketPath, 3600);
            return data?.signedUrl || '';
          })
      );
      setProfileImages(signedUrls.filter(Boolean));
    } else {
      setProfileImages([]);
    }
  };

  const handleEditProfile = (profile: any) => {
    setEditingProfile({ ...profile });
  };

  const handleSaveProfile = () => {
    if (editingProfile) {
      updateProfileMutation.mutate(editingProfile);
    }
  };

  const handleDeleteProfile = (profileId: string) => {
    if (confirm('Are you sure you want to delete this profile?')) {
      deleteProfileMutation.mutate(profileId);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return <div>Loading profiles...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Profiles ({profiles?.length || 0})</h2>
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {profiles?.map((profile) => (
            <div key={profile.id} className="flex items-center justify-between p-3 border rounded">
              <div>
                <div className="font-medium">
                  {profile.first_name} {profile.last_name}
                </div>
                <div className="text-sm text-gray-500">
                  {profile.display_name} • {profile.city}, {profile.state}
                </div>
                <div className="text-xs text-gray-400">
                  Created: {formatDate(profile.created_at)}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewProfile(profile)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditProfile(profile)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeleteProfile(profile.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        {selectedProfile && !editingProfile && (
          <Card>
            <CardHeader>
              <CardTitle>Profile Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <div className="text-sm">{selectedProfile.first_name || 'N/A'}</div>
                </div>
                <div>
                  <Label>Last Name</Label>
                  <div className="text-sm">{selectedProfile.last_name || 'N/A'}</div>
                </div>
                <div>
                  <Label>Display Name</Label>
                  <div className="text-sm">{selectedProfile.display_name || 'N/A'}</div>
                </div>
                <div>
                  <Label>Gender</Label>
                  <div className="text-sm">{selectedProfile.gender || 'N/A'}</div>
                </div>
                <div>
                  <Label>Age Range</Label>
                  <div className="text-sm">{selectedProfile.age_range || 'N/A'}</div>
                </div>
                <div>
                  <Label>Marital Status</Label>
                  <div className="text-sm">{selectedProfile.marital_status || 'N/A'}</div>
                </div>
                <div>
                  <Label>Has Kids</Label>
                  <div className="text-sm">{selectedProfile.has_kids || 'N/A'}</div>
                </div>
                <div>
                  <Label>Phone</Label>
                  <div className="text-sm">{selectedProfile.phone_number || 'N/A'}</div>
                </div>
                <div className="col-span-2">
                  <Label>Church Name</Label>
                  <div className="text-sm">{selectedProfile.church_name || 'N/A'}</div>
                </div>
                <div className="col-span-2">
                  <Label>Pastor Name</Label>
                  <div className="text-sm">{selectedProfile.pastor_name || 'N/A'}</div>
                </div>
                <div className="col-span-2">
                  <Label>Life Verse</Label>
                  <div className="text-sm">{selectedProfile.life_verse || 'N/A'}</div>
                </div>
              </div>
              
              {profileImages.length > 0 && (
                <div>
                  <Label>Profile Pictures</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {profileImages.map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`Profile ${index + 1}`}
                        className="w-full h-32 object-cover rounded"
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {editingProfile && (
          <Card>
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <Input
                    value={editingProfile.first_name || ''}
                    onChange={(e) =>
                      setEditingProfile({ ...editingProfile, first_name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input
                    value={editingProfile.last_name || ''}
                    onChange={(e) =>
                      setEditingProfile({ ...editingProfile, last_name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Display Name</Label>
                  <Input
                    value={editingProfile.display_name || ''}
                    onChange={(e) =>
                      setEditingProfile({ ...editingProfile, display_name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    value={editingProfile.phone_number || ''}
                    onChange={(e) =>
                      setEditingProfile({ ...editingProfile, phone_number: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>City</Label>
                  <Input
                    value={editingProfile.city || ''}
                    onChange={(e) =>
                      setEditingProfile({ ...editingProfile, city: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>State</Label>
                  <Input
                    value={editingProfile.state || ''}
                    onChange={(e) =>
                      setEditingProfile({ ...editingProfile, state: e.target.value })
                    }
                  />
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={handleSaveProfile}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditingProfile(null)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

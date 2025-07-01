
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { ExternalLink, CheckCircle, XCircle } from 'lucide-react';

export const ReportsTab = () => {
  const queryClient = useQueryClient();

  const { data: reports, isLoading } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          reported_profile:profiles!reports_reported_user_id_fkey(first_name, last_name, display_name),
          reporter_profile:profiles!reports_reporter_user_id_fkey(first_name, last_name, display_name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ reportId, status }: { reportId: string; status: string }) => {
      const { error } = await supabase
        .from('reports')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', reportId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
      toast({ title: 'Report status updated successfully' });
    },
    onError: (error) => {
      toast({
        title: 'Error updating report status',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleStatusUpdate = (reportId: string, status: string) => {
    updateStatusMutation.mutate({ reportId, status });
  };

  const handleViewProfile = (userId: string) => {
    // This could open a modal or navigate to profile view
    console.log('View profile:', userId);
    toast({
      title: 'Profile View',
      description: `Profile ID: ${userId}`,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'resolved':
        return <Badge variant="default">Resolved</Badge>;
      case 'dismissed':
        return <Badge variant="outline">Dismissed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return <div>Loading reports...</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Reports ({reports?.length || 0})</h2>
      
      <div className="space-y-4">
        {reports?.map((report) => (
          <Card key={report.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">Report #{report.id.slice(0, 8)}</CardTitle>
                  <div className="text-sm text-gray-500 mt-1">
                    {formatDate(report.created_at)}
                  </div>
                </div>
                {getStatusBadge(report.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Reported User</h4>
                    <div className="flex items-center space-x-2">
                      <span>
                        {report.reported_profile?.first_name} {report.reported_profile?.last_name}
                        {report.reported_profile?.display_name && 
                          ` (${report.reported_profile.display_name})`}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewProfile(report.reported_user_id)}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Reporter</h4>
                    <div className="flex items-center space-x-2">
                      <span>
                        {report.reporter_profile?.first_name} {report.reporter_profile?.last_name}
                        {report.reporter_profile?.display_name && 
                          ` (${report.reporter_profile.display_name})`}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewProfile(report.reporter_user_id)}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {report.reason && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Reason</h4>
                    <p className="text-sm">{report.reason}</p>
                  </div>
                )}

                {report.description && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Description</h4>
                    <p className="text-sm">{report.description}</p>
                  </div>
                )}

                {report.status === 'pending' && (
                  <div className="flex space-x-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => handleStatusUpdate(report.id, 'resolved')}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Mark Resolved
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusUpdate(report.id, 'dismissed')}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Dismiss
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {reports?.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No reports found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

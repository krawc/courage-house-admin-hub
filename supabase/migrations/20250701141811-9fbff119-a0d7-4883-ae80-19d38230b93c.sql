
-- Create reports table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reported_user_id UUID REFERENCES public.profiles(id),
  reporter_user_id UUID REFERENCES public.profiles(id),
  reason TEXT,
  description TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on reports table
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access to reports (users with @thecouragehouse.org emails)
CREATE POLICY "Admin users can view all reports" 
  ON public.reports 
  FOR SELECT 
  TO authenticated
  USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) LIKE '%@thecouragehouse.org'
  );

-- Create policy for admin users to update reports
CREATE POLICY "Admin users can update reports" 
  ON public.reports 
  FOR UPDATE 
  TO authenticated
  USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) LIKE '%@thecouragehouse.org'
  );

-- Update profiles table to allow admin updates
CREATE POLICY "Admin users can update all profiles" 
  ON public.profiles 
  FOR UPDATE 
  TO authenticated
  USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) LIKE '%@thecouragehouse.org'
  );

-- Update profiles table to allow admin to view all profiles
CREATE POLICY "Admin users can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  TO authenticated
  USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) LIKE '%@thecouragehouse.org'
  );

-- Allow admin to delete profiles
CREATE POLICY "Admin users can delete profiles" 
  ON public.profiles 
  FOR DELETE 
  TO authenticated
  USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) LIKE '%@thecouragehouse.org'
  );

-- Update events table policies for admin access
CREATE POLICY "Admin users can view all events" 
  ON public.events 
  FOR SELECT 
  TO authenticated
  USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) LIKE '%@thecouragehouse.org'
  );

CREATE POLICY "Admin users can create events" 
  ON public.events 
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    (SELECT email FROM auth.users WHERE id = auth.uid()) LIKE '%@thecouragehouse.org'
  );

CREATE POLICY "Admin users can update events" 
  ON public.events 
  FOR UPDATE 
  TO authenticated
  USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) LIKE '%@thecouragehouse.org'
  );

CREATE POLICY "Admin users can delete events" 
  ON public.events 
  FOR DELETE 
  TO authenticated
  USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) LIKE '%@thecouragehouse.org'
  );

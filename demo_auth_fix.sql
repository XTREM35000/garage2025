-- Demo Mode Authentication Fix
-- This script configures Supabase to work in demo mode without email confirmation

-- 1. Update auth.users to confirm existing unconfirmed users
UPDATE auth.users 
SET email_confirmed_at = NOW(), 
    confirmed_at = NOW()
WHERE email_confirmed_at IS NULL 
  AND confirmed_at IS NULL;

-- 2. Create a function to auto-confirm new users (demo mode only)
CREATE OR REPLACE FUNCTION public.auto_confirm_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-confirm users in demo mode
  UPDATE auth.users 
  SET email_confirmed_at = NOW(), 
      confirmed_at = NOW()
  WHERE id = NEW.id 
    AND email_confirmed_at IS NULL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create trigger to auto-confirm users on signup (demo mode)
DROP TRIGGER IF EXISTS auto_confirm_user_trigger ON auth.users;
CREATE TRIGGER auto_confirm_user_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_user();

-- 4. Ensure super_admins table exists with proper permissions
CREATE TABLE IF NOT EXISTS public.super_admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email TEXT NOT NULL UNIQUE,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  phone TEXT,
  est_actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Enable RLS on super_admins
ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;

-- 6. Create permissive policies for super_admins (demo mode)
DROP POLICY IF EXISTS "super_admins_demo_policy" ON public.super_admins;
CREATE POLICY "super_admins_demo_policy" ON public.super_admins
  FOR ALL USING (true) WITH CHECK (true);

-- 7. Grant permissions for authenticated and anon users (demo mode)
GRANT ALL ON public.super_admins TO authenticated;
GRANT ALL ON public.super_admins TO anon;

-- 8. Ensure user_organizations table exists
CREATE TABLE IF NOT EXISTS public.user_organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);

-- 9. Enable RLS on user_organizations
ALTER TABLE public.user_organizations ENABLE ROW LEVEL SECURITY;

-- 10. Create permissive policies for user_organizations (demo mode)
DROP POLICY IF EXISTS "user_organizations_demo_policy" ON public.user_organizations;
CREATE POLICY "user_organizations_demo_policy" ON public.user_organizations
  FOR ALL USING (true) WITH CHECK (true);

-- 11. Grant permissions for user_organizations
GRANT ALL ON public.user_organizations TO authenticated;
GRANT ALL ON public.user_organizations TO anon;

-- 12. Create updated_at trigger for super_admins
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS super_admins_updated_at ON public.super_admins;
CREATE TRIGGER super_admins_updated_at
  BEFORE UPDATE ON public.super_admins
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 13. Verify the setup
SELECT 'Demo mode authentication configured successfully!' as status;
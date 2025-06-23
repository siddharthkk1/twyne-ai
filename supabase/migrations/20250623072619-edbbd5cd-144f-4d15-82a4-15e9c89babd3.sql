
-- Add environment column to user_data table
ALTER TABLE public.user_data 
ADD COLUMN environment TEXT DEFAULT 'Beta 1 Demo';

-- Update existing users to have the new environment value
UPDATE public.user_data 
SET environment = 'Beta 1 Demo' 
WHERE environment IS NULL;

-- Update the handle_new_user function to set environment for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  -- Enhanced logging for the trigger execution
  RAISE LOG 'handle_new_user trigger fired for user_id: %', NEW.id;
  RAISE LOG 'raw_user_meta_data: %', NEW.raw_user_meta_data;
  RAISE LOG 'raw_app_meta_data: %', NEW.raw_app_meta_data;
  
  -- Check if this is a Google SSO signup by looking at raw_user_meta_data
  -- Google OAuth will have 'iss': 'https://accounts.google.com' in raw_user_meta_data
  IF NEW.raw_user_meta_data ? 'iss' AND NEW.raw_user_meta_data->>'iss' = 'https://accounts.google.com' THEN
    RAISE LOG 'Detected Google SSO user based on iss field';
    
    -- For Google SSO users, store basic info and mark as needing onboarding
    -- We no longer try to process onboarding data through OAuth metadata
    INSERT INTO public.user_data (user_id, profile_data, sso_data, onboarding_conversation, onboarding_mode, has_completed_onboarding, environment)
    VALUES (
      NEW.id,
      '{}'::jsonb,  -- Keep profile_data empty for SSO users initially
      jsonb_build_object(
        'email', NEW.raw_user_meta_data->>'email',
        'name', NEW.raw_user_meta_data->>'name',
        'picture', NEW.raw_user_meta_data->>'picture',
        'provider', 'google'
      ),  -- Store basic Google SSO data
      '{}'::jsonb,
      'structured',
      false,  -- Always needs to complete onboarding via redirect URL method
      'Beta 1 Demo'  -- Set environment for new Google SSO users
    );
    RAISE LOG 'Successfully created user_data record for Google SSO user';
    
  ELSIF NEW.raw_user_meta_data ? 'provider_id' THEN
    RAISE LOG 'Detected SSO user based on provider_id field, storing data in sso_data';
    -- Alternative check for other SSO providers that might have provider_id
    INSERT INTO public.user_data (user_id, profile_data, sso_data, onboarding_conversation, onboarding_mode, has_completed_onboarding, environment)
    VALUES (
      NEW.id,
      '{}'::jsonb,
      COALESCE(NEW.raw_user_meta_data, '{}'::jsonb),
      '{}'::jsonb,
      'structured',
      false,
      'Beta 1 Demo'  -- Set environment for new SSO users
    );
    RAISE LOG 'Successfully created user_data record for SSO user with provider_id';
  ELSE
    RAISE LOG 'Detected email/password user, storing data in profile_data';
    -- For email/password users, store in profile_data as before
    INSERT INTO public.user_data (user_id, profile_data, sso_data, onboarding_conversation, onboarding_mode, has_completed_onboarding, environment)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data, '{}'::jsonb),
      '{}'::jsonb,
      '{}'::jsonb,
      'structured',
      false,
      'Beta 1 Demo'  -- Set environment for new email/password users
    );
    RAISE LOG 'Successfully created user_data record for email/password user';
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user trigger: % - SQLSTATE: %', SQLERRM, SQLSTATE;
    RAISE LOG 'Error occurred for user_id: % with raw_user_meta_data: %', NEW.id, NEW.raw_user_meta_data;
    -- Don't block user creation even if our trigger fails, but log the error details
    RETURN NEW;
END;
$function$

-- Update existing users to be confirmed automatically
UPDATE auth.users 
SET email_confirmed_at = now()
WHERE email_confirmed_at IS NULL;
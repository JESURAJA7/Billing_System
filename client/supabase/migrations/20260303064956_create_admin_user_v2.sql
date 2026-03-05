/*
  # Create Admin User

  This migration creates the default admin user with the following credentials:
  - Email: admin@gmail.com
  - Password: admin@1234
  
  This user will be able to log in and manage the billing system.
*/

DO $$
DECLARE
  admin_user_id uuid;
  identity_id uuid;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@gmail.com'
  ) THEN
    admin_user_id := gen_random_uuid();
    identity_id := gen_random_uuid();

    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      role,
      aud
    ) VALUES (
      admin_user_id,
      '00000000-0000-0000-0000-000000000000',
      'admin@gmail.com',
      crypt('admin@1234', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      false,
      'authenticated',
      'authenticated'
    );

    INSERT INTO auth.identities (
      id,
      provider_id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      identity_id,
      identity_id::text,
      admin_user_id,
      jsonb_build_object('sub', admin_user_id::text, 'email', 'admin@gmail.com'),
      'email',
      now(),
      now(),
      now()
    );
  END IF;
END $$;
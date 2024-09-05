
# Simple Login with Supabase

This is a basic Node.js project for handling user login with Supabase Auth.

## Requirements
- Node.js
- Supabase project with an authentication system set up

## Setup

1. Clone the repository and navigate to the project directory.
2. Run `npm install` to install the necessary dependencies.
3. Create a `.env` file in the root directory and add your Supabase credentials:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Run the project:
   ```
   npm start
   ```

## Routes

- `POST /login` - Login with email and password. Send JSON body with:
  ```json
  {
    "email": "user@example.com",
    "password": "password"
  }
  ```

## License
MIT

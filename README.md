# Instructions to run the stack

## Installing dependencies

1. `pnpm install`

## Running backend

1. Create a `.env` file inside `app/backend` with 2 variables: `DB_CONNECTION_STRING` (the URL to the Postgres instance) and `JWT_SECRET` (the secret key to sign the JWT)
2. Run `pnpm run create_db` to initialize the database
3. Run `pnpm run start`

## Running frontend

1. Create a `.env` file inside `app/frontend` with 1 variable: `VITE_BACKEND_URL` (URL to the backend server)
2. Run `pnpm run build` and `pnpm run serve`

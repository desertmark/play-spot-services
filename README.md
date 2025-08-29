# PlaySpot Services

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Overview

PlaySpot Services is a microservices backend built with a modern and robust technology stack. This project provides a scalable and efficient architecture for applications that require high availability and performance.

This is a monorepo generated with NestJS, designed to manage multiple microservices in a single repository structure.

### Technology Stack

- **[NestJS](https://nestjs.com/)** - A progressive Node.js framework for building efficient and scalable server-side applications
- **[gRPC](https://grpc.io/)** - High-performance remote procedure call framework
- **[Prisma](https://www.prisma.io/)** - Modern ORM for TypeScript and Node.js
- **[Supabase](https://supabase.com/)** - Database-as-a-Service platform

## Getting Started

To run the project locally, follow these steps:

### Setup

1. **Install dependencies:**

```bash
npm install
```

2. **Start Supabase locally:**

```bash
npx supabase start
```

This will start the local Supabase instance with all necessary services (database, auth, etc.).

3. **Create environment file:**

Create a `.env` file in the root directory based on the `dev.env` template:

```bash
touch .env
```

and add the following content:

```bash
# COMMON
NODE_ENV="development"
DB_CONNECTION_STRING="postgresql://postgres:postgres@localhost:54322/postgres"
USERS_URL="users:50051"
# USERS
SUPABASE_URL="http://supabase_kong_play-spot-services:8000"
SUPABASE_SECRET_KEY=<your-local-supabase-secret-key>
```

Make sure to update the environment variables with your local Supabase configuration if needed.

4. **Start all services:**

```bash
docker compose up
```

This will start all microservices and the project will be ready to use.

Go to http://localhost:3000/swagger#/

## License

This project is licensed under the [MIT License](https://github.com/nestjs/nest/blob/master/LICENSE).

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-08-28

### Added

- Supabase integration for database operations
- Changelog file

## [0.0.1] - 2025-08-28

### Added

- Initial play-spot-services project setup
- NestJS microservices architecture
- Users service with gRPC
- REST API Gateway
- Docker Compose development configuration
- ESLint and Prettier configuration
- Jest testing configuration
- Common library for shared code between services
- Protobuf definition for users service
- Supabase integration

#### Infrastructure

- Docker Compose for service orchestration
- TypeScript configuration for monorepo
- Automated development and build scripts

---

## Format Guide

### Types of changes

- **Added** for new features
- **Changed** for changes in existing functionality
- **Deprecated** for soon-to-be removed features
- **Removed** for now removed features
- **Fixed** for any bug fixes
- **Security** in case of vulnerabilities

### Service structure

This project contains the following services:

- **Gateway**: Main REST API (port 3000)
- **Users**: gRPC users service (port 50052)

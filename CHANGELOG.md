# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.1] - 2025-09-24

### Fixed

- Gateway controllers not passing correctly pagination params.

## [0.4.0] - 2025-09-24

### Add

- Added reservations microservice with gRPC with basic CRUD operations

## [0.3.1] - 2025-09-15

### Changed

- Make everything camelCase to avoid mixing, due to gRPC libs automatically converting snake_case to camelCase.

## [0.3.0] - 2025-09-11

### Added

- CRUD for Units in Facilities service
- CRUD for Slots in Facilities service

## [0.2.0] - 2025-09-04

### Added

- Facilities microservice with gRPC with basic CRUD operations
- Protobuf definition for facilities service
- Refactor common gRPC code into a shared library
- Docker Compose configuration updated for the new service

## [0.1.0] - 2025-09-03

### Added

- Supabase integration for database operations
- Swagger documentation for the Gateway service
- API endpoint to get current user details in the Users service
- API endpoint to update user details in the Users service
- Grpc endpoint to get user by id details in the Users service
- Validation for both gateway and users services using class-validator
- Unit tests for new endpoints and functionalities

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

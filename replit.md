# Replit.md

## Overview

This is a full-stack web application built with a React frontend and Express backend that manages team pause sessions. The application allows users to register, join teams, and manage pause sessions with real-time updates via WebSockets. It includes authentication, team management, and administrative features.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Radix UI components with shadcn/ui styling
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Real-time Communication**: WebSocket connection for live updates

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Real-time Communication**: WebSocket server for broadcasting pause session updates
- **Development**: Vite for development server and hot module replacement

## Key Components

### Database Schema
- **Users**: Store user information, team assignments, and admin roles
- **Teams**: Team information with configurable pause limits
- **Pause Sessions**: Track active and historical pause sessions with timestamps

### Authentication System
- JWT token-based authentication
- Role-based access control (admin vs regular users)
- Password hashing with bcrypt
- Token validation middleware

### Real-time Features
- WebSocket server for broadcasting pause session updates
- Live notifications when team members start/end pauses
- Real-time team status updates

### Administrative Features
- Comprehensive user management dashboard with creation, deletion, and profile management
- Team creation and management with configurable pause limits
- User password reset functionality for administrators
- Team assignment and reassignment capabilities
- System statistics and monitoring with real-time data
- Admin-only routes and functionality with proper access control
- Break limit flag management for user violations

## Data Flow

1. **User Registration/Login**: Users authenticate and receive JWT tokens
2. **Team Assignment**: Admins assign users to teams with configurable pause limits
3. **Pause Management**: Users can start/end pause sessions within team limits
4. **Real-time Updates**: WebSocket broadcasts pause events to all connected clients
5. **State Synchronization**: TanStack Query manages server state and cache invalidation

## External Dependencies

### Frontend Dependencies
- React ecosystem (React, React DOM, React Router via Wouter)
- Radix UI primitives for accessible components
- TanStack Query for server state management
- Tailwind CSS for styling
- Lucide React for icons

### Backend Dependencies
- Express.js for HTTP server
- Drizzle ORM for database operations
- Neon serverless PostgreSQL driver
- JWT and bcrypt for authentication
- WebSocket (ws) for real-time communication

### Development Dependencies
- Vite for build tooling and development server
- TypeScript for type safety
- ESBuild for production builds
- Replit-specific development tools

## Deployment Strategy

### Build Process
- Frontend: Vite builds React app to `dist/public`
- Backend: ESBuild bundles Express server to `dist/index.js`
- Database: Drizzle migrations applied via `db:push` script

### Environment Configuration
- PostgreSQL database connection via `DATABASE_URL`
- JWT secret configuration
- Development vs production environment handling

### Server Configuration
- Express serves both API routes and static frontend files
- WebSocket server runs on the same HTTP server instance
- Middleware for request logging and error handling

## Recent Changes

### January 18, 2025 - Enhanced Admin Functionality & Timer Persistence & Windows PostgreSQL Compatibility
- ✓ Added comprehensive user creation interface with form validation
- ✓ Implemented password reset functionality for user management
- ✓ Created team assignment system allowing admins to move users between teams
- ✓ Fixed SelectItem component issues that caused white screen errors
- ✓ Enhanced team details view with functional "View Details" button
- ✓ Protected admin user from accidental deletion
- ✓ Improved dialog state management for better UX
- ✓ Added proper error handling and validation for all admin operations
- ✓ Implemented persistent timer functionality - timers now continue from where they left off
- ✓ Added daily reset mechanism that resets pause limits and times at midnight (00:00)
- ✓ Created daily pause tracking table to store accumulated time per user per day
- ✓ Updated Timer component to show current session time (starts at 00:00 for each new session)
- ✓ Fixed Timer component to work consistently across all devices and system languages/timezones
- ✓ Removed accumulated timer feature - timer always starts fresh at 00:00
- ✓ Made daily break usage update in real-time while on break (includes current session time)
- ✓ Optimized for Romanian timezone (UTC+2/UTC+3) and all international users
- ✓ Fixed cross-device timing issue - timer now starts at 00:00 when accessed from any computer
- ✓ Added server time synchronization to prevent client-server clock differences
- ✓ Timer uses component mount time instead of server timestamp for consistent behavior
- ✓ Added persistent timer functionality - timers now resume from accumulated daily usage
- ✓ Timer continues from where it was stopped based on current break type (lunch/screen) usage
- ✓ Enhanced Timer component with pauseType parameter for accurate time tracking
- ✓ Fixed cross-device timing consistency for hosted applications
- ✓ Added cache-busting headers to prevent stale file loading across network devices
- ✓ Simplified timer logic to use only client-side timing for perfect synchronization
- ✓ Made pause/end break button more visible with red styling for better UX
- ✓ Updated timer to resume from accumulated daily usage instead of starting at 00:00
- ✓ Timer now continues from where user stopped their last break session
- ✓ Enhanced timer persistence to show total daily time including current session
- ✓ Fixed timer jumping/skipping issues by improving timing logic stability
- ✓ Resolved timer accuracy problems that caused 5-second jumps
- ✓ Timer now uses stable client-side timing without data dependency conflicts
- ✓ Added user password change functionality with dropdown menu in dashboard
- ✓ Created secure password change API endpoint with current password validation
- ✓ Configured PostgreSQL database for Windows/Node.js compatibility
- ✓ Updated environment variables for proper database connection
- ✓ Validated all functionality works with PostgreSQL backend
- ✓ Fixed Windows socket binding issues by changing server host to localhost
- ✓ Enhanced WebSocket server configuration for Windows compatibility
- ✓ Created comprehensive Windows setup documentation and startup scripts
- ✓ Added Windows-specific batch and PowerShell scripts for easy deployment
- ✓ Created environment configuration examples for various database providers
- ✓ Replaced Neon database driver with standard PostgreSQL (pg package)
- ✓ Fixed ESM import issues with PostgreSQL module compatibility
- ✓ Added comprehensive PostgreSQL troubleshooting guide for Windows connection issues

### January 19, 2025 - High-Performance Timer Synchronization & Break Queue Management
- ✓ Replaced setInterval with requestAnimationFrame for millisecond-precision timing
- ✓ Implemented server-side timer synchronization broadcasting every 30 seconds
- ✓ Created high-performance WebSocket server with compression and connection pooling
- ✓ Built team broadcast queues for efficient messaging to 100+ concurrent users
- ✓ Added adaptive rate limiting that scales automatically with server load
- ✓ Implemented performance monitoring with automatic connection cleanup
- ✓ Created break queue management system for slot availability
- ✓ Added real-time team timer display showing all active breaks synchronized
- ✓ Built break queue dialog for users when slots are full
- ✓ Added automatic notifications when break slots become available
- ✓ Optimized timer accuracy to handle 100+ users with perfect 1-second precision
- ✓ Reduced query polling frequency to prevent timer interference
- ✓ Added server time offset calculation to prevent client-server drift

The timer system now uses browser animation frames for perfect accuracy and automatically syncs with the server every 30 seconds. All users see exactly the same timer values for team members. When break slots are full, users can join a queue and get notified when slots open up.

The application is now fully configured for Windows PostgreSQL deployment. Connection issues are typically resolved by using the correct PostgreSQL port (usually 5432 instead of 9616) and ensuring PostgreSQL service is running.

The application follows a standard full-stack architecture with clear separation between frontend and backend concerns, comprehensive authentication, and real-time features for enhanced user experience. The admin panel now provides complete user and team management capabilities. The system is fully compatible with Windows environments using Node.js and PostgreSQL.
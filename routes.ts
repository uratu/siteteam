import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { loginSchema, registerSchema, insertTeamSchema, startPauseSchema, adminCreateUserSchema, updateUserPasswordSchema, assignUserToTeamSchema, changePasswordSchema } from "@shared/schema";
import jwt from "jsonwebtoken";
import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || "team-pause-app-secret-key-2024";

interface AuthenticatedRequest extends Request {
  user?: { id: number; email: string; isAdmin: boolean };
}

const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await storage.getUser(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.user = { id: user.id, email: user.email, isAdmin: user.isAdmin };
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws',
    perMessageDeflate: false,
    maxPayload: 16 * 1024 * 1024 // 16MB
  });
  
  const clients = new Map<WebSocket, { userId: number; teamId: number | null }>();
  
  wss.on('connection', (ws) => {
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'authenticate') {
          const token = data.token;
          const decoded = jwt.verify(token, JWT_SECRET) as any;
          const user = await storage.getUserWithTeam(decoded.id);
          
          if (user) {
            clients.set(ws, { userId: user.id, teamId: user.teamId });
            ws.send(JSON.stringify({ type: 'authenticated', success: true }));
          }
        }
      } catch (error) {
        console.error('WebSocket error:', error);
        ws.send(JSON.stringify({ type: 'error', message: 'Authentication failed' }));
      }
    });
    
    ws.on('close', () => {
      clients.delete(ws);
    });
  });
  
  const broadcastToTeam = (teamId: number, message: any) => {
    clients.forEach((clientData, ws) => {
      if (clientData.teamId === teamId && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    });
  };
  
  const broadcastToAdmins = (message: any) => {
    clients.forEach((clientData, ws) => {
      storage.getUser(clientData.userId).then(user => {
        if (user?.isAdmin && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(message));
        }
      });
    });
  };

  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      const { confirmPassword, ...userData } = validatedData;
      
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }
      
      const user = await storage.createUser(userData);
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      
      res.json({ 
        token, 
        user: { 
          id: user.id, 
          email: user.email, 
          firstName: user.firstName, 
          lastName: user.lastName, 
          isAdmin: user.isAdmin,
          teamId: user.teamId 
        } 
      });
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      console.log('Login attempt:', { email: req.body.email, hasPassword: !!req.body.password });
      const validatedData = loginSchema.parse(req.body);
      console.log('Validation passed, attempting password check...');
      
      const user = await storage.validatePassword(validatedData.email, validatedData.password);
      console.log('Password validation result:', user ? 'SUCCESS' : 'FAILED');
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      console.log('Login successful for user:', user.email);
      
      res.json({ 
        token, 
        user: { 
          id: user.id, 
          email: user.email, 
          firstName: user.firstName, 
          lastName: user.lastName, 
          isAdmin: user.isAdmin,
          teamId: user.teamId 
        } 
      });
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error stack:', error.stack);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get('/api/auth/me', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const user = await storage.getUserWithTeam(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post('/api/auth/change-password', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const validatedData = changePasswordSchema.parse(req.body);
      
      const success = await storage.changeUserPassword(
        req.user!.id,
        validatedData.currentPassword,
        validatedData.newPassword
      );
      
      if (!success) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      
      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error('Change password error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  // Team routes
  app.get('/api/teams/my-team', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const user = await storage.getUserWithTeam(req.user!.id);
      if (!user?.teamId) {
        return res.status(404).json({ message: "No team assigned" });
      }
      
      const team = await storage.getTeamWithMembers(user.teamId);
      const activePauseSessions = await storage.getTeamActivePauseSessions(user.teamId);
      
      res.json({ ...team, activePauseSessions });
    } catch (error) {
      console.error('Get team error:', error);
      res.status(500).json({ message: "Failed to fetch team" });
    }
  });

  app.get('/api/teams/:id/pause-sessions', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const teamId = parseInt(req.params.id);
      const user = await storage.getUserWithTeam(req.user!.id);
      
      if (!user?.isAdmin && user?.teamId !== teamId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const pauseSessions = await storage.getTeamActivePauseSessions(teamId);
      res.json(pauseSessions);
    } catch (error) {
      console.error('Get pause sessions error:', error);
      res.status(500).json({ message: "Failed to fetch pause sessions" });
    }
  });

  // Pause session routes
  app.post('/api/pause/start', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const validatedData = startPauseSchema.parse(req.body);
      const user = await storage.getUserWithTeam(req.user!.id);
      if (!user?.teamId) {
        return res.status(400).json({ message: "No team assigned" });
      }
      
      // Check if user already has active pause
      const activePause = await storage.getUserActivePauseSession(user.id);
      if (activePause) {
        return res.status(400).json({ message: "Already on pause" });
      }
      
      // Note: Users can now exceed break limits, they'll be notified but not blocked
      
      // Check team pause limit
      const currentPauseCount = await storage.getActivePauseSessionsCount(user.teamId);
      const team = await storage.getTeam(user.teamId);
      
      if (currentPauseCount >= (team?.maxPauseLimit || 6)) {
        return res.status(400).json({ message: "Team pause limit reached" });
      }
      
      const pauseSession = await storage.createPauseSession({
        userId: user.id,
        teamId: user.teamId,
        pauseType: validatedData.pauseType,
        startTime: new Date(),
        isActive: true,
      });
      
      // Broadcast to team
      broadcastToTeam(user.teamId, {
        type: 'pause_started',
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
        pauseType: validatedData.pauseType,
        pauseSession,
      });
      
      res.json(pauseSession);
    } catch (error) {
      console.error('Start pause error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to start pause" });
    }
  });

  app.post('/api/pause/end', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const user = await storage.getUserWithTeam(req.user!.id);
      if (!user?.teamId) {
        return res.status(400).json({ message: "No team assigned" });
      }
      
      const pauseSession = await storage.endPauseSession(user.id);
      if (!pauseSession) {
        return res.status(400).json({ message: "No active pause session" });
      }
      
      // Check if user exceeded break limits today
      const pauseUsage = await storage.getUserPauseUsageToday(user.id);
      if (pauseUsage.lunchExceeded || pauseUsage.screenExceeded) {
        await storage.flagUserForExceededBreakLimit(user.id);
      }
      
      // Broadcast to team
      broadcastToTeam(user.teamId, {
        type: 'pause_ended',
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
        pauseSession,
        exceeded: pauseUsage.lunchExceeded || pauseUsage.screenExceeded,
      });
      
      res.json({
        ...pauseSession,
        exceeded: pauseUsage.lunchExceeded || pauseUsage.screenExceeded,
      });
    } catch (error) {
      console.error('End pause error:', error);
      res.status(500).json({ message: "Failed to end pause" });
    }
  });

  app.get('/api/pause/my-status', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const pauseSession = await storage.getUserActivePauseSession(req.user!.id);
      if (pauseSession) {
        res.json({
          ...pauseSession,
          currentAccumulatedSeconds: 0 // Always start at 0 for new sessions
        });
      } else {
        res.json(null);
      }
    } catch (error) {
      console.error('Get pause status error:', error);
      res.status(500).json({ message: "Failed to fetch pause status" });
    }
  });

  app.get('/api/pause/usage', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const pauseUsage = await storage.getUserPauseUsageToday(req.user!.id);
      res.json(pauseUsage);
    } catch (error) {
      console.error('Get pause usage error:', error);
      res.status(500).json({ message: "Failed to fetch pause usage" });
    }
  });

  app.post('/api/admin/clear-break-flag/:userId', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = parseInt(req.params.userId);
      await storage.clearUserBreakLimitFlag(userId);
      res.json({ message: "Break limit flag cleared successfully" });
    } catch (error) {
      console.error('Clear break flag error:', error);
      res.status(500).json({ message: "Failed to clear break limit flag" });
    }
  });

  // Admin routes
  app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error('Get admin stats error:', error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  app.get('/api/admin/users', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get('/api/admin/teams', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const teams = await storage.getAllTeams();
      res.json(teams);
    } catch (error) {
      console.error('Get teams error:', error);
      res.status(500).json({ message: "Failed to fetch teams" });
    }
  });

  app.post('/api/admin/teams', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const validatedData = insertTeamSchema.parse(req.body);
      const team = await storage.createTeam(validatedData);
      res.json(team);
    } catch (error) {
      console.error('Create team error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create team" });
    }
  });

  app.delete('/api/admin/users/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = parseInt(req.params.id);
      const success = await storage.deleteUser(userId);
      
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  app.post('/api/admin/users', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const validatedData = adminCreateUserSchema.parse(req.body);
      const { confirmPassword, ...userData } = validatedData;
      
      // Check if user with this email already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
      
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      console.error('Create user error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.put('/api/admin/users/:id/team', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = parseInt(req.params.id);
      const validatedData = assignUserToTeamSchema.parse(req.body);
      
      const user = await storage.updateUser(userId, { teamId: validatedData.teamId });
      res.json(user);
    } catch (error) {
      console.error('Update user team error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to update user team" });
    }
  });

  app.put('/api/admin/users/:id/password', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = parseInt(req.params.id);
      const validatedData = updateUserPasswordSchema.parse(req.body);
      
      const user = await storage.updateUser(userId, { password: validatedData.newPassword });
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error('Update user password error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to update password" });
    }
  });



  return httpServer;
}

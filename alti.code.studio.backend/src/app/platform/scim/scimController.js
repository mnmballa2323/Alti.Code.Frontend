import httpStatus from 'http-status';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import ApiError from '../../../errors/ApiError.js';
import { logger } from '../../../shared/logger.js';

const mockFilePath = path.join(process.cwd(), 'users_mock.json');

function getMockUsers() {
  try {
    if (fs.existsSync(mockFilePath)) {
      return JSON.parse(fs.readFileSync(mockFilePath, 'utf8'));
    }
  } catch (e) {
    logger.error('Error reading mock users:', e);
  }
  return [];
}

function saveMockUsers(users) {
  try {
    fs.writeFileSync(mockFilePath, JSON.stringify(users, null, 2), 'utf8');
  } catch (e) {
    logger.error('Error writing mock users:', e);
  }
}

const mapToScimUser = (user) => {
  return {
    schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
    id: user.id,
    userName: user.email,
    emails: [
      {
        value: user.email,
        primary: true,
        type: 'work',
      },
    ],
    active: user.role !== 'unauthorized',
    meta: {
      resourceType: 'User',
      created: user.createdAt,
      lastModified: user.updatedAt,
      location: `/api/v1/scim/v2/Users/${user.id}`,
    },
  };
};

const sendScimError = (res, statusCode, detail, scimType = null) => {
  const errorPayload = {
    schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
    detail,
    status: String(statusCode),
  };
  if (scimType) {
    errorPayload.scimType = scimType;
  }
  return res.status(statusCode).json(errorPayload);
};

export const getUsers = async (req, res, next) => {
  try {
    const filter = req.query.filter;
    let emailFilter = null;

    if (filter) {
      const match = filter.match(/(userName|email)\s+eq\s+["']([^"']+)["']/i);
      if (match) {
        emailFilter = match[2];
      }
    }

    let users = [];
    try {
      const whereClause = { tenantId: req.tenantId };
      if (emailFilter) {
        whereClause.email = emailFilter;
      }
      users = await req.db.user.findMany({
        where: whereClause,
      });
    } catch (dbErr) {
      logger.warn('⚠️ [Postgres Offline] SCIM getUsers falling back to mock storage');
      const mockUsers = getMockUsers();
      users = mockUsers.filter(u => u.tenantId === req.tenantId);
      if (emailFilter) {
        users = users.filter(u => u.email === emailFilter);
      }
    }

    const scimUsers = users.map(mapToScimUser);
    res.status(200).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
      totalResults: scimUsers.length,
      itemsPerPage: scimUsers.length,
      startIndex: 1,
      Resources: scimUsers,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let user = null;

    try {
      user = await req.db.user.findFirst({
        where: { id, tenantId: req.tenantId },
      });
    } catch (dbErr) {
      logger.warn('⚠️ [Postgres Offline] SCIM getUserById falling back to mock storage');
      const mockUsers = getMockUsers();
      user = mockUsers.find(u => u.id === id && u.tenantId === req.tenantId) || null;
    }

    if (!user) {
      return sendScimError(res, httpStatus.NOT_FOUND, `User with ID ${id} not found.`);
    }

    res.status(200).json(mapToScimUser(user));
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { userName, emails, active } = req.body;
    const email = emails?.[0]?.value || userName;

    if (!email) {
      return sendScimError(res, httpStatus.BAD_REQUEST, 'Email address is required in SCIM payload.', 'invalidValue');
    }

    let existingUser = null;
    try {
      existingUser = await req.db.user.findUnique({
        where: { email },
      });
    } catch (dbErr) {
      const mockUsers = getMockUsers();
      existingUser = mockUsers.find(u => u.email === email) || null;
    }

    if (existingUser) {
      return sendScimError(res, httpStatus.CONFLICT, `User with email ${email} already exists.`, 'uniqueness');
    }

    const userRole = active === false ? 'unauthorized' : 'user';
    let newUser = null;

    try {
      newUser = await req.db.user.create({
        data: {
          email,
          role: userRole,
          provider: 'scim',
          tenantId: req.tenantId,
          tenantRole: 'developer',
        },
      });
    } catch (dbErr) {
      logger.warn('⚠️ [Postgres Offline] SCIM createUser falling back to mock storage');
      const mockUsers = getMockUsers();
      const newId = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
      newUser = {
        id: newId,
        email,
        role: userRole,
        provider: 'scim',
        tenantId: req.tenantId,
        tenantRole: 'developer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockUsers.push(newUser);
      saveMockUsers(mockUsers);
    }

    res.status(201).json(mapToScimUser(newUser));
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userName, emails, active } = req.body;
    const email = emails?.[0]?.value || userName;

    if (!email) {
      return sendScimError(res, httpStatus.BAD_REQUEST, 'Email address is required in SCIM payload.', 'invalidValue');
    }

    let user = null;
    const userRole = active === false ? 'unauthorized' : 'user';

    try {
      user = await req.db.user.findFirst({
        where: { id, tenantId: req.tenantId },
      });
      if (user) {
        user = await req.db.user.update({
          where: { id },
          data: {
            email,
            role: userRole,
          },
        });
      }
    } catch (dbErr) {
      logger.warn('⚠️ [Postgres Offline] SCIM updateUser falling back to mock storage');
      const mockUsers = getMockUsers();
      const userIndex = mockUsers.findIndex(u => u.id === id && u.tenantId === req.tenantId);
      if (userIndex !== -1) {
        mockUsers[userIndex] = {
          ...mockUsers[userIndex],
          email,
          role: userRole,
          updatedAt: new Date().toISOString(),
        };
        saveMockUsers(mockUsers);
        user = mockUsers[userIndex];
      }
    }

    if (!user) {
      return sendScimError(res, httpStatus.NOT_FOUND, `User with ID ${id} not found.`);
    }

    res.status(200).json(mapToScimUser(user));
  } catch (error) {
    next(error);
  }
};

export const patchUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { Operations } = req.body;

    if (!Operations || !Array.isArray(Operations)) {
      return sendScimError(res, httpStatus.BAD_REQUEST, 'Operations array is required for PATCH.', 'invalidSyntax');
    }

    let activeValue = null;
    for (const op of Operations) {
      if (op.op?.toLowerCase() === 'replace') {
        if (op.path === 'active') {
          activeValue = op.value;
        } else if (op.value && typeof op.value === 'object' && op.value.active !== undefined) {
          activeValue = op.value.active;
        } else if (op.value !== undefined && !op.path) {
          activeValue = op.value;
        }
      }
    }

    if (activeValue === null) {
      return sendScimError(res, httpStatus.BAD_REQUEST, 'Only replacing active status is supported.', 'mutability');
    }

    const userRole = activeValue === false ? 'unauthorized' : 'user';
    let user = null;

    try {
      user = await req.db.user.findFirst({
        where: { id, tenantId: req.tenantId },
      });
      if (user) {
        user = await req.db.user.update({
          where: { id },
          data: {
            role: userRole,
          },
        });
      }
    } catch (dbErr) {
      logger.warn('⚠️ [Postgres Offline] SCIM patchUser falling back to mock storage');
      const mockUsers = getMockUsers();
      const userIndex = mockUsers.findIndex(u => u.id === id && u.tenantId === req.tenantId);
      if (userIndex !== -1) {
        mockUsers[userIndex] = {
          ...mockUsers[userIndex],
          role: userRole,
          updatedAt: new Date().toISOString(),
        };
        saveMockUsers(mockUsers);
        user = mockUsers[userIndex];
      }
    }

    if (!user) {
      return sendScimError(res, httpStatus.NOT_FOUND, `User with ID ${id} not found.`);
    }

    res.status(200).json(mapToScimUser(user));
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    let deleted = false;

    try {
      const user = await req.db.user.findFirst({
        where: { id, tenantId: req.tenantId },
      });
      if (user) {
        await req.db.user.delete({
          where: { id },
        });
        deleted = true;
      }
    } catch (dbErr) {
      logger.warn('⚠️ [Postgres Offline] SCIM deleteUser falling back to mock storage');
      const mockUsers = getMockUsers();
      const userIndex = mockUsers.findIndex(u => u.id === id && u.tenantId === req.tenantId);
      if (userIndex !== -1) {
        mockUsers.splice(userIndex, 1);
        saveMockUsers(mockUsers);
        deleted = true;
      }
    }

    if (!deleted) {
      return sendScimError(res, httpStatus.NOT_FOUND, `User with ID ${id} not found.`);
    }

    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

export const scimController = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  patchUser,
  deleteUser,
};
export default scimController;

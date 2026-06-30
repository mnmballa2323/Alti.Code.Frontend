import { prisma } from '../../shared/prisma.js';
import { logger } from '../../shared/logger.js';

/**
 * SCIM 2.0 Controller for Enterprise Provisioning (Okta, Entra ID)
 * This enables automated user provisioning and deprovisioning.
 */
export const SCIMController = {
  // GET /scim/v2/Users
  getUsers: async (req, res) => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          username: true,
          isActive: true,
        },
      });

      const scimUsers = users.map(user => ({
        schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
        id: user.id,
        userName: user.email,
        active: user.isActive,
        emails: [
          {
            primary: true,
            value: user.email,
          },
        ],
      }));

      res.status(200).json({
        schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
        totalResults: users.length,
        itemsPerPage: users.length,
        startIndex: 1,
        Resources: scimUsers,
      });
    } catch (error) {
      logger.error('SCIM getUsers error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  // POST /scim/v2/Users
  createUser: async (req, res) => {
    try {
      const { userName, active, emails } = req.body;
      const email = emails?.[0]?.value || userName;

      const newUser = await prisma.user.create({
        data: {
          email,
          username: email.split('@')[0],
          isActive: active ?? true,
        },
      });

      res.status(201).json({
        schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
        id: newUser.id,
        userName: newUser.email,
        active: newUser.isActive,
        emails: [
          {
            primary: true,
            value: newUser.email,
          },
        ],
      });
    } catch (error) {
      logger.error('SCIM createUser error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  // PATCH/PUT /scim/v2/Users/:id
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { active } = req.body;

      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          isActive: active,
        },
      });

      res.status(200).json({
        schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
        id: updatedUser.id,
        userName: updatedUser.email,
        active: updatedUser.isActive,
        emails: [
          {
            primary: true,
            value: updatedUser.email,
          },
        ],
      });
    } catch (error) {
      logger.error('SCIM updateUser error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
};

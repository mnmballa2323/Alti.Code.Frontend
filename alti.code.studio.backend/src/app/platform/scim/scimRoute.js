import express from 'express';
import scimController from './scimController.js';
import { requireScimToken } from './scimAuth.js';

const router = express.Router();

router
  .route('/v2/Users')
  .get(requireScimToken, scimController.getUsers)
  .post(requireScimToken, scimController.createUser);

router
  .route('/v2/Users/:id')
  .get(requireScimToken, scimController.getUserById)
  .put(requireScimToken, scimController.updateUser)
  .patch(requireScimToken, scimController.patchUser)
  .delete(requireScimToken, scimController.deleteUser);

export const scimRoutes = router;
export default scimRoutes;

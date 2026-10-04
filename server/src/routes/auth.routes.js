import express from 'express';

import { login, register, getMe,logout, refreshToken, createCompanyUser} from '../controllers/auth.controller.js';
import { authorizeRole, protect } from '../middlewares/auth.middleware.js';

const router= express.Router();


router.post("/register", register)

router.post("/login", login)

router.get("/me", protect, getMe)

router.post("/logout", protect, logout)

router.post("/refresh", refreshToken)

router.post('/users', protect, authorizeRole("admin"),createCompanyUser)


export default router
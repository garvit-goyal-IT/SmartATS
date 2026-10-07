import express from 'express';

import { login, register, getMe,logout, refreshToken, createCompanyUser ,listCompanyUsers} from '../controllers/auth.controller.js';
import { authorizeRole, protect } from '../middlewares/auth.middleware.js';

const router= express.Router();


router.post("/register", register)

router.post("/login", login)

router.get("/me", protect, getMe)

router.post("/logout", protect, logout)

router.post("/refresh", refreshToken)

router.post('/users', protect, authorizeRole("admin"),createCompanyUser)

router.post("/users", protect, authorizeRole("admin"), createCompanyUser)

router.get("/users", protect, authorizeRole("admin"), listCompanyUsers)


export default router
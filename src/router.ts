import { Router } from "express";
import { createUser, deleteManyUser, getAllUser, getUniqueUser } from "./controller/UserController";
import { createAccess, getAllAccesses } from "./controller/AccessController";
import { signIn } from "./controller/SessionController";
import { authMiddleware } from "./middlewares/AuthMiddleware";
import { createTransfer } from "./controller/TransferController";


export const router = Router()

router.post("/user", createUser)
router.delete("/delete-users", authMiddleware(["adm"]), deleteManyUser)
router.get("/get-all-users", authMiddleware(["adm","Professor"]), getAllUser)
router.get("/get-unique-user", authMiddleware(["adm","Professor"]), getUniqueUser)

router.post("/access", createAccess)
router.get("/accesses", authMiddleware(["adm","Professor"]), getAllAccesses)

router.post("/sig-in", signIn)

router.post("/transfer", createTransfer)
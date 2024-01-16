import { NextFunction, Request, Response } from "express";
import { verify } from 'jsonwebtoken';
import { prisma } from "../database/prisma";


//armazenar a permissão e o id do usuario no token
interface DecodedToken {
    userId: string;
  }

export function authMiddleware(permissions?: string[]){
    return async (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers.authorization;
    
        if(!authHeader || !authHeader.startsWith("Bearer ")) {
          return res.status(401).json({message: "Token não fornecido"})
        }
    
        const token = authHeader.substring(7);

        try {
            const MY_SECRET_KEY = process.env.MY_SECRET_KEY
            
            if(!MY_SECRET_KEY){
                throw new Error("Chave secreta não fornecida")
            }

            const decodedToken = verify(token, MY_SECRET_KEY) as DecodedToken

            //atribui o id do usuario ao token
            req.user = {id: decodedToken.userId}

            //se existir permissoes
            if(permissions){
                const user = await prisma.user.findUnique({
                    where:{
                        id: decodedToken.userId
                    },
                    include: {
                        Access:{
                            select:{
                                name: true
                            }
                        }
                    }
                });

                const userPermissions = user?.Access?.name ? [user.Access.name] : [];
                const hasPermission = permissions.some((p) => userPermissions.includes(p))
        
                if(!hasPermission) {
                  return res.status(403).json({message: "Permissão negada."})
                  }
            }
            return next()

        } catch (error) {
            return res.status(401).json({message: "Token inválido."})
        }
}}
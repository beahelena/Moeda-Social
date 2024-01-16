//fazer autenticação do usuario
import { Request, Response } from "express";
import { prisma } from "../database/prisma";
import { compare } from "bcryptjs";
import { sign } from 'jsonwebtoken';



export const signIn = async (req: Request, res: Response) => {
    try {
        //recebe os dados de autenticação (email e password)
        const {email, password} = req.body;

        const user = await prisma.user.findUnique({
            where: {
                email
            },
            include: {
                Access: {
                    select: {
                        name: true
                    }
                }
            }
        })
        
        if(!user){
            return res.status(400).json({message: "Usuário não encontrado."})
        }

        if (!user.Access) {
            return res.status(400).json({ message: "Acesso não encontrado para o usuário." });
        }

        const isPasswordValid = await compare(password, user.password)
        if(!isPasswordValid){
            return res.status(400).json({message: "Senha incorreta."})
        }

        const MY_SECRET_KEY = process.env.MY_SECRET_KEY
            
        if(!MY_SECRET_KEY){
            throw new Error("Chave secreta não fornecida")
        }

        const token = sign({
            userId: user.id, roles: user.Access?.name ? [user.Access.name] : []
        }, MY_SECRET_KEY, {
            algorithm: "HS256",
            expiresIn: "1h"
        })

        return res.status(200).json({token})

    } catch (error) {
        return res.status(400).json({error})
    }
}
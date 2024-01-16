import { hash } from "bcryptjs";
import { Request, Response } from "express";

import { prisma } from "../database/prisma";


//cria usuario
export const createUser = async (req: Request, res: Response) => {
    try {    const { name, email, password, accessName, balance } = req.body;

    //verifica se ja tem um email cadastrado
    const isUserUniqueEmail = await prisma.user.findUnique({
        where: {
            email
        }
    })

    const isAccessName = await prisma.access.findUnique({
        where:{
            name: accessName
        }
    })

    if(!isAccessName){
        return res.status(400).json({message: "Este nivel de acesso não existe"})
    }

    //confere se já existe um usuário com esse email
    if(isUserUniqueEmail){
        return res.status(400).json({message: "Já existe um usuário com esse email"})
    }

    const hashPassword = await hash(password, 8)

    const user = await prisma.user.create({
        data: {name,email, password: hashPassword, Access: {
            connect: {
                name: accessName
            }
        }, balance},
        //seleciona o que vai mostrar de mensagem para o usuario
        select: {
            id: true,
            email: true,
            Access:{
                select:{
                    name: true
                }
            },
            balance: true
        }
    });

    return res.status(200).json(user);
        
    } catch (error) {
        return res.status(400).json(error)
    }
}

//deleta usuarios
export const deleteManyUser = async (req: Request, res: Response) => {
    try {
        await prisma.user.deleteMany();
  
        return res.status(200).json({message: "Usuários deletados"})
    } catch (error) {
        return res.status(400).json({error})
    }
    }

//busca de todos os usuarios
  export const getAllUser = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                Access:{
                    select:{
                        name: true
                    }
                },
                balance: true
            }
        }
        )
          return res.status(200).json(users)
    } catch (error) {
        return res.status(400).json(error)
    }
  };

  export const getUniqueUser = async (req: Request, res: Response) => {
    try {
        const {id} = req.user

        const user = await prisma.user.findUnique({
            where: {
                id
            },
            select: {
                id: true,
                name: true,
                email: true,
                Access: {
                    select: {
                        name: true
                    }
                },
                balance: true
            }
        })

        if(!user) {
            return res.status(204)
        }
          return res.status(200).json(user)
    } catch (error) {
        return res.status(400).json(error)
    }
  };
import { Request, Response } from "express";
import { prisma } from "../database/prisma";


export const createTransfer = async (req: Request, res: Response) => {
  const { value, payerId, recipientId } = req.body;

  try {
    //encontrar o usuário pagador
    const payer = await prisma.user.findUnique({
        where: { id: payerId },
        include: { Access: true },
    });

    //verificar se o usuário pagador tem saldo suficiente
    if (!payer) {
      return res.status(400).json({ message: 'Usuário pagador inválido.' });
    }else if(payer.balance < value){
        return res.status(400).json({ message: 'Saldo insuficiente.' });
    }

    //criar a transferência no banco de dados
    const transfer = await prisma.transfer.create({
      data: {
        value,
        Payer: { connect: { id: payerId } },
        Recipient: { connect: { id: recipientId } },
      },
    });

    //atualizar os saldos dos usuários
    await prisma.user.update({
      where: { id: payerId },
      data: { balance: payer.balance - value },
    });

    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
    });

    if (recipient) {
      await prisma.user.update({
        where: { id: recipientId },
        data: { balance: recipient.balance + value },
      });
    } else {
      return res.status(400).json({ error: 'Usuário destinatário inválido' });
    }

    res.status(201).json(transfer);
  } catch (error) {
    console.error('Erro ao criar transferência:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
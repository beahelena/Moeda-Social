-- AlterTable
ALTER TABLE `User` ADD COLUMN `accessId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_accessId_fkey` FOREIGN KEY (`accessId`) REFERENCES `Access`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

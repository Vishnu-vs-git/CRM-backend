import { prisma } from "../config/prisma";
import { LeadController } from "../controllers/lead.controller";
import { LeadRepository } from "../repositories/implementations/lead.repository";
import { LeadService } from "../services/lead.service";

const leadRepository = new LeadRepository(prisma);

const leadService = new LeadService(leadRepository);

export const leadController = new LeadController(leadService);

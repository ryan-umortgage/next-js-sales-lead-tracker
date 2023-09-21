import { PrismaClient } from "@prisma/client";
import apiEndpointWrapper from "utils/api/apiEndpointWrapper";
import {
  calculateEstimatedCommission,
  convertAndRoundToDecimalPlaces,
  extractLeadId,
  validateLeadData,
  validateLeadExistence,
} from "utils/api/leadUtils";

// LEAD EDIT
export async function PUT(request: Request) {
  const reqBody = await request.json();

  return apiEndpointWrapper({
    method: "PUT",
    handler: async (prisma) => {
      const leadId = await extractLeadId(request);
      const { name, email, status, estimatedSaleAmount } = reqBody;

      return {
        leadId,
        updatedLead: await prisma.lead.update({
          where: { id: Number(leadId) },
          data: {
            name,
            email,
            status,
            estimatedSaleAmount:
              convertAndRoundToDecimalPlaces(estimatedSaleAmount),
            estimatedCommission: calculateEstimatedCommission(
              estimatedSaleAmount,
              status
            ),
          },
        }),
      };
    },
    validationFunction: async (prisma) => ({
      ...(await validateLeadExistence(request, prisma)),
      ...(await validateLeadData(reqBody)),
    }),
  });
}

// LEAD DELETE
export async function DELETE(request: Request) {
  return apiEndpointWrapper({
    method: "DELETE",
    handler: async (prisma: PrismaClient) => {
      const leadId = await extractLeadId(request);

      return {
        leadId,
        deletedLead: await prisma.lead.delete({
          where: { id: Number(leadId) },
        }),
      };
    },
    validationFunction: (prisma: PrismaClient) =>
      validateLeadExistence(request, prisma),
  });
}

//LEAD READ
export async function GET(request: Request) {
  return apiEndpointWrapper({
    method: "GET",
    handler: async (prisma: PrismaClient) => {
      const leadId = await extractLeadId(request);

      return {
        leadId,
        lead: await prisma.lead.findUnique({
          where: { id: Number(leadId) },
        }),
      };
    },
    validationFunction: (prisma: PrismaClient) =>
      validateLeadExistence(request, prisma),
  });
}

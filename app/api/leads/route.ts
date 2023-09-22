import apiEndpointWrapper from "utils/api/apiEndpointWrapper";
import {
  calculateEstimatedCommission,
  convertAndRoundToDecimalPlaces,
  validateLeadData,
} from "utils/api/leadUtils";

export async function GET() {
  return apiEndpointWrapper({
    method: "GET",
    handler: async (prisma) => ({ leads: await prisma.lead.findMany() }),
  });
}

export async function POST(request: Request) {
  const reqBody = await request.json();

  return apiEndpointWrapper({
    method: "POST",
    handler: async (prisma) => {
      const { name, email, status, estimatedSaleAmount } = reqBody;
      return {
        lead: await prisma.lead.create({
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
    validationFunction: async () => await validateLeadData(reqBody),
  });
}

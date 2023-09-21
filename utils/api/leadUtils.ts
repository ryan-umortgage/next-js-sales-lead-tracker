import { Lead, LeadStatus, PrismaClient } from "@prisma/client";

// Helpers
export async function extractLeadId(request: Request): Promise<number> {
  const splitUrl = request.url.split("/");
  const leadId = splitUrl[splitUrl.length - 1];
  return Number(leadId);
}

export function calculateEstimatedCommission(
  estimatedSaleAmount: number,
  status: LeadStatus
) {
  return (
    Math.round(
      (status === LeadStatus.UNQUALIFIED ? 0 : estimatedSaleAmount * 0.05) * 100
    ) / 100
  );
}

export function convertAndRoundToDecimalPlaces(
  value: string | number,
  decimalPlaces = 2
) {
  let parsedValue: number;

  if (typeof value === "string") {
    parsedValue = parseFloat(value);
    if (isNaN(parsedValue)) {
      throw new Error(`Invalid input: "${value}" is not a valid number.`);
    }
  } else if (typeof value === "number") {
    parsedValue = value;
  } else {
    throw new Error(
      `Invalid input type: Expected string or number, but received ${typeof value}.`
    );
  }

  return parseFloat(parsedValue.toFixed(decimalPlaces));
}

// Validators
interface FieldValidator<T> {
  name: string;
  value: T;
  validator: (value: T) => string | undefined;
}

export async function validateLeadExistence(
  request: Request,
  prisma: PrismaClient
) {
  try {
    const leadId = await extractLeadId(request);

    // Recreate the logic to check lead existence here
    const lead = await prisma.lead.findUnique({
      where: { id: Number(leadId) },
    });

    if (!lead) {
      return { valid: false, message: "Lead not found", errorCode: 404 };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, message: "Validation error", errorCode: 400 };
  }
}

export async function validateLeadData(reqBody: Record<string, unknown>) {
  const { name, email, status, estimatedSaleAmount } = reqBody as Lead;

  const fieldsToValidate: (
    | FieldValidator<string>
    | FieldValidator<LeadStatus>
    | FieldValidator<number>
  )[] = [
    {
      name: "name",
      value: name,
      validator: (name: string) => {
        if (!name) {
          return "Name is required.";
        }
        if (name.length > 255) {
          return "Name must be less than or equal to 255 characters.";
        }
      },
    },
    {
      name: "email",
      value: email,
      validator: (email: string) => {
        if (!email) {
          return "Email is required.";
        }
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        if (!emailRegex.test(email)) {
          return "Email must be a valid email address.";
        }
      },
    },
    {
      name: "status",
      value: status,
      validator: (status: LeadStatus) => {
        if (!status) {
          return "Status is required.";
        }
        if (
          ![
            LeadStatus.PROSPECT,
            LeadStatus.ACTIVE,
            LeadStatus.UNQUALIFIED,
          ].includes(status)
        ) {
          return "Status must be one of 'PROSPECT', 'ACTIVE', or 'UNQUALIFIED'.";
        }
      },
    },
    {
      name: "estimatedSaleAmount",
      value: estimatedSaleAmount,
      validator: (estimatedSaleAmount: number) => {
        if (estimatedSaleAmount === undefined) {
          return "Estimated Sale Amount is required.";
        }
        if (estimatedSaleAmount < 0 || estimatedSaleAmount > 1000000) {
          return "Estimated Sale Amount must be a positive value less than or equal to 1,000,000.";
        }
      },
    },
  ];

  const errors: { message: string; key: string }[] = [];

  fieldsToValidate.forEach(({ name, value, validator }) => {
    // Some type gymnastics here. The enum is messing up type inference and I
    // cant dynamically reference the validator param types because those refernce
    // value which isn't allowed. TS knows value could be a string or number but
    // cant figure out what it could be from the LeadStatus enum
    const error = validator(value as never);
    if (error) {
      errors.push({ message: error, key: name as string });
    }
  });

  if (errors.length > 0) {
    return {
      valid: false,
      message: "Validation failed.",
      errorCode: 400,
      errors,
    };
  }

  return { valid: true };
}

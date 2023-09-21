import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import { Lead, LeadStatus } from "@prisma/client";

interface ErrorDisplayProps {
  field: string;
  errors?: { key: string; message: string }[];
}

function ErrorDisplay({ field, errors }: ErrorDisplayProps) {
  return (
    <>
      {errors &&
        errors.map((error) => {
          if (error.key === field) {
            return (
              <div key={error.key} className="text-red-500">
                {error.message}
              </div>
            );
          }
          return null;
        })}
    </>
  );
}

interface LeadFormDialogProps {
  leadData?: Lead;
  onSubmit: (lead: Lead) => Promise<void>;
  onClose: () => void;
  errors?: { key: string; message: string }[];
}

export default function LeadFormDialog({
  leadData,
  onSubmit,
  onClose,
  errors,
}: LeadFormDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const [lead, setLead] = React.useState<Lead>(
    leadData ||
      ({
        name: "",
        email: "",
        status: "PROSPECT" as LeadStatus,
        estimatedSaleAmount: 0,
      } as Lead)
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLead({
      ...lead,
      [name]: value,
    });
  };

  return (
    <div>
      <Dialog
        open
        onClose={(event, reason) => {
          if (reason && reason === "backdropClick") return;
          onClose();
        }}
      >
        <DialogTitle className="text-lg font-medium">
          {leadData ? "Edit Lead" : "Create Lead"}
        </DialogTitle>
        <DialogContent className="px-4 py-2 h-[400px] w-[600px]">
          <TextField
            autoFocus
            margin="dense"
            id="name"
            name="name"
            label="Name"
            type="text"
            fullWidth
            variant="standard"
            value={lead.name}
            onChange={handleInputChange}
          />
          <ErrorDisplay field="name" errors={errors} />

          <TextField
            margin="dense"
            id="email"
            name="email"
            label="Email Address"
            type="email"
            fullWidth
            variant="standard"
            value={lead.email}
            onChange={handleInputChange}
          />
          <ErrorDisplay field="email" errors={errors} />

          <TextField
            margin="dense"
            id="status"
            name="status"
            select
            label="Status"
            fullWidth
            variant="standard"
            value={lead.status}
            onChange={handleInputChange}
          >
            <MenuItem value="PROSPECT">Prospect</MenuItem>
            <MenuItem value="ACTIVE">Active</MenuItem>
            <MenuItem value="UNQUALIFIED">Unqualified</MenuItem>
          </TextField>
          <ErrorDisplay field="status" errors={errors} />

          <TextField
            margin="dense"
            id="estimatedSaleAmount"
            name="estimatedSaleAmount"
            label="Estimated Sale Amount"
            type="number"
            fullWidth
            variant="standard"
            value={lead.estimatedSaleAmount}
            onChange={handleInputChange}
          />
          <ErrorDisplay field="estimatedSaleAmount" errors={errors} />
        </DialogContent>
        <div className="h-[60px]">
          {!isLoading && (
            <DialogActions className="px-4 py-2">
              <Button onClick={() => onClose()}>Cancel</Button>
              <Button
                onClick={async () => {
                  setIsLoading(true);
                  await onSubmit(lead);
                  setIsLoading(false);
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                {leadData ? "Save Changes" : "Create"}
              </Button>
            </DialogActions>
          )}
        </div>
      </Dialog>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Lead } from "@prisma/client";
import { useLeads } from "utils/ui/useLeads";
import { AgGridReact } from "ag-grid-react";
import {
  FaCheckCircle,
  FaEdit,
  FaExclamationCircle,
  FaQuestionCircle,
  FaTrash,
} from "react-icons/fa";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import LeadFormDialog from "@/components/LeadFormDialog";
import { Alert, Button, Icon, Snackbar } from "@mui/material";
import { ICellRendererParams, GridReadyEvent } from "ag-grid-community";

function LeadsPage() {
  const { loading, leads, createLead, deleteLead, updateLead } = useLeads();

  const [selectedLead, setSelectedLead] = useState<Lead>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showSnackBar, setShowSnackBar] = useState(false);
  const [submissionErrors, setSubmissionErrors] = useState([]);

  const columnDefs = [
    { headerName: "Name", field: "name" },
    { headerName: "Email", field: "email" },
    {
      headerName: "Status",
      field: "status",
      cellRenderer: (params: ICellRendererParams) => {
        let statusIcon;
        switch (params.data.status) {
          case "PROSPECT":
            statusIcon = (
              <Icon component={FaCheckCircle} className="text-primary mr-2" />
            );
            break;
          case "ACTIVE":
            statusIcon = (
              <Icon
                component={FaExclamationCircle}
                className="text-warning mr-2"
              />
            );
            break;
          case "UNQUALIFIED":
            statusIcon = (
              <Icon component={FaQuestionCircle} className="text-error mr-2" />
            );
            break;
          default:
            statusIcon = null;
        }

        return (
          <div className="flex items-center">
            {statusIcon}
            <div>{params.data.status}</div>
          </div>
        );
      },
    },
    { headerName: "Estimated Sale Amount", field: "estimatedSaleAmount" },
    { headerName: "Estimate Sale Comission", field: "estimatedCommission" },
    {
      headerName: "Actions",
      cellRenderer: (params: ICellRendererParams) => (
        <div className="flex space-x-2 min-h-[40px]">
          <button
            className="flex items-center justify-center text-blue-500 hover:text-blue-700"
            onClick={() => {
              setSelectedLead(params.data);
              setDialogOpen(true);
            }}
          >
            <FaEdit />
          </button>
          <button
            className="flex items-center justify-center text-red-500 hover:text-red-700"
            onClick={() => deleteLead(params.data.id)}
          >
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

  const gridOptions = {
    onGridReady: (params: GridReadyEvent) => {
      params.api.sizeColumnsToFit();
    },
  };

  if (loading) {
    return (
      <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-white opacity-80">
        <div className="text-2xl font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto  px-4">
      <div className="header flex justify-between items-center mb-4 p-2 border rounded">
        <h1 className="text-2xl">Sales Leads</h1>
        <Button
          color="primary"
          onClick={() => setDialogOpen(true)}
          className="px-4 py-2"
        >
          Create Sales Lead
        </Button>
      </div>

      <div className="ag-theme-alpine h-[1500px] w-[1500px] mx-auto">
        <AgGridReact
          columnDefs={columnDefs}
          rowData={leads}
          gridOptions={gridOptions}
        />
      </div>

      {dialogOpen && (
        <LeadFormDialog
          errors={submissionErrors}
          onSubmit={async (leadFormData: Lead) => {
            let leadPromise;

            if (selectedLead) {
              leadPromise = updateLead(leadFormData.id, leadFormData);
            } else {
              leadPromise = createLead(leadFormData);
            }

            const result = await leadPromise;

            if (result.success) {
              setDialogOpen(false);
              setSelectedLead(undefined);
              setShowSnackBar(true);
              setSubmissionErrors([]);
            } else {
              if (result.errors) {
                setSubmissionErrors(result.errors);
              }
            }
          }}
          leadData={selectedLead}
          onClose={() => {
            setDialogOpen(false);
            setSelectedLead(undefined);
            setSubmissionErrors([]);
          }}
        />
      )}

      <Snackbar
        open={!dialogOpen && showSnackBar}
        message="Note archived"
        autoHideDuration={3000}
        onClose={() => setShowSnackBar(false)}
      >
        <Alert severity="success">
          Lead {selectedLead ? "edited" : "created"} successfully
        </Alert>
      </Snackbar>
    </div>
  );
}

export default LeadsPage;

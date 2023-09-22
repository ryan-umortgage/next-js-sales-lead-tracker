import { Lead } from "@prisma/client";
import apiRequestWrapper from "./apiRequestWrapper";
import React, { useState, useEffect } from "react";

export async function createLead(
  leadData: Omit<Lead, "id" | "estimatedCommission">
) {
  return apiRequestWrapper(async () => {
    const response = await fetch("/api/leads", {
      method: "POST",
      body: JSON.stringify(leadData),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return await response.json();
  });
}

export async function deleteLead(leadId: number) {
  return apiRequestWrapper(async () => {
    const response = await fetch(`/api/leads/${leadId}`, {
      method: "DELETE",
    });
    return await response.json();
  });
}

export async function readLead(leadId: number) {
  return apiRequestWrapper(async () => {
    const response = await fetch(`/api/leads/${leadId}`, {
      method: "GET",
    });
    return await response.json();
  });
}

export async function updateLead(
  leadId: number,
  leadData: Omit<Lead, "id" | "estimatedCommission">
) {
  return apiRequestWrapper(async () => {
    const response = await fetch(`/api/leads/${leadId}`, {
      method: "PUT",
      body: JSON.stringify(leadData),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return await response.json();
  });
}

export function useLeads() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);

  const fetchData = async () => {
    setLoading(true);
    const response = await apiRequestWrapper(async () => {
      const fetchedData = await fetch("/api/leads").then((res) => res.json());
      return fetchedData;
    });

    if (response.success) {
      const sortedLeads = response.data.leads.sort(
        (leadA: Lead, leadB: Lead) => leadB.id - leadA.id
      );
      setLeads(sortedLeads);
    } else {
      setError(response.message || "Error fetching leads");
    }

    setLoading(false);
  };

  const updateLocalLeads = (updatedLeads: Lead[]) => {
    setLeads(updatedLeads);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    loading,
    error,
    leads,
    createLead: async (leadData: Omit<Lead, "id" | "estimatedCommission">) => {
      const createdLead = await createLead(leadData);
      if (createdLead.success) {
        updateLocalLeads([createdLead.data.lead, ...leads]);
      }
      return createdLead;
    },
    deleteLead: async (leadId: number) => {
      const deletedLead = await deleteLead(leadId);
      if (deletedLead.success) {
        const updatedLeads = leads.filter((lead) => lead.id !== leadId);
        updateLocalLeads(updatedLeads);
      }
      return deletedLead;
    },
    readLead,
    updateLead: async (leadId: number, leadData: Lead) => {
      const updatedLead = await updateLead(leadId, leadData);
      if (updatedLead.success) {
        const updatedLeads = leads.map((lead) =>
          lead.id === leadId
            ? { ...lead, ...updatedLead.data.updatedLead }
            : lead
        );
        updateLocalLeads(updatedLeads);
      }
      return updatedLead;
    },
  };
}

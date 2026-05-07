// src/dictionaries/en/services.en.ts
export const services = {
  title: "Services",
  subtitle: "Services offered by your assistant.",
  newBtn: "New service",
  errorLoad: "Error loading.",
  createSuccess: "Service created!",
  deleteSuccess: "Service deleted.",
  deleteError: "Error deleting.",
  confirmDelete: "Delete this service?",
  noData: "No services configured.",
  free: "Free",
  table: {
    name: "Name",
    description: "Description",
    price: "Price",
    duration: "Duration",
    status: "Status",
  },
  modal: {
    createTitle: "New Service",
    editTitle: "Edit Service",
    btnCreate: "Create",
    btnUpdate: "Update",
    fields: {
      name: "Name",
      description: "Description",
      price: "Price (XAF)",
      duration: "Duration (min)",
      isActive: "Active",
    },
  },
} as const;
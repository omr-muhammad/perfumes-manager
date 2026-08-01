export const openApiDocs = {
  info: {
    title: "Perfume Shop API",
    version: "1.0.0",
    description:
      "API for managing perfume companies, shops, inventory (alcohols, bottles, compounds), and orders.",
  },
  tags: [
    { name: "Auth", description: "Signup, login, logout" },
    { name: "My Profile", description: "The current user's own account" },
    { name: "Companies", description: "Perfume companies" },
    { name: "Perfumes", description: "Perfume catalog" },
    {
      name: "Perfume Compounds",
      description: "Global perfume compound catalog",
    },
    { name: "Shops", description: "Shops owned by a user" },
    { name: "Shop Staff", description: "Staff assigned to a shop" },
    { name: "Shop Orders", description: "Orders placed at a shop" },
    {
      name: "Inventory - Alcohols",
      description: "Alcohol stock for a shop",
    },
    {
      name: "Inventory - Bottles",
      description: "Bottle stock for a shop",
    },
    {
      name: "Inventory - Shop Compounds",
      description: "Compound stock and agings for a shop",
    },
    {
      name: "Admin - Companies",
      description: "Admin management of companies",
    },
    {
      name: "Admin - Compounds",
      description: "Admin management of the perfume compound catalog",
    },
    {
      name: "Admin - Perfumes",
      description: "Admin management of the perfume catalog",
    },
    { name: "Admin - Shops", description: "Admin management of shops" },
    { name: "Admin - Users", description: "Admin management of users" },
  ],
};

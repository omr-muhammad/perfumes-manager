import i18n from ".";

export const loadNs =
  (...namespaces: string[]) =>
  async () => {
    await i18n.loadNamespaces(namespaces);
    return null;
  };

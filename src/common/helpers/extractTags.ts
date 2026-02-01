export const extractTags = (content: string): string[] => {
  if (!content) return [];

  const regex = /#([a-zA-Z0-9_ñÑáéíóúÁÉÍÓÚ]+)/g;
  const matches = content.match(regex);

  if (!matches) return [];

  const uniqueTags = new Set(matches.map((tag) => tag.slice(1).toLowerCase()));

  return Array.from(uniqueTags);
};

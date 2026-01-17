export const getPublicId = (fullUrl: string) => {
  const parts = fullUrl.split('/');

  // 1. Obtenemos la carpeta (penúltima parte)
  const folder = parts[parts.length - 2];

  // 2. Obtenemos el archivo CON extensión (última parte)
  const fileWithExtension = parts[parts.length - 1]; // "ctdq2sdns8qdowppkmir.jpg"

  // 3. Le quitamos la extensión (.jpg)
  const fileName = fileWithExtension.split('.')[0]; // "ctdq2sdns8qdowppkmir"

  // 4. Unimos todo
  return `${folder}/${fileName}`;
};

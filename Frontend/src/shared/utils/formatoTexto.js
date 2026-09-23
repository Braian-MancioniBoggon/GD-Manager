const PALABRAS_ESPECIALES =
  new Set([
    "A4",
    "A3",
    "A2",
    "A1",
    "A0",
    "PVC",
    "PET",
    "OPP",
    "CMYK",
    "RGB",
    "UV",
    "CF",
    "CB",
    "CFB",
  ]);

export const titulo = (texto) => {
  if (!texto) return "";

  return texto
    .split(" ")
    .map((palabra) => {
      const palabraMayus =
        palabra.toUpperCase();

      if (
        PALABRAS_ESPECIALES.has(
          palabraMayus
        )
      ) {
        return palabraMayus;
      }

      return (
        palabra.charAt(0).toUpperCase() +
        palabra.slice(1).toLowerCase()
      );
    })
    .join(" ");
};

export const nombrePermiso = (texto) => {

  if (!texto) return "";

  const textoNormalizado =
    texto
      .replaceAll("_", " ")
      .toLowerCase();

  return (
    textoNormalizado.charAt(0).toUpperCase() +
    textoNormalizado.slice(1)
  );

};
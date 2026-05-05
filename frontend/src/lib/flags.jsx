import React from 'react';

const ISO = {
  // CONCACAF
  'México': 'mx', 'Estados Unidos': 'us', 'Canadá': 'ca',
  'Costa Rica': 'cr', 'Jamaica': 'jm', 'Panamá': 'pa',
  'Honduras': 'hn', 'El Salvador': 'sv', 'Curazao': 'cw', 'Haití': 'ht',
  // CONMEBOL
  'Argentina': 'ar', 'Brasil': 'br', 'Uruguay': 'uy',
  'Colombia': 'co', 'Chile': 'cl', 'Perú': 'pe',
  'Ecuador': 'ec', 'Venezuela': 've', 'Paraguay': 'py', 'Bolivia': 'bo',
  // UEFA
  'España': 'es', 'Francia': 'fr', 'Alemania': 'de', 'Italia': 'it',
  'Inglaterra': 'gb', 'Escocia': 'gb-sct', 'Gales': 'gb-wls',
  'Portugal': 'pt', 'Países Bajos': 'nl', 'Holanda': 'nl', 'Bélgica': 'be',
  'Croacia': 'hr', 'Serbia': 'rs', 'Dinamarca': 'dk',
  'Turquía': 'tr', 'Ucrania': 'ua', 'Austria': 'at', 'Suiza': 'ch',
  'Chequia': 'cz', 'República Checa': 'cz', 'Hungría': 'hu',
  'Bosnia y Herzegovina': 'ba', 'Suecia': 'se', 'Noruega': 'no',
  'Albania': 'al', 'Georgia': 'ge',
  // AFC
  'Japón': 'jp', 'Corea del Sur': 'kr',
  'Arabia Saudita': 'sa', 'Irán': 'ir', 'Irak': 'iq', 'Jordania': 'jo',
  'Qatar': 'qa', 'Uzbekistán': 'uz',
  // OFC
  'Australia': 'au', 'Nueva Zelanda': 'nz',
  // CAF
  'Marruecos': 'ma', 'Senegal': 'sn', 'Nigeria': 'ng',
  'Camerún': 'cm', 'Ghana': 'gh', 'Argelia': 'dz', 'Túnez': 'tn',
  'Sudáfrica': 'za', 'Egipto': 'eg', 'Congo': 'cd', 'Cabo Verde': 'cv',
  'Costa de Marfil': 'ci', 'Kazajistán': 'kz',
};

export function FlagImg({ country, size = 20 }) {
  const code = ISO[country];
  if (!code) return null;
  const w = Math.round(size * 1.5);
  return (
    <img
      src={`https://flagcdn.com/w40/${code}.png`}
      srcSet={`https://flagcdn.com/w80/${code}.png 2x`}
      width={w}
      height={size}
      alt={country}
      style={{
        borderRadius: 2,
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
        objectFit: 'cover',
      }}
    />
  );
}

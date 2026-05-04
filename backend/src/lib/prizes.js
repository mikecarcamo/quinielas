/**
 * Calcula la distribución de premios dado el ranking de participantes.
 *
 * Pozo total = totalUsuarios * precioEntrada
 * Distribución base: 1er=70%, 2do=20%, 3er=10%
 *
 * Reglas de empate:
 *  - 2 empatan 1ro  -> cada uno recibe (70%+20%)/2
 *  - >2 empatan 1ro -> cada uno recibe 100%/n
 *  - 2 empatan 2do  -> cada uno recibe (20%+10%)/2
 *  - >2 empatan 2do -> cada uno recibe 30%/n
 *  - n empatan 3ro  -> cada uno recibe 10%/n
 *
 * @param {Array<{user_id:number, nombre_completo:string, total_puntos:number}>} ranking
 * @param {number} totalUsuarios  número de participantes con pago aprobado
 * @param {number} precioEntrada  monto por participante (default 100)
 * @returns {Array<{user_id,nombre_completo,total_puntos,posicion,premio}>}
 */
function calculatePrizes(ranking, totalUsuarios, precioEntrada = 100) {
  const pozo = totalUsuarios * precioEntrada;
  const result = ranking.map((u) => ({ ...u, posicion: null, premio: 0 }));

  if (result.length === 0) return result;

  const sorted = [...result].sort((a, b) => b.total_puntos - a.total_puntos);

  let i = 0;
  let posicion = 1;

  while (i < sorted.length) {
    const currentPts = sorted[i].total_puntos;
    let j = i;
    while (j < sorted.length && sorted[j].total_puntos === currentPts) j++;
    const count = j - i;

    let premio = 0;

    if (posicion === 1) {
      if (count === 1) {
        premio = pozo * 0.70;
      } else if (count === 2) {
        premio = (pozo * 0.70 + pozo * 0.20) / 2;
      } else {
        premio = pozo / count;
      }
    } else if (posicion === 2) {
      if (count === 1) {
        premio = pozo * 0.20;
      } else {
        premio = (pozo * 0.20 + pozo * 0.10) / count;
      }
    } else if (posicion === 3) {
      premio = (pozo * 0.10) / count;
    }

    for (let k = i; k < j; k++) {
      sorted[k].posicion = posicion;
      sorted[k].premio = Math.round(premio * 100) / 100;
    }

    posicion += count;
    i = j;
  }

  return sorted;
}

module.exports = { calculatePrizes };

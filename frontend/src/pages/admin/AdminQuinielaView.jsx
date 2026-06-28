import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, CircularProgress, Alert, Chip, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Accordion, AccordionSummary, AccordionDetails, Button, LinearProgress, Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import api from '../../api/axios';
import { FlagImg } from '../../lib/flags.jsx';
import { formatDate, formatDateTime } from '../../lib/dates';
import { useEvent } from '../../context/EventContext';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

function calcPoints(p) {
  const gl = p.goles_local_pred, gv = p.goles_visitante_pred;
  const rl = p.goles_local_real, rv = p.goles_visitante_real;
  if (rl === null || rl === undefined || rv === null || rv === undefined) return null;
  let pts = 0;
  if (gl === rl) pts += 5;
  if (gv === rv) pts += 5;
  if (Math.sign(gl - gv) === Math.sign(rl - rv)) pts += 2;
  return pts;
}

function PointsChip({ p }) {
  if (p.match_status === 'pendiente') return <Chip label="Pendiente" size="small" variant="outlined" />;
  const pts = calcPoints(p);
  if (p.match_status === 'en_curso') {
    return <Chip label={pts > 0 ? `🔴 +${pts} pts` : '🔴 En curso'} size="small" color="warning" />;
  }
  const color = pts === 12 ? 'success' : pts >= 7 ? 'warning' : pts > 0 ? 'default' : 'error';
  return <Chip label={`+${pts} pts`} size="small" color={color} />;
}

export default function AdminQuinielaView() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { selectedEventId, selectedEvent } = useEvent();
  const [preds, setPreds] = useState([]);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!selectedEventId) return;
    Promise.all([
      api.get(`/predictions/user/${userId}/${selectedEventId}`),
      api.get('/auth/users'),
    ]).then(([predRes, usersRes]) => {
      setPreds(predRes.data);
      const u = usersRes.data.find((x) => x.id === Number(userId));
      setUserName(u ? u.nombre_completo : `Usuario #${userId}`);
    }).catch(() => setError('No se pudo cargar la quiniela'))
      .finally(() => setLoading(false));
  }, [userId, selectedEventId]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;

  const groups = [...new Set(preds.map((p) => p.grupo))].sort();
  const totalPts = preds.reduce((s, p) => {
    if (p.match_status !== 'finalizado' && p.match_status !== 'en_curso') return s;
    return s + (calcPoints(p) ?? 0);
  }, 0);
  const played = preds.filter((p) => p.match_status === 'finalizado').length;
  const enCursoCount = preds.filter((p) => p.match_status === 'en_curso').length;

  const exportPDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const now = formatDateTime(new Date(), { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const pageW = doc.internal.pageSize.getWidth();

    // Encabezado
    doc.setFillColor(18, 18, 18);
    doc.rect(0, 0, pageW, 28, 'F');
    doc.setTextColor(212, 160, 23);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('QUINIELA MUNDIAL 2026', pageW / 2, 11, { align: 'center' });
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.text(`Participante: ${userName}`, pageW / 2, 19, { align: 'center' });
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    doc.text(`Generado: ${now}`, pageW / 2, 25, { align: 'center' });

    // Resumen
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Pronósticos: ${preds.length} / 72   |   Jugados: ${played}   |   Puntos acumulados: ${totalPts}`, 14, 34);

    let y = 38;

    groups.forEach((grupo) => {
      const gPreds = preds.filter((p) => p.grupo === grupo).sort((a, b) => a.fecha.localeCompare(b.fecha));
      const gPts = gPreds.filter((p) => p.match_status === 'finalizado').reduce((s, p) => s + (calcPoints(p) ?? 0), 0);

      // Título de grupo
      doc.setFillColor(240, 240, 240);
      doc.rect(14, y, pageW - 28, 6, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 30, 30);
      doc.text(`Grupo ${grupo}   (${gPts} pts)`, 16, y + 4);
      y += 7;

      autoTable(doc, {
        startY: y,
        margin: { left: 14, right: 14 },
        styles: { fontSize: 8, cellPadding: 1.5 },
        headStyles: { fillColor: [50, 50, 50], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 248, 248] },
        head: [['Partido', 'Fecha', 'Pronóstico', 'Real', 'Pts']],
        body: gPreds.map((p) => {
          const pts = calcPoints(p);
          const pronostico = `${p.goles_local_pred} - ${p.goles_visitante_pred}`;
          const real = p.match_status === 'finalizado' ? `${p.goles_local_real} - ${p.goles_visitante_real}` : '—';
          const ptsStr = p.match_status === 'finalizado' ? (pts !== null ? `+${pts}` : '—') : 'Pend.';
          return [
            `${p.local} vs ${p.visitante}`,
            formatDate(p.fecha, { day: '2-digit', month: 'short' }),
            pronostico,
            real,
            ptsStr,
          ];
        }),
        columnStyles: {
          0: { cellWidth: 70 },
          1: { cellWidth: 22, halign: 'center' },
          2: { cellWidth: 25, halign: 'center' },
          3: { cellWidth: 25, halign: 'center' },
          4: { cellWidth: 18, halign: 'center' },
        },
        didDrawCell: (data) => {
          if (data.section === 'body' && data.column.index === 4) {
            const val = data.cell.raw;
            if (val && val.startsWith('+')) {
              const pts = parseInt(val.slice(1));
              if (pts >= 12) doc.setTextColor(76, 175, 80);
              else if (pts >= 7) doc.setTextColor(255, 152, 0);
              else if (pts > 0) doc.setTextColor(33, 150, 243);
              else doc.setTextColor(244, 67, 54);
            }
          }
        },
      });

      y = doc.lastAutoTable.finalY + 4;
    });

    // Pie de página
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text(`Página ${i} de ${totalPages}  |  Quiniela de ${userName}  |  ${now}`, pageW / 2, doc.internal.pageSize.getHeight() - 5, { align: 'center' });
    }

    doc.save(`quiniela_${userName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin/usuarios')} sx={{ mb: 2 }}>
        Volver a Usuarios
      </Button>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, flexWrap: 'wrap' }}>
        <Typography variant="h5" fontWeight={700}>Quiniela de {userName}</Typography>
        <Chip label={`${preds.length} / 72 pronósticos`} color={preds.length === 72 ? 'success' : 'warning'} />
        {(played > 0 || enCursoCount > 0) && (
          <Chip label={`${totalPts} pts acumulados${enCursoCount > 0 ? ' (en curso)' : ''}`} color={enCursoCount > 0 ? 'warning' : 'primary'} variant="outlined" />
        )}
        <Box sx={{ ml: 'auto' }}>
          <Button
            variant="outlined" size="small" startIcon={<PictureAsPdfIcon />}
            onClick={exportPDF}
          >
            Exportar PDF
          </Button>
        </Box>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {selectedEvent?.nombre?.includes('Dieciseisavos') ? 'Mundial 2026 — Fase de Dieciseisavos · Solo lectura' : 'Mundial 2026 — Fase de Grupos · Solo lectura'}
      </Typography>

      {preds.length === 0 ? (
        <Alert severity="info">Este usuario aún no ha ingresado su quiniela.</Alert>
      ) : (
        groups.map((grupo) => {
          const gPreds = preds.filter((p) => p.grupo === grupo);
          const finalizados = gPreds.filter((p) => p.match_status === 'finalizado');
          const enCursoGrupo = gPreds.filter((p) => p.match_status === 'en_curso');
          const gpPts = [...finalizados, ...enCursoGrupo].reduce((s, p) => s + (calcPoints(p) ?? 0), 0);

          return (
            <Accordion key={grupo} defaultExpanded disableGutters
              sx={{ mb: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: '10px !important', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, mr: 1, flexWrap: 'wrap' }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ minWidth: 80 }}>
                    Grupo {grupo}
                  </Typography>
                  {(finalizados.length > 0 || enCursoGrupo.length > 0) && (
                    <Chip label={`${gpPts} pts`} size="small" color={enCursoGrupo.length > 0 ? 'warning' : 'primary'} variant="outlined" />
                  )}
                  <Chip
                    label={`${finalizados.length}/${gPreds.length} jugados`}
                    size="small"
                    color={finalizados.length === gPreds.length ? 'success' : enCursoGrupo.length > 0 ? 'warning' : 'default'}
                  />
                </Box>
              </AccordionSummary>

              <AccordionDetails sx={{ px: 1, pt: 0 }}>
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'background.default' }}>
                        <TableCell>Partido</TableCell>
                        <TableCell align="center">Fecha</TableCell>
                        <TableCell align="center">Pronóstico</TableCell>
                        <TableCell align="center">Resultado Real</TableCell>
                        <TableCell align="center">Puntos</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {gPreds.map((p) => {
                        const finalizado = p.match_status === 'finalizado';
                        const enCurso = p.match_status === 'en_curso';
                        return (
                          <TableRow key={p.id} hover
                            sx={{ bgcolor: finalizado && calcPoints(p) === 12 ? 'rgba(76,175,80,0.06)' : enCurso ? 'rgba(255,152,0,0.05)' : 'inherit' }}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                                <FlagImg country={p.local} size={16} />
                                <Typography variant="body2" fontWeight={600}>{p.local}</Typography>
                                <Typography variant="caption" color="text.secondary">vs</Typography>
                                <FlagImg country={p.visitante} size={16} />
                                <Typography variant="body2" fontWeight={600}>{p.visitante}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(p.fecha, { day: '2-digit', month: 'short' })}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="body1" fontWeight={700} color="primary.light">
                                {p.goles_local_pred} – {p.goles_visitante_pred}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              {(finalizado || enCurso) ? (
                                <Typography variant="body1" fontWeight={700} sx={{ color: enCurso ? 'warning.main' : 'inherit' }}>
                                  {p.goles_local_real} – {p.goles_visitante_real}
                                </Typography>
                              ) : (
                                <Typography variant="caption" color="text.secondary">—</Typography>
                              )}
                            </TableCell>
                            <TableCell align="center">
                              <PointsChip p={p} />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          );
        })
      )}
    </Box>
  );
}

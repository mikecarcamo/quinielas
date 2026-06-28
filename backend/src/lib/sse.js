const clients = new Set();

function addClient(res) {
  clients.add(res);
  res.on('close', () => clients.delete(res));
}

function broadcast(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of clients) {
    try {
      res.write(payload);
    } catch (e) {
      clients.delete(res);
    }
  }
}

function notifyScoreUpdate(match) {
  broadcast('score_update', {
    match_id: match.id,
    local: match.local,
    visitante: match.visitante,
    goles_local_real: match.goles_local_real,
    goles_visitante_real: match.goles_visitante_real,
    status: match.status,
    event_id: match.event_id,
  });
}

module.exports = { addClient, broadcast, notifyScoreUpdate };

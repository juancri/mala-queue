
(async function()
{
  // Constantes
  const JC_EVENTO = 'biz175';
  const JC_NUM_FECHA = 1;
  const JC_VERSION = 1;

  // Obtener ubicaciones disponibles
  const response1 = await fetch("/Compra/TraerTipoTicketsSectores", {
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ eventoID: JC_EVENTO, eventoCalendarioID: JC_NUM_FECHA }),
    method: "POST",
    credentials: "include"
  });
  const body1 = JSON.parse(await response1.text());
  const available = body1.TipoTickets.filter(x => x.Disponible === 1);

  // Notificar disponibles
  if (!available.length) {
    alert('No quedan tickets disponibles');
    return;
  }
  alert(`Hay ${available.length} secciones disponibles`);

  // Seleccionar ubicacion
  let i = 0;
  while (i < available.length) {
    const seccion = available[i];
    if (confirm(`Opción ${i + 1} de ${available.length} ¿Deseas comprar para la sección ${seccion.TipoTicket} por ${seccion.Precio}?`))
      break;
    i++;
  }

  // Verificar
  if (i >= available.length) {
    alert('No hay más secciones disponibles');
    return;
  }

  // Obtener tipo
  const jcTipoTicket = available[i].TipoTicketID;

  // Confirmar cantidad
  const jcCantidadTickets = confirm('¿Quieres dos entradas?') ? 2 : 1;

  // Agregar al carrito
  const response2 = await fetch("/Compra/AgregarMultipleTickets", {
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ EventoID: JC_EVENTO, EventoCalendarioID: JC_NUM_FECHA, CategoriaTicketID: "1", Tickets: [{ TipoTicketID: jcTipoTicket, Cantidad: jcCantidadTickets }] }),
    method: "POST",
    credentials: "include"
  });
  const body2 = JSON.parse(await response2.text());
  if (!body2.Success)
  {
    alert('Error: ' + body2.ErrorList.join(', '));
    return;
  }

  alert ('Se agregaron las entradas al carro de compras. Redirigiendo al pago.');
  window.location.href = '/Compra/Pago';
})();

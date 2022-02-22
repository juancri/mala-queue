
(async function()
{
  try
  {
    // Constantes
    const EVENTO = 'biz175';
    const NUM_FECHA = 2;
    const VERSION = 1;
    const TIPO_TICKET_ID_MIN = 10;
    const TIPO_TICKET_ID_MAX = 12;
    const BASE_FETCH_PARAMS = {
      headers: { "content-type": "application/json" },
      method: "POST",
      credentials: "include"
    };

    // Funciones UI
    const mostrarMensaje = async (mensaje) =>
    {
      // FIXME: Cambiar
      alert(mensaje);
    };
    const seleccionar = async (titulo, opciones, generarTexto) =>
    {
      // FIXME: Implementar correctamente
      for (const opcion of opciones)
      {
        const texto = generarTexto(opcion);
        if (confirm(`${titulo}: ${texto}`))
          return opcion;
      }

      return undefined;
    };

    // Iniciar
    await mostrarMensaje('Iniciando Mala Queue v' + VERSION);

    // Obtener ubicaciones disponibles
    const response1 = await fetch("/Compra/TraerTipoTicketsSectores", {
      ...BASE_FETCH_PARAMS,
      body: JSON.stringify({ eventoID: EVENTO, eventoCalendarioID: NUM_FECHA })
    });
    if (response1.url.includes('Account/SignIn'))
    {
      console.log(response1);
      mostrarMensaje('Inicia sesión antes de empezar');
      window.location.href = 'https://www.puntoticket.com/Account/SignIn';
      return;
    }
    const body1 = JSON.parse(await response1.text());
    const available = body1.TipoTickets
      .filter(x => x.Disponible === 1)
      .filter(x => x.TipoTicketID >= TIPO_TICKET_ID_MIN)
      .filter(x => x.TipoTicketID <= TIPO_TICKET_ID_MAX);

    // Notificar disponibles
    if (!available.length) {
      await mostrarMensaje('No quedan tickets disponibles');
      return;
    }
    await mostrarMensaje(`Hay ${available.length} secciones disponibles`);

    // Seleccionar ubicacion
    const selected = await seleccionar(
      'Sección',
      available,
      seccion => `${seccion.TipoTicket} (${seccion.Precio})`);

    // Verificar
    if (selected === undefined) {
      await mostrarMensaje('No hay más secciones disponibles');
      return;
    }

    // Obtener tipo
    const jcTipoTicket = selected.TipoTicketID;

    // Confirmar cantidad
    const jcCantidadTickets = await seleccionar('Cantidad de entradas', [1, 2], x => x.toString());
    if (jcCantidadTickets === undefined)
    {
      await mostrarMensaje('No se ha seleecionado la cantidad de entradas');
      return;
    }

    // Agregar al carrito
    const response2 = await fetch("/Compra/AgregarMultipleTickets", {
      ...BASE_FETCH_PARAMS,
      body: JSON.stringify({ EventoID: EVENTO, EventoCalendarioID: NUM_FECHA, CategoriaTicketID: "1", Tickets: [{ TipoTicketID: jcTipoTicket, Cantidad: jcCantidadTickets }] })
    });
    const body2 = JSON.parse(await response2.text());
    if (!body2.Success)
    {
      await mostrarMensaje('Error: ' + body2.ErrorList.join(', '));
      return;
    }

    // Redirigir
    await mostrarMensaje('Se agregaron las entradas al carro de compras. Redirigiendo al pago.');
    window.location.href = '/Compra/Pago';
  } catch (e) {
    alert('Ocurrió un error: ' + e.message);
  }
})();

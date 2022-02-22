
(async function()
{
  try
  {
    // Constantes
    const VERSION = 4;
    const EVENTO = 'biz175';
    const NUM_FECHA = 2;
    const TIPO_TICKET_ID_MIN = 10;
    const TIPO_TICKET_ID_MAX = 12;
    const BASE_FETCH_PARAMS = {
      headers: { "content-type": "application/json" },
      method: "POST",
      credentials: "include"
    };

    // Funciones UI
    const crearDiv = (contenido) =>
    {
      const div = document.createElement('div');
      div.style = 'position: absolute; z-index: 1000; left: 20px; top: 20px; right: 20px; bottom: 20px; background: blue; color: white; text-align:center; padding: 20px';
      const container = document.createElement('div');
      container.appendChild(contenido);
      const button = document.createElement('button');
      button.style = 'background: black; color: white;';
      button.innerText = "OK";
      div.appendChild(container);
      div.appendChild(button);
      document.body.appendChild(div);
      return new Promise(resolve => {
        button.onclick = () => {
          document.body.removeChild(div);
          resolve();
        };
      });
    };
    const mostrarMensaje = (mensaje) =>
    {
      const span = document.createElement('span');
      span.innerText = mensaje;
      return crearDiv(span);
    };
    const seleccionar = async (titulo, opciones, generarValue, generarTexto) =>
    {
      const main = document.createElement('div');
      const divTitulo = document.createElement('div');
      divTitulo.innerText = titulo;
      const select = document.createElement('select');
      select.style = 'background: black; color: white';
      for (const opcion of opciones)
      {
        const optionElement = document.createElement('option');
        optionElement.style = 'background: black; color: white';
        optionElement.innerText = generarTexto(opcion);
        optionElement.setAttribute('value', generarValue(opcion));
        select.appendChild(optionElement);
      }
      main.appendChild(divTitulo);
      main.appendChild(select);
      await crearDiv(main);
      return select.value;
    };

    // Eliminar todo
    document.body.innerHTML = '';

    // Iniciar
    await mostrarMensaje('Iniciando Mala Queue versión ' + VERSION);

    // Obtener ubicaciones disponibles
    const response1 = await fetch("/Compra/TraerTipoTicketsSectores", {
      ...BASE_FETCH_PARAMS,
      body: JSON.stringify({ eventoID: EVENTO, eventoCalendarioID: NUM_FECHA })
    });
    if (response1.url.includes('Account/SignIn'))
    {
      await mostrarMensaje('Inicia sesión e intenta nuevamente');
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
      await mostrarMensaje('No quedan tickets no numerados disponibles');
      return;
    }
    await mostrarMensaje(`Hay ${available.length} secciones con tickets no numerados disponibles`);

    // Seleccionar ubicacion
    const jcTipoTicket = await seleccionar(
      'Sección',
      available,
      seccion => seccion.TipoTicketID,
      seccion => `${seccion.TipoTicket} (${seccion.Precio})`);

    // Confirmar cantidad
    const jcCantidadTickets = await seleccionar(
      'Cantidad de entradas', [1, 2],
      x => x.toString(),
      x => x.toString());
    console.log({ jcTipoTicket, jcCantidadTickets });

    // Agregar al carrito
    const response2 = await fetch("/Compra/AgregarMultipleTickets", {
      ...BASE_FETCH_PARAMS,
      body: JSON.stringify({
        EventoID: EVENTO,
        EventoCalendarioID: NUM_FECHA,
        CategoriaTicketID: "1",
        Tickets: [{
          TipoTicketID: jcTipoTicket,
          Cantidad: jcCantidadTickets
        }] })
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

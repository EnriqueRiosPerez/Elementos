document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');

    var calendar = new FullCalendar.Calendar(calendarEl, {
        events: [
            {
                title: 'Evento Cerrado',
                start: '2025-04-30',
                extendedProps: {
                    Status: 'close'
                }
            }
        ],
        eventDidMount: function(info) {
            if (info.event.extendedProps.Status === 'close') {
                info.el.style.backgroundColor = 'red'; // Cambia 'red' por el color que desees
            }
        }
    });

    calendar.render();
});





document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');

    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        events: [
            {
                title: 'Evento Cerrado',
                start: '2025-04-30',
                extendedProps: {
                    Status: 'close'
                }
                
            }
        ],
        dayCellDidMount: function(info) {
            // Verifica si hay eventos en el día y si el estatus es 'close'
            var events = info.view.calendar.getEvents();
            events.forEach(function(event) {
                if (event.startStr === info.dateStr && event.extendedProps.Status === 'close') {
                    info.el.style.backgroundColor = 'red'; // Cambia 'red' por el color que desees
                }
            });
        }
    });

    calendar.render();
});


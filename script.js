document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

let selectedDate = null; // Variable para almacenar la fecha seleccionada
let calendarInstance = null; // Variable global para la instancia del calendario

function initializeApp() {
    [
        initializeUserProfile,
        initializeCalendar,
        initializeTasks,
        setupNavigation,
        setupUserId
    ].forEach(fn => fn());
}

// --- Configuración del Calendario ---
function initializeCalendar() {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;

    // Crear instancia del calendario
    calendarInstance = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'es',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        selectable: true,
        dateClick: handleDateClick,
        events: [] // Eventos iniciales opcionales
    });

    calendarInstance.render();

    // Crear botón para añadir eventos
    const eventButton = createButton('Agregar Evento', showAddEventForm);
    eventButton.classList.add('add-event-button');
    calendarEl.parentElement.insertBefore(eventButton, calendarEl);
}

// Función para manejar la selección de fecha
function handleDateClick(info) {
    selectedDate = info.dateStr; // Almacena la fecha seleccionada
    const dayTasksEl = document.getElementById('day-tasks'); // Contenedor para mostrar eventos
    updateDayTasks(selectedDate, dayTasksEl); // Actualiza la lista de eventos para esa fecha
}

// Actualizar tareas y eventos del día
function updateDayTasks(dateStr, dayTasksEl) {
    const dayEvents = calendarInstance.getEvents().filter(event => event.startStr.startsWith(dateStr));
    dayTasksEl.innerHTML = `
        <h3>Tareas y Eventos para el ${dateStr}</h3>
        ${dayEvents.length 
            ? `<ul>${dayEvents.map(event => `<li>${event.title} (${formatEventTime(event)})</li>`).join('')}</ul>`
            : '<p>No hay tareas ni eventos para este día.</p>'}`;
}

// Formatea la hora de un evento
function formatEventTime(event) {
    if (event.allDay) {
        return 'Todo el día';
    }
    const startTime = new Date(event.start).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const endTime = event.end 
        ? new Date(event.end).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) 
        : '';
    return `${startTime}${endTime ? ` - ${endTime}` : ''}`;
}

// Mostrar formulario para agregar evento
function showAddEventForm() {
    if (selectedDate) {
        // Crear un modal para el ingreso del título del evento
        const modal = document.createElement('div');
        modal.classList.add('modal');

        modal.innerHTML = `
            <div class="modal-content">
                <h3>Agregar Evento</h3>
                <p>Fecha seleccionada: ${selectedDate}</p>
                <input type="text" id="event-title" placeholder="Título del evento" />
                <div class="modal-actions">
                    <button id="save-event">Guardar</button>
                    <button id="cancel-event">Cancelar</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Manejar botones del modal
        document.getElementById('save-event').addEventListener('click', () => {
            const eventTitle = document.getElementById('event-title').value.trim();
            if (eventTitle) {
                addEvent(eventTitle);
                closeModal(modal);
            } else {
                alert('Por favor, ingresa un título para el evento.');
            }
        });

        document.getElementById('cancel-event').addEventListener('click', () => {
            closeModal(modal);
        });
    } else {
        showNotification('Selecciona un día en el calendario antes de agregar un evento.', 'error');
    }
}

function closeModal(modal) {
    document.body.removeChild(modal);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.classList.add('notification', type);
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        document.body.removeChild(notification);
    }, 3000); // Se elimina automáticamente después de 3 segundos
}


// Función para agregar un evento
function addEvent(title) {
    if (calendarInstance && selectedDate) {
        calendarInstance.addEvent({
            title: title,
            start: selectedDate
        });
        updateDayTasks(selectedDate, document.getElementById('day-tasks'));
    } else {
        alert('No se pudo agregar el evento. Asegúrate de haber seleccionado una fecha.');
    }
}

// --- Funciones Comunes ---
function createButton(text, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = 'btn btn-sm';
    button.addEventListener('click', onClick);
    return button;
}

// --- Gestión del Perfil de Usuario ---
function initializeUserProfile() {
    const profileForm = document.getElementById('profile-form');
    const profileDisplay = document.getElementById('profile-display');
    if (!profileForm || !profileDisplay) return;

    profileForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();

        if (name && email) {
            updateProfileDisplay({ name, email });
            toggleVisibility(profileForm, profileDisplay);
        } else {
            alert('Por favor, completa todos los campos.');
        }
    });

    document.getElementById('edit-profile').addEventListener('click', () => 
        toggleVisibility(profileDisplay, profileForm)
    );
}

function updateProfileDisplay({ name, email }) {
    document.getElementById('display-name').textContent = `Nombre: ${name}`;
    document.getElementById('display-email').textContent = `Email: ${email}`;
}

function toggleVisibility(...elements) {
    elements.forEach((el, index) => {
        if (el) el.style.display = index === 0 ? 'none' : 'block';
    });
}

// --- Gestión de Tareas ---
// Lista de tareas predefinidas
const predefinedTasks = [
    'Leer un libro',
    'Ir al gimnasio',
    'Preparar una comida saludable',
    'Aprender algo nuevo',
    'Salir a caminar',
    'Meditar por 10 minutos',
    'Organizar tu espacio de trabajo',
    'Llamar a un amigo o familiar',
    'Ver un documental',
    'Escribir en tu diario'
];

// Función para obtener una tarea aleatoria
function getRandomTask() {
    const randomIndex = Math.floor(Math.random() * predefinedTasks.length);
    return predefinedTasks[randomIndex];
}

// Función para añadir una tarea a la lista
function addTask(input, taskList) {
    const taskText = input.value.trim();
    if (!taskText) return;

    const listItem = document.createElement('li');
    listItem.textContent = taskText;
    listItem.appendChild(createButton('Eliminar', () => taskList.removeChild(listItem)));
    taskList.appendChild(listItem);

    input.value = '';
}

// Función para crear un botón
function createButton(text, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = 'btn btn-sm';
    button.addEventListener('click', onClick);
    return button;
}

// Inicializar tareas
function initializeTasks() {
    const taskList = document.getElementById('task-list');
    const addTaskButton = document.getElementById('add-task');
    const newTaskInput = document.getElementById('new-task');

    if (!taskList || !addTaskButton || !newTaskInput) return;

    addTaskButton.addEventListener('click', () => addTask(newTaskInput, taskList));
    newTaskInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') addTask(newTaskInput, taskList);
    });
}

// Event listener para el botón de sugerir tarea
document.getElementById('suggest-task').addEventListener('click', () => {
    const taskList = document.getElementById('task-list');
    const randomTask = getRandomTask();
    addTask({value: randomTask}, taskList);
});

// Inicializar tareas al cargar la página
document.addEventListener('DOMContentLoaded', initializeTasks);


// --- Configuración de Usuario ---
function setupUserId() {
    if (!localStorage.getItem('userId')) {
        localStorage.setItem('userId', Math.random().toString(36).substring(2, 15));
    }
}

// --- Navegación ---
function setupNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showSection(link.getAttribute('href').substring(1));
        });
    });
    showSection('perfil');
}

function showSection(sectionId) {
    document.querySelectorAll('section').forEach(section => 
        section.style.display = section.id === sectionId ? 'block' : 'none'
    );
}       
function desactivarBoton() {
    const botonConsulta = document.querySelector("#botonConsulta")
    botonConsulta.disabled = true
    botonConsulta.innerText = "Consultando..."
  }

  function activarBoton() {
    const botonConsulta = document.querySelector("#botonConsulta")
    botonConsulta.disabled = false
    botonConsulta.innerText = "Consultar"
  }
  function showNotification(message, type = '') { 
    const notification = document.createElement('div'); 
    notification.className = `notification ${type}`; 
    notification.innerText = message; document.body.appendChild(notification); 
    setTimeout(() => { notification.style.opacity = '0'; 
    setTimeout(() => notification.remove(), 500); }, 3000); 
}



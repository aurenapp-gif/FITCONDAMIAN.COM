// Las 5 guías gratuitas (lead magnets). Cada una resuelve un problema pequeño y diario
// del avatar, con algo que hacer HOY y un plan corto. Se publican en /guias/<slug>.

export type Guia = {
  slug: string;
  n: string;
  tag: string;
  titulo: string;        // nombre principal (lo que la engancha)
  sub: string;           // promesa concreta
  dolor: string;         // cómo lo vive ella, con sus palabras
  porque: string[];      // por qué le pasa (sin culpa)
  hoy: { t: string; d: string }[];          // "Hazlo hoy": acciones inmediatas
  planTitulo: string;
  plan: { k: string; t: string; d: string }[]; // plan de 7 días / 4 semanas
  extraTitulo?: string;
  extra?: { t: string; d: string }[];       // herramienta extra (regla, semáforo, ejemplos…)
  check: string[];       // checklist para marcar
  medico?: string;       // cuándo consultar con un profesional
};

export const GUIAS: Guia[] = [
  {
    slug: "duerme-del-tiron",
    n: "01",
    tag: "Sueño",
    titulo: "Duerme del Tirón",
    sub: "7 noches para dejar de despertarte a las 3 de la mañana",
    dolor:
      "Te acuestas agotada, pero a las 3 o las 4 de la mañana abres los ojos: calor, la cabeza dando vueltas, y ya no hay manera de volver a dormirte. Al día siguiente vas a medio gas, con más hambre y cero ganas de moverte.",
    porque: [
      "En la perimenopausia y la menopausia bajan los estrógenos y la progesterona, y eso afecta a la temperatura del cuerpo y a la calidad del sueño. Por eso aparecen los sofocos y los despertares de madrugada.",
      "El alcohol de la cena, el café de la tarde y cenar tarde o muy fuerte hacen que esos despertares sean más frecuentes.",
      "No es falta de voluntad ni «cosas de la edad» que haya que aguantar: con unos cambios concretos la mayoría de mujeres duerme bastante mejor en pocas semanas.",
    ],
    hoy: [
      { t: "Baja la temperatura del dormitorio", d: "Entre 18 y 19 °C. Pijama y sábanas finas de algodón o lino, y un vaso de agua fresca en la mesilla." },
      { t: "Último café antes de las 14:00", d: "Y esta noche, sin alcohol. Es lo que más despertares de madrugada provoca." },
      { t: "Cena 2–3 horas antes de acostarte", d: "Con proteína (pescado, huevo, pollo, legumbre) y verdura. Ligera, pero que te sacie." },
      { t: "Prepara tu rutina de las 3 a. m.", d: "Si te despiertas: no mires el móvil ni la hora. Coge aire en 4 segundos y suéltalo en 6, diez veces. Si a los 20 minutos sigues despierta, levántate con luz tenue y vuelve a la cama cuando te entre el sueño." },
    ],
    planTitulo: "Plan de 7 noches",
    plan: [
      { k: "Noche 1", t: "El dormitorio", d: "Temperatura, oscuridad total (persiana o antifaz) y el móvil fuera de la mesilla." },
      { k: "Noche 2", t: "Hora fija para levantarte", d: "Elige una hora y cúmplela todos los días, también el fin de semana. Es lo que más ordena el sueño." },
      { k: "Noche 3", t: "Luz por la mañana", d: "10 minutos de luz de día nada más levantarte: un paseo corto o el café junto a la ventana." },
      { k: "Noche 4", t: "Cena que te ayuda", d: "Proteína + verdura + una ración pequeña de hidrato (patata, arroz, pan integral). Nada de picar después." },
      { k: "Noche 5", t: "Desconexión de 30 minutos", d: "Media hora antes de acostarte: luces bajas, sin pantallas, ducha templada o lectura." },
      { k: "Noche 6", t: "Mueve el cuerpo de día", d: "Entrena fuerza o camina 30 minutos, mejor por la mañana o a media tarde, no justo antes de dormir." },
      { k: "Noche 7", t: "Revisa tu registro", d: "Cuenta cuántas veces te has despertado cada noche y quédate con lo que más te ha funcionado." },
    ],
    check: [
      "Dormitorio a 18–19 °C y a oscuras",
      "Último café antes de las 14:00",
      "Sin alcohol entre semana",
      "Cena 2–3 horas antes de acostarme",
      "Misma hora de levantarme todos los días",
      "10 minutos de luz por la mañana",
      "Sé qué hacer si me despierto a las 3",
    ],
    medico:
      "Consulta con tu médico si roncas fuerte, alguien ha notado que haces pausas al respirar, te despiertas con dolor de cabeza o el insomnio dura más de unas semanas pese a estos cambios. Los sofocos muy intensos también tienen tratamiento: coméntalo con tu ginecóloga.",
  },
  {
    slug: "ataque-de-las-7",
    n: "02",
    tag: "Antojos",
    titulo: "El Ataque de las 7 de la Tarde",
    sub: "Frena el picoteo de la tarde-noche sin tirar de fuerza de voluntad",
    dolor:
      "Por el día lo haces bien. Pero a partir de las 6 o las 7 abres la nevera, «un poquito de esto, un poquito de lo otro», y cuando te das cuenta has picado más que en toda la comida. Luego llega la culpa.",
    porque: [
      "Casi nunca es falta de voluntad: es hambre acumulada. Si el desayuno y la comida llevan poca proteína, a media tarde el cuerpo te la pide de golpe.",
      "El cansancio y el mal sueño aumentan las ganas de dulce y de comida rápida.",
      "Llegar a casa cansada, con la comida a la vista, es la situación perfecta para picar. Cambiando el entorno, cambia el resultado.",
    ],
    hoy: [
      { t: "Planifica tu merienda antes de las 18:00", d: "Con proteína y algo de fibra. Tienes 5 ideas abajo. No la improvises cuando ya tengas hambre." },
      { t: "Saca de la vista lo que te hace picar", d: "Galletas, patatas, frutos secos a granel: a un armario alto o fuera de casa. En la encimera, fruta." },
      { t: "Usa la regla de los 10 minutos", d: "Cuando te entre el antojo: un vaso de agua o una infusión y sal de la cocina. Si a los 10 minutos sigue el hambre, come algo de tu lista «sí»." },
    ],
    extraTitulo: "5 meriendas que cortan el ataque",
    extra: [
      { t: "Yogur griego natural + frutos rojos", d: "Con una cucharada de semillas o nueces." },
      { t: "Tostada integral + pavo o atún", d: "Con tomate o aguacate." },
      { t: "2 huevos cocidos + una pieza de fruta", d: "Se preparan para toda la semana en 10 minutos." },
      { t: "Queso fresco batido + canela + manzana", d: "Dulce sin azúcar añadido." },
      { t: "Hummus + palitos de zanahoria y pepino", d: "Con un puñado pequeño de frutos secos." },
    ],
    planTitulo: "Plan de 7 días",
    plan: [
      { k: "Día 1", t: "Detecta tu hora", d: "Apunta a qué hora te entra el ataque, dónde estás y cómo te sientes (cansada, aburrida, nerviosa)." },
      { k: "Día 2", t: "Desayuno con proteína", d: "Entre 25 y 30 g: por ejemplo, 2 huevos + tostada, o yogur griego + queso fresco + fruta." },
      { k: "Día 3", t: "Comida que sacia", d: "Medio plato de verdura, un cuarto de proteína y un cuarto de hidrato. Sin saltarte la comida." },
      { k: "Día 4", t: "La despensa", d: "Haz la compra con la lista «sí» y deja fuera lo que te hace picar." },
      { k: "Día 5", t: "Merienda fija", d: "Elige 2 de las 5 meriendas y déjalas preparadas para toda la semana." },
      { k: "Día 6", t: "Plan para el momento crítico", d: "Decide qué haces al llegar a casa: ducha, paseo corto, llamar a alguien… algo que no sea la cocina." },
      { k: "Día 7", t: "Revisa", d: "Compara cuántas veces has picado esta semana con la anterior. Quédate con lo que te ha funcionado." },
    ],
    check: [
      "Desayuno con 25–30 g de proteína",
      "Comida completa, sin saltarla",
      "Merienda planificada antes de las 18:00",
      "Nada de picoteo a la vista",
      "Uso la regla de los 10 minutos",
      "Sé a qué hora me entra el ataque",
    ],
  },
  {
    slug: "desinfla-tu-tripa",
    n: "03",
    tag: "Hinchazón",
    titulo: "Desinfla tu Tripa en 7 Días",
    sub: "Por qué te levantas con la tripa plana y por la noche no te abrocha el pantalón",
    dolor:
      "Por la mañana tu tripa está bien. A media tarde empieza a hincharse y por la noche pareces embarazada de cinco meses. Te cambias de ropa, te sientes pesada y no sabes qué es lo que te sienta mal.",
    porque: [
      "Esa tripa que cambia a lo largo del día no es grasa: es hinchazón (gases y digestión lenta). La grasa no aparece y desaparece en unas horas.",
      "Con los cambios hormonales de esta etapa la digestión y el tránsito se vuelven más lentos, y el estreñimiento es muy frecuente.",
      "Comer deprisa, el chicle, las bebidas con gas y subir la fibra de golpe hacen que tragues más aire y fermente más.",
    ],
    hoy: [
      { t: "Come despacio", d: "Dedica 20 minutos a cada comida y suelta el tenedor entre bocado y bocado." },
      { t: "Camina 10 minutos después de comer y de cenar", d: "Es de lo que más ayuda a vaciar el estómago y mover los gases." },
      { t: "Quita el chicle y las bebidas con gas", d: "Durante esta semana, agua, infusiones (menta, hinojo, jengibre) y agua con limón." },
      { t: "Empieza tu diario", d: "Apunta qué comes y cómo está tu tripa del 0 al 10 por la noche. En 7 días verás tus culpables." },
    ],
    planTitulo: "Plan de 7 días",
    plan: [
      { k: "Día 1", t: "Diario y cena temprana", d: "Empieza a anotar y cena al menos 2 horas antes de acostarte." },
      { k: "Día 2", t: "Agua repartida", d: "Un vaso al levantarte y uno con cada comida y entre horas, en vez de mucha de golpe." },
      { k: "Día 3", t: "Fibra poco a poco", d: "Añade una sola ración extra de verdura o fruta al día. Si subes la fibra de golpe, hincha más." },
      { k: "Día 4", t: "Rutina de baño", d: "Siéntate en el baño a la misma hora cada día, sin prisas, idealmente después del desayuno." },
      { k: "Día 5", t: "Revisa los sospechosos", d: "Mira en tu diario los días de 7 o más: ¿qué tenían en común? (lácteos, legumbre, cebolla, pan, dulces…)." },
      { k: "Día 6", t: "Prueba sin uno", d: "Reduce solo uno de esos sospechosos durante unos días y compara. Uno cada vez, nunca todos a la vez." },
      { k: "Día 7", t: "Tu lista", d: "Escribe tus 2 o 3 alimentos que más te hinchan y cómo tomarlos (menos cantidad, mejor cocinados, a mediodía)." },
    ],
    check: [
      "Como despacio, unos 20 minutos",
      "Camino 10 minutos después de comer y cenar",
      "Sin chicle ni bebidas con gas",
      "Agua repartida durante el día",
      "Subo la fibra poco a poco",
      "Relleno mi diario de tripa",
    ],
    medico:
      "Consulta con tu médico si la hinchazón dura más de unas 3 semanas, va a más, o viene con dolor, sangrado, cambios en el ritmo intestinal, pérdida de peso sin motivo o sensación de llenarte enseguida. Es importante descartar otras causas.",
  },
  {
    slug: "rodillas-de-hierro",
    n: "04",
    tag: "Articulaciones",
    titulo: "Rodillas de Hierro",
    sub: "Entrena y vuelve al pádel sin miedo al dolor",
    dolor:
      "Te gustaría entrenar o volver al pádel, pero te crujen las rodillas, te duelen al subir escaleras o al levantarte del sofá, y tienes miedo de hacerte daño. Así que lo vas dejando… y cada mes cuesta más.",
    porque: [
      "Con los años y con la menopausia perdemos músculo, y unos cuádriceps y glúteos débiles hacen que la rodilla soporte más carga.",
      "Quedarte parada no protege la rodilla: la debilita. El ejercicio de fuerza bien dosificado es de lo que más ayuda a reducir el dolor.",
      "La clave no es evitar el movimiento, sino empezar con ejercicios que la rodilla tolera bien e ir subiendo poco a poco.",
    ],
    hoy: [
      { t: "Haz la rutina de 12 minutos", d: "Sin material, en casa. La tienes justo debajo." },
      { t: "Usa el semáforo del dolor", d: "Mientras haces los ejercicios, puntúa el dolor del 0 al 10. Lo explicamos abajo." },
      { t: "Calienta siempre 5 minutos", d: "Antes de caminar, entrenar o jugar al pádel: marcha en el sitio, círculos de rodilla y tobillo y 10 sentadillas a una silla." },
    ],
    extraTitulo: "La rutina de 12 minutos (3 vueltas)",
    extra: [
      { t: "Puente de glúteo · 12 repeticiones", d: "Tumbada boca arriba, pies apoyados: sube la cadera apretando glúteos y baja despacio." },
      { t: "Sentarse y levantarse de una silla · 10", d: "Sin ayudarte con las manos si puedes. Baja despacio, en 3 segundos." },
      { t: "Sentadilla en la pared · 20–30 segundos", d: "Espalda apoyada en la pared, rodillas poco flexionadas. Aguanta quieta." },
      { t: "Subir a un escalón bajo · 8 por pierna", d: "Agárrate a la barandilla. Sube con una pierna y baja despacio." },
      { t: "Elevaciones de talones · 15", d: "De pie, sube a puntillas y baja controlando." },
    ],
    planTitulo: "Plan de 4 semanas (3 días por semana)",
    plan: [
      { k: "Semana 1", t: "Aprende la técnica", d: "2 vueltas de la rutina. Movimientos lentos y sin dolor por encima de 3 sobre 10." },
      { k: "Semana 2", t: "Más volumen", d: "3 vueltas. La sentadilla en la pared hasta 30 segundos." },
      { k: "Semana 3", t: "Más control", d: "Baja en 4 segundos en la silla y el escalón. Silla un poco más baja si va bien." },
      { k: "Semana 4", t: "Hacia la pista", d: "Añade 2 minutos de pasos laterales y pequeños cambios de dirección. Si todo va bien, peloteo suave de pádel." },
    ],
    check: [
      "Hago la rutina 3 días por semana",
      "Caliento 5 minutos antes de moverme",
      "Respeto el semáforo del dolor",
      "Subo la dificultad poco a poco",
      "Camino a diario",
    ],
    medico:
      "Semáforo del dolor: de 0 a 3 sobre 10, puedes seguir; de 4 a 5, baja la intensidad; más de 5, o si al día siguiente está peor, para y consulta. Ve al médico o a un fisioterapeuta si la rodilla se hincha, se bloquea, falla al apoyar o el dolor empezó tras un golpe o una torcedura.",
  },
  {
    slug: "el-lunes-ya-no-empieza-de-cero",
    n: "05",
    tag: "Fin de semana",
    titulo: "El Lunes Ya No Empieza de Cero",
    sub: "Disfruta del fin de semana sin perder lo que has conseguido",
    dolor:
      "De lunes a viernes lo haces perfecto. Llega el sábado: comida familiar, unas copas, la cena con amigas… y el lunes te sientes hinchada, culpable y con la sensación de empezar otra vez de cero.",
    porque: [
      "No es el fin de semana: es el todo o nada. Si entre semana eres muy estricta, el sábado el cuerpo y la cabeza se desquitan.",
      "El alcohol abre el apetito, empeora el sueño y hace que el domingo tengas más hambre y menos ganas de moverte.",
      "Compensar el lunes sin comer solo alarga el ciclo. Lo que funciona es tener un plan sencillo para el fin de semana.",
    ],
    hoy: [
      { t: "Antes de salir, decide tu capricho", d: "Uno: el postre, el pan, o las copas. Elige uno y disfrútalo sin culpa." },
      { t: "En la mesa, empieza por proteína y verdura", d: "Primero el plato que sacia. Llegarás al capricho con menos hambre." },
      { t: "Estrategia de las copas", d: "Decide cuántas antes de salir. Cada copa, un vaso de agua. Mejor vino o una caña que combinados con refresco." },
    ],
    planTitulo: "El plan del fin de semana",
    plan: [
      { k: "Viernes", t: "Organiza", d: "Mira qué planes tienes y decide dónde va tu capricho. Deja hecha la compra del lunes." },
      { k: "Sábado", t: "Mueve el cuerpo", d: "Paseo largo, una ruta o un partido de pádel. Un desayuno con proteína antes de salir de casa." },
      { k: "Domingo", t: "Vuelta suave", d: "Comidas sencillas, mucha agua, verdura y a dormir a tu hora." },
      { k: "Lunes", t: "Reinicio sin castigo", d: "Tu desayuno y tu entrenamiento de siempre. Nada de saltarte comidas para compensar." },
    ],
    extraTitulo: "La regla del 80/20",
    extra: [
      { t: "80 % de tus comidas, tu plan", d: "De las aproximadamente 28 comidas de la semana, unas 22 siguen tu plan." },
      { t: "20 % para disfrutar", d: "Unas 5 o 6 comidas son libres. Así se mantiene un año entero, no solo un mes." },
    ],
    check: [
      "Decido mi capricho antes de salir",
      "Empiezo por proteína y verdura",
      "Una copa, un vaso de agua",
      "Me muevo el sábado o el domingo",
      "Duermo a mi hora el domingo",
      "El lunes desayuno y entreno como siempre",
    ],
  },
];

export const guiaPorSlug = (slug: string) => GUIAS.find((g) => g.slug === slug);

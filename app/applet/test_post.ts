async function runTest() {
  console.log("Sending test POST to http://localhost:3000/api/diagnostico...");
  const payload = {
    leadData: {
      nombre: "Oscar Test",
      empresa: "Actual Internet Test",
      email: "oscar_test@actualinternet.com",
      telefono: "600000000",
      sector: "Tecnología",
      empleados: 5,
      rol: "Socio",
      scores: {
        global: 45
      },
      ahorro: {
        euros_anual: 12000,
        equivalente_staff: 0.5
      }
    },
    responses: [
      "¿Tiene página web?: Sí, básica",
      "¿Recibe consultas por web?: Sí, pero pocas",
      "¿Usa CRM?: No, usamos hojas de cálculo",
      "¿Automatiza tareas?: Prácticamente nada",
      "¿Interés en soluciones de IA?: Alto interés"
    ]
  };

  try {
    const res = await fetch("http://localhost:3000/api/diagnostico", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    console.log("Status Code:", res.status);
    console.log("Response Headers:", res.headers.get("content-type"));
    const text = await res.text();
    console.log("Response Body (Snippet):", text.substring(0, 500));
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

runTest();

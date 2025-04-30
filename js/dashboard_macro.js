document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("input-excel-dashboard");
  if (!input) return;

  input.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const cabecalhos = json[1].slice(3); // de 2015 em diante
      const anos = cabecalhos.map(ano => parseInt(ano)).filter(ano => ano >= 2015);

      const tbody = document.querySelector("#tabela-macro-itau tbody");
      const thead = document.querySelector("#tabela-macro-itau thead");
      tbody.innerHTML = "";
      thead.innerHTML = "";

      // Monta cabeçalho
      const headerRow = document.createElement("tr");
      headerRow.innerHTML = `<th>Variável</th>` + anos.map(a => `<th>${a}</th>`).join("");
      thead.appendChild(headerRow);

      // Percorre linhas úteis
      json.forEach(row => {
        const nomeVar = row[2];
        if (typeof nomeVar === "string" && nomeVar.length > 3 && !nomeVar.includes("Fonte")) {
          const valores = row.slice(3, 3 + anos.length).map(v =>
            typeof v === "number" ? v.toFixed(2) : "-"
          );
          const tr = document.createElement("tr");
          tr.innerHTML = `<td>${nomeVar}</td>` + valores.map(v => `<td>${v}</td>`).join("");
          tbody.appendChild(tr);
        }
      });
    };

    reader.readAsArrayBuffer(file);
  });
});

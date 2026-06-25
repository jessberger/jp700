function selectPump() {
  const flow = Number(document.getElementById("flow").value);
  const head = Number(document.getElementById("head").value);

  let result = "";

  if (flow <= 20 && head <= 40) {
    result = "Önerilen pompa: JP700-1";
  } else if (flow <= 50 && head <= 60) {
    result = "Önerilen pompa: JP700-2";
  } else {
    result = "Uygun pompa bulunamadı.";
  }

  document.getElementById("result").innerText = result;
}
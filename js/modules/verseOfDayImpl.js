export async function verseOfTheDay() {
  const response = await fetch(
    "https://www.resursecrestine.ro/web-api-versetul-zilei",
    {
      method: "GET",
      cache: "no-cache",
      headers: { "Content-Type": "text/plain" },
    }
  );

  if (response.ok) {
    // The API returns a script like: document.writeln('<verse>');document.write('<reference>');
    const text = await response.text();
    const parts = text.split("');");
    const verse = parts[0].replace("document.writeln('", "");
    const reference = parts[1].replace("document.write('", "");

    document.getElementById("verseOfDay").innerText = verse;
    document.getElementById("verseOfDayReference").innerHTML = reference;
    document.getElementById("verseOfDayReference").innerHTML =
      document.querySelector("#verseOfDayReference a").innerText;
  }
}

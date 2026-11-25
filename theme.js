const themeButton = document.getElementById("theme-btn1");
const savedTheme = localStorage.getItem("homie-theme") === "dark"
    ? "dark"
    : "light";
document.documentElement.setAttribute("data-theme", savedTheme);
function updateThemeButton(theme) {
    if (theme === "dark") {
        themeButton.textContent = "☀️ Light Mode";
    } else {
        themeButton.textContent = "🌙 Dark Mode";
    }
    themeButton.setAttribute("aria-pressed", String(theme === "dark"));
}
updateThemeButton(savedTheme);
themeButton.addEventListener("click", function() {
    const currentTheme =
        document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("homie-theme", newTheme);
    updateThemeButton(newTheme);
});
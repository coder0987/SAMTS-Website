function myFunction() {
    if (document.getElementById("body").className == 'lightTheme') {
        localStorage.theme = 'dark';
        document.getElementById("body").className = 'darkTheme';
    } else {
        localStorage.theme = 'light';
        document.getElementById("body").className = 'lightTheme';
    }
}
window.onload = function() {
    if (localStorage.getItem('theme')) {
        if (localStorage.theme == 'dark') {
            document.getElementById("body").className = 'darkTheme';
        } else if (localStorage.theme == 'light') {
            document.getElementById("body").className = 'lightTheme';
        } else {
            localStorage.theme = 'dark';
        }
    } else {
        localStorage.theme = 'dark';
    }
}

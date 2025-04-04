let Boton = document.getElementById("Boton")
let Principal_Nav = document.getElementById("Principal_Nav")
let Principal_Container = document.getElementById("Principal_Container")
Boton.addEventListener("click", async () => {

    if (window.innerWidth <= 900) {
        console.log("cambiar con el boton");

        Cambiar_FuncionesMenor900()
    } else {

        Principal_Nav.classList.toggle("cambio")
    }
})
Principal_Nav.addEventListener("click", async (e) => {
    let elemento = e.target
    console.log(elemento)

    if (elemento.classList.contains("Show_Nav")) {
        console.log("Si ");


        if (window.innerWidth <= 900) {
            console.log("Cambio con el mismo aside")

            Cambiar_FuncionesMenor900()

        }

    } else {
        console.log("No")
    }


    // else {

    //     Principal_Nav.classList.toggle("cambio")

    // }
})


function Cambiar_FuncionesMenor900() {
    Principal_Nav.classList.toggle("cambio_2")
    Principal_Nav.classList.toggle("Show_Nav")
    Principal_Nav.classList.contains("cambio") ? Principal_Nav.classList.remove("cambio") : console.log("No tiene cambio")

}